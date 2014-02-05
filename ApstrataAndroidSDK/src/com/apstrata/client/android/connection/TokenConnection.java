package com.apstrata.client.android.connection;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONObject;

import android.os.Looper;
import android.os.SystemClock;
import android.util.Log;

import com.apstrata.client.android.Client;
import com.apstrata.client.android.Client.AuthMode;

public class TokenConnection implements Connection {
	
	final static String ACTION 					= APSDB_PREFIX + "action";
	final static String TOKEN 					= APSDB_PREFIX + "authToken";
	final static String TOKEN_EXPIRES			= APSDB_PREFIX + "tokenExpires";
	final static String TOKEN_LIFETIME			= APSDB_PREFIX + "tokenLifetime";
	
	final static double RENEWAL_THRESHOLD = 0.75;
	
	private String userName;
	private Connection userConnection;
	private Client client;
	
	private String token = null;
	
	private long tokenCreationTS = 0;
	
	private long tokenExpiry = 0;
	private long tokenExpiryTS = 0;
	
	private long connectionLifetime = 0;
	private long connectionLifetimeTS = 0;
	private TokenCountDownTimer trt;
	
	
	public TokenConnection(String baseUrl, String accountKey, String userName, String userPassword) throws Exception {
		this.userName = userName;
		this.userConnection = new UserConnection(baseUrl, accountKey, userName, userPassword);
		this.client = new Client(baseUrl, accountKey, this.userConnection);
	}
	
	public TokenConnection(String baseUrl, String accountKey, String userName, String userPassword, long tokenExpiry, long tokenLifetime) throws Exception {
		this(baseUrl, accountKey, userName, userPassword);
		this.tokenExpiry = tokenExpiry;
		this.connectionLifetime = tokenLifetime;
	}
	
	synchronized public boolean validateToken() throws Exception {
		boolean success = false;
		
		long currentTimeStamp = SystemClock.elapsedRealtime(); // System.currentTimeMillis();
		
		if (this.token != null && this.tokenExpiryTS > currentTimeStamp && this.connectionLifetimeTS > currentTimeStamp) {
			// token sounds valid
			Log.d(this.getClass().getName(), "token apparently valid, expiry not reached, lifetime not reached");
			success = true;
		}
		else if (this.token == null) {
			// token not yet generated => generate a new token
			Log.d(this.getClass().getName(), "token not yet initialized");
			success = this.generateToken();
		}
		else if (currentTimeStamp >= this.connectionLifetimeTS) {
			// token lifetime elapsed => generate a new token
			Log.d(this.getClass().getName(), "token lifetime exceeded");
			success = this.generateToken();
		}
		else if (currentTimeStamp >= this.tokenExpiryTS) {
			// token expired => renew
			Log.d(this.getClass().getName(), "token expiry exceeded");
			success = this.renewToken();
		}
		
		return success;
	}
	
	private boolean renewToken() {
		boolean success = false;
		
		Log.d(this.getClass().getName(), "renewing token " + this.token);
		
		List<NameValuePair> params = new ArrayList<NameValuePair>();
		params.add(new BasicNameValuePair(ACTION, "renew"));
		params.add(new BasicNameValuePair(USER, this.userName));
		
		client.setConn(this);
		try {
			String resp = client.callAPIJson("VerifyCredentials", params, null, AuthMode.SIMPLE);
			
			JSONObject jresp = (new JSONObject(resp)).getJSONObject("response");
			String status = jresp.getJSONObject("metadata").getString("status");
			if (status != null && status.equals("success")) {
				JSONObject result = jresp.getJSONObject("result");
				this.token = result.getString(TOKEN);
				Log.d(this.getClass().getName(), "new token retrieved " + this.token);
				success = true;
			}
			
		} catch (Exception e) {
			Log.d(this.getClass().getName(), Log.getStackTraceString(e));

		} finally {
			client.setConn(this.userConnection);
		}
		
		return success;
	}

