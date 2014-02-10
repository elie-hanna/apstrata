package com.apstrata.client.java.connection;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import net.sf.json.JSONObject;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;

import com.apstrata.client.java.Client;
import com.apstrata.client.java.Client.AuthMode;

import org.apache.log4j.Logger;

public class TokenConnection implements Connection {
	
	final static String ACTION 					= APSDB_PREFIX + "action";
	final static String TOKEN 					= APSDB_PREFIX + "authToken";
	final static String TOKEN_EXPIRES			= APSDB_PREFIX + "tokenExpires";
	final static String TOKEN_LIFETIME			= APSDB_PREFIX + "tokenLifetime";	
	final static double RENEWAL_THRESHOLD = 0.75;
	
	private static Logger logger = Logger.getLogger("com.apstrata.client.java"); 
	
	private String userName;
	private Connection userConnection;
	private Client client;
	private String token = null;
	private long tokenExpiry = 0;
	private long tokenExpiryTS = 0;
	private long connectionLifetime = 0;
	private long connectionLifetimeTS = 0;
	
	private TokenController controller;
			
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
		if (this.token == null) {
			success = this.generateToken();		
		} else {
			success = this.verifyToken();			
		}
		
		return success;
	}
	
	/**
     * switches off the automatic background token renewal. invoke this method before terminating the application.
     */
    public synchronized void terminate() {
         
    	if (this.controller != null) {
    		
    		this.controller.stopTokenManagement();
    		logger.debug(this.getClass().getName() + " Stopping authentication token management");
    	}
    }
	
	protected synchronized boolean renewToken() {
		
		boolean success = false;
		
		logger.debug(this.getClass().getName() + " renewing token " + this.token);
		
		List<NameValuePair> params = new ArrayList<NameValuePair>();
		params.add(new BasicNameValuePair(ACTION, "renew"));
		params.add(new BasicNameValuePair(USER, this.userName));
		
		client.setConn(this);
		try {
			
			String resp = client.callAPIJson("VerifyCredentials", params, null, AuthMode.SIMPLE);			
			JSONObject jresp = JSONObject.fromObject(resp).getJSONObject("response");
			String status = jresp.getJSONObject("metadata").getString("status");
			if (status != null && status.equals("success")) {
				JSONObject result = jresp.getJSONObject("result");
				this.token = result.getString(TOKEN);
				success = true;
				logger.debug(this.getClass().getName() + "new token retrieved " + this.token);			
			}
			
		} catch (Exception e) {
			logger.debug(this.getClass().getName(), e);

		} finally {
			client.setConn(this.userConnection);
		}
		
		return success;
	}

	protected synchronized boolean generateToken() {
		boolean success = false;
		
		logger.debug(this.getClass().getName() + " generating new token to replace " + this.token);
		
		List<NameValuePair> params = new ArrayList<NameValuePair>();
		params.add(new BasicNameValuePair(ACTION, "generate"));
		if (this.tokenExpiry > 0) {
			params.add(new BasicNameValuePair(TOKEN_EXPIRES, String.valueOf(this.tokenExpiry)));
		}
		if (this.connectionLifetime > 0) {
			params.add(new BasicNameValuePair(TOKEN_LIFETIME, String.valueOf(this.connectionLifetime)));
		}
		long timeStamp = System.currentTimeMillis();
		
		try {
			String resp = this.client.callAPIJson("VerifyCredentials", params, null, AuthMode.SIMPLE);
			JSONObject jresp = JSONObject.fromObject(resp).getJSONObject("response");
			String status = jresp.getJSONObject("metadata").getString("status");
			if (status != null && status.equals("success")) {
				JSONObject result = jresp.getJSONObject("result");				
				this.token = result.getString(TOKEN);				
				this.tokenExpiry = result.getLong(TOKEN_EXPIRES);
				this.tokenExpiryTS = timeStamp + 1000 * this.tokenExpiry;				
				this.connectionLifetime = result.getLong(TOKEN_LIFETIME);
				this.connectionLifetimeTS = timeStamp + 1000 * this.connectionLifetime;				
				logger.debug(this.getClass().getName() + " new token generated " + this.token + " / " + this.tokenExpiry + " / " + this.connectionLifetime);
				success = true;				
				if (this.controller == null) {
					this.createController();
				}				
			}
			
		} catch (Exception e) {
			logger.debug(this.getClass().getName(), e);
			
		}
		
		return success;
	}
	
	private boolean verifyToken() {
		
		boolean success = false;
		
		logger.debug(this.getClass().getName() + " verifying token " + this.token);
		
		List<NameValuePair> params = new ArrayList<NameValuePair>();
		params.add(new BasicNameValuePair(USER, this.userName));
		
		client.setConn(this);
		try {
			String resp = client.callAPIJson("VerifyCredentials", params, null, AuthMode.SIMPLE);
			
			JSONObject jresp = JSONObject.fromObject(resp).getJSONObject("response");
			String status = jresp.getJSONObject("metadata").getString("status");
			if (status != null && status.equals("success")) {
				logger.debug(this.getClass().getName() + "token is still valid " + this.token);
				success = true;
			}
			
		} catch (Exception e) {
			logger.debug(this.getClass().getName(), e);

		} finally {
			client.setConn(this.userConnection);
		}
		
		return success;
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
		
	public String getToken() {
		return this.token;
	}

	public long getTokenExpires() {
		return this.tokenExpiryTS;
	}

	public long getTokenLifetime() {
		return this.connectionLifetimeTS;
	}
	
	private void createController() {
		
		this.controller = new TokenController(this, this.tokenExpiry, this.connectionLifetime, RENEWAL_THRESHOLD);
		this.controller.startTokenManagement();
		// we normally should not need the below unless Apstrata changed the values for the new token
		/* else {
			this.controller.setRenew(this.connectionLifetime);
			this.controller.setRegenerate(this.tokenExpiry);			
		}*/		
	}
}