	private boolean generateToken() {
		boolean success = false;
		
		Log.d(this.getClass().getName(), "generating new token to replace " + this.token);
		
		List<NameValuePair> params = new ArrayList<NameValuePair>();
		params.add(new BasicNameValuePair(ACTION, "generate"));
		if (this.tokenExpiry > 0) {
			params.add(new BasicNameValuePair(TOKEN_EXPIRES, String.valueOf(this.tokenExpiry)));
		}
		if (this.connectionLifetime > 0) {
			params.add(new BasicNameValuePair(TOKEN_LIFETIME, String.valueOf(this.connectionLifetime)));
		}
		long timeStamp = SystemClock.elapsedRealtime(); //System.currentTimeMillis();
		
		try {
			String resp = this.client.callAPIJson("VerifyCredentials", params, null, AuthMode.SIMPLE);
			JSONObject jresp = (new JSONObject(resp)).getJSONObject("response");
			String status = jresp.getJSONObject("metadata").getString("status");
			if (status != null && status.equals("success")) {
				JSONObject result = jresp.getJSONObject("result");
				
				this.token = result.getString(TOKEN);
				
				this.tokenExpiry = result.getLong(TOKEN_EXPIRES);
				this.tokenExpiryTS = timeStamp + 1000 * this.tokenExpiry;
				
				this.connectionLifetime = result.getLong(TOKEN_LIFETIME);
				this.connectionLifetimeTS = timeStamp + 1000 * this.connectionLifetime;
				
				this.tokenCreationTS = timeStamp;
				
				Log.d(this.getClass().getName(), "new token generated " + this.token + " / " + this.tokenExpiry + " / " + this.connectionLifetime);
				success = true;
				
				this.setupTokenRenewalTimer();
			}
			
		} catch (Exception e) {
			Log.d(this.getClass().getName(), Log.getStackTraceString(e));
			
		}
		
		return success;
	}
	
	private void setupTokenRenewalTimer() {
		final long countDownInterval = (long) (this.tokenExpiry * 1000 * RENEWAL_THRESHOLD);
		final long timerFinish = (long) ((this.connectionLifetime - (this.connectionLifetime % this.tokenExpiry)) * 1000);
		
		Log.d(this.getClass().getName(), "setting up timer " + countDownInterval/1000 + " / " + timerFinish/1000);
		
		boolean firsttime = (this.trt == null);
		if (firsttime) {
			Looper.prepare();
		} else {
			this.trt.cancel();
		}
		
		this.trt = new TokenCountDownTimer(timerFinish, countDownInterval) {
			@Override
			public void onTick(long millisUntilFinished) {
				Log.d(this.getClass().getName(), "timer firing now");

				// the timer fires immediately. so we want to skip the first time it fires
				if (TokenConnection.this.tokenCreationTS + countDownInterval <= SystemClock.elapsedRealtime()) {
					if (millisUntilFinished > TokenConnection.this.tokenExpiry) {
						Log.d(this.getClass().getName(), "normal timer execute");
						// if we have at least a full interval before 'finish', renew the token and go back to sleep
						TokenConnection.this.renewToken();
					}
					else {
						// if we have less than a full interval before 'finish', force an onFinish event
						Log.d(this.getClass().getName(), "force finish timer execute");
						this.cancel();
						this.onFinish();
					}
				} else {
					Log.d(this.getClass().getName(), "ignoring immediate first tick of timer");
				}
			}
			
			@Override
			public void onFinish() {
				TokenConnection.this.generateToken();
			}
		};
		this.trt.start();
		
		if (firsttime) {
			Looper.loop();
		}
	}
	
	public List<NameValuePair> getSimpleRequestSignature(String action, List<NameValuePair> parameters, Map<String, List<File>> files) throws Exception {
		long timeStamp = System.currentTimeMillis();
		
		List<NameValuePair> reqSignature = new ArrayList<NameValuePair>();
		
		reqSignature.add(new BasicNameValuePair(TIME_STAMP, String.valueOf(timeStamp)));
		reqSignature.add(new BasicNameValuePair(TOKEN, this.token));
		
		return reqSignature;
	}

	public List<NameValuePair> getComplexRequestSignature(String action, List<NameValuePair> parameters, Map<String, List<File>> files) throws Exception {
		return getSimpleRequestSignature(action, parameters, files);
	}
	
	public void terminate() {
		if (this.trt != null) {
			this.trt.cancel();
			Log.d(this.getClass().getName(), "renewal timer cancelled");
		}
	}
	
	public String getToken() {
		return this.token;
	}

	public long getTokenExpires() {
		return this.tokenExpiryTS;
	}

	public long getTokenLifetime() {
		return this.connectionLifetimeTS;
	}
}
