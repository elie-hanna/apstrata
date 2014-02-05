package com.elementn.android.testapp;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.http.NameValuePair;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONObject;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.apstrata.client.android.Client;
import com.apstrata.client.android.MySSLSocketFactory;
import com.apstrata.client.android.connection.AnonymousConnection;
import com.apstrata.client.android.connection.Connection;
import com.apstrata.client.android.connection.OwnerConnection;
import com.apstrata.client.android.connection.TokenConnection;
import com.apstrata.client.android.connection.UserConnection;

public class OverviewActivity extends Activity {
	
	SharedPreferences preferences;
	
	String asBaseUrl = null;
	String asKey = null;
	String asSecret = null;
	String asAuthMode = null;
	String asResponseType = null;
	String asUser = null;
	String asPassword = null;
	long asTokenExpiry = 0;
	long asTokenLifetime = 0;
	
	Connection connOwner, connUser, connToken, connAnonymous;
	Client client;
	
	/** Called when the activity is first created. */
    @Override
	public void onCreate(Bundle savedInstanceState) {
    	
    	this.preferences = PreferenceManager.getDefaultSharedPreferences(this);
    	this.loadPreferences();
    	
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
		
		Button buttonRunTestO = (Button) findViewById(R.id.ButtonRunTestsOwner);
		buttonRunTestO.setOnClickListener(new OnClickListener() {
			public void onClick(View v) {
				handleClickOwnerConnectionTest(v);
			}
		});
		Button buttonRunTestU = (Button) findViewById(R.id.ButtonRunTestsUser);
		buttonRunTestU.setOnClickListener(new OnClickListener() {
			public void onClick(View v) {
				handleClickUserConnectionTest(v);
			}
		});
		Button buttonRunTestT = (Button) findViewById(R.id.ButtonRunTestsToken);
		buttonRunTestT.setOnClickListener(new OnClickListener() {
			public void onClick(View v) {
				handleClickTokenConnectionTest(v);
			}
		});
		Button buttonRunTestA = (Button) findViewById(R.id.ButtonRunTestsAnonymous);
		buttonRunTestA.setOnClickListener(new OnClickListener() {
			public void onClick(View v) {
				handleClickAnonymousConnectionTest(v);
			}
		});
    }
    
	private void loadPreferences() {
		Log.d(this.getClass().getName(), "Loading application preferences");
		
    	String baseUrl = preferences.getString("apstrata_base_url", null);
    	String key = preferences.getString("apstrata_key", null);
    	String secret = preferences.getString("apstrata_secret", null);
    	String authMode = preferences.getString("apstrata_auth_mode", null);
    	String responseType = preferences.getString("apstrata_response_type", null);
    	String user = preferences.getString("apstrata_user", null);
    	String password = preferences.getString("apstrata_password", null);
    	long tokenExpiry = Long.parseLong(preferences.getString("apstrata_token_expiry", "0"));
    	long tokenLifetime = Long.parseLong(preferences.getString("apstrata_token_lifetime", "0"));
    	
    	boolean recreateConnections = false;
    	if (isPreferenceChanged(this.asBaseUrl, baseUrl)) {
    		this.asBaseUrl = baseUrl;
    		recreateConnections = true;
    	}
    	if (isPreferenceChanged(this.asKey, key)) {
    		this.asKey = key;
    		recreateConnections = true;
    	}
    	if (isPreferenceChanged(this.asSecret, secret)) {
    		this.asSecret = secret;
    		recreateConnections = true;
    	}
    	if (isPreferenceChanged(this.asUser, user)) {
    		this.asUser = user;
    		recreateConnections = true;
    	}
    	if (isPreferenceChanged(this.asPassword, password)) {
    		this.asPassword = password;
    		recreateConnections = true;
    	}
    	
    	if (this.asTokenExpiry != tokenExpiry) {
    		this.asTokenExpiry = tokenExpiry;
    		recreateConnections = true;
    	}
    	
    	if (this.asTokenLifetime != tokenLifetime) {
    		this.asTokenLifetime = tokenLifetime;
    		recreateConnections = true;
    	}
    	
    	if (recreateConnections) {
			Log.d(this.getClass().getName(), "Application preferences changed");
    		this.setConnections();
    	}
    	
    	this.asAuthMode = authMode;
    	this.asResponseType = responseType;
    }
    
    boolean isPreferenceChanged(String initial, String current) {
    	boolean b = false;
    	if (initial == null && current == null) {
    		b = false;
    	}
    	else if ((initial == null && current != null) || (initial != null && current == null) || !initial.equals(current)) {
    		b = true;
    	}
    	return b;
    }
    
    private void setConnections() {
		Log.d(this.getClass().getName(), "[re]initializing apstrata connections & client");
		
		try {
			this.connOwner = new OwnerConnection(this.asBaseUrl, this.asKey, this.asSecret);
		} catch (Exception e) {
			Log.e(this.getClass().getName(), Log.getStackTraceString(e));
		}
		
		try {
			this.connUser = new UserConnection(this.asBaseUrl, this.asKey, this.asUser, this.asPassword);
		} catch (Exception e) {
			Log.e(this.getClass().getName(), Log.getStackTraceString(e));
		}
			
		try {
			if (this.connToken != null) {
				((TokenConnection) this.connToken).terminate();
			}
			this.connToken = new TokenConnection(this.asBaseUrl, this.asKey, this.asUser, this.asPassword, this.asTokenExpiry, this.asTokenLifetime);
		} catch (Exception e) {
			Log.e(this.getClass().getName(), Log.getStackTraceString(e));
		}
		
		this.connAnonymous = new AnonymousConnection();
		
		this.client = new Client(this.asBaseUrl, this.asKey, this.connAnonymous);
    }
    
    private void handleClickOwnerConnectionTest(View v) {
    	EditText testsResults = (EditText) this.findViewById(R.id.EditText1);
    	testsResults.setText("");
    	
    	this.loadPreferences();
    	
		if (asBaseUrl == null || asKey == null || asSecret == null || asAuthMode == null || asResponseType == null) {
			testsResults.setText("Owner configuration incomplete, click preferences to configure apstrata client");
			return;
		}
		
		String prefs = formatPreferencesAsString(asBaseUrl, asKey, asSecret, null, null, asAuthMode, asResponseType);
		notifyOfApstrataResult("Preferences: " + prefs);
		
		client.setConn(connOwner);
		try {
			verifyApstrataCredentials(client);
			invokeApstrataSaveDocument(client, true);
			invokeApstrataSaveDocument(client, false);
			
		} catch (Exception e) {
	    	testsResults.setText("Exception: " + e.getMessage());
		}
    }
    
    private void handleClickUserConnectionTest(View v) {
    	EditText testsResults = (EditText) this.findViewById(R.id.EditText1);
    	testsResults.setText("");
    	
    	this.loadPreferences();
    	
		if (asBaseUrl == null || asKey == null || asUser == null || asPassword == null || asAuthMode == null || asResponseType == null) {
			testsResults.setText("User configuration incomplete, click preferences to configure apstrata client");
			return;
		}
		
		String prefs = formatPreferencesAsString(asBaseUrl, asKey, null, asUser, asPassword, asAuthMode, asResponseType);
		notifyOfApstrataResult("Preferences: " + prefs);
		
		client.setConn(connUser);
		try {
			verifyApstrataCredentials(client);
			invokeApstrataSaveDocument(client, true);
			invokeApstrataSaveDocument(client, false);
			
		} catch (Exception e) {
	    	testsResults.setText("Exception: " + e.getMessage());
		}
    }
    
    private void handleClickTokenConnectionTest(View v) {
    	EditText testsResults = (EditText) this.findViewById(R.id.EditText1);
    	testsResults.setText("");
    	
    	this.loadPreferences();
    	
		if (asBaseUrl == null || asKey == null || asUser == null || asPassword == null || asAuthMode == null || asResponseType == null) {
			testsResults.setText("Configuration incomplete, click preferences to configure apstrata client");
			return;
		}
		
		String prefs = formatPreferencesAsString(asBaseUrl, asKey, null, asUser, asPassword, asAuthMode, asResponseType);
		notifyOfApstrataResult("Preferences: " + prefs);
		
		client.setConn(connToken);
		try {
			verifyApstrataCredentials(client, (TokenConnection) connToken);
			invokeApstrataSaveDocument(client, true);
			invokeApstrataSaveDocument(client, false);
			
		} catch (Exception e) {
	    	testsResults.setText("Exception: " + e.getMessage());
		}
    }
    
    private void handleClickAnonymousConnectionTest(View v) {
    	EditText testsResults = (EditText) this.findViewById(R.id.EditText1);
    	testsResults.setText("");
    	
    	this.loadPreferences();
    	
		if (asBaseUrl == null || asKey == null || asResponseType == null) {
			testsResults.setText("Configuration incomplete, click preferences to configure apstrata client");
			return;
		}
		
		String prefs = formatPreferencesAsString(asBaseUrl, asKey, null, null, null, asAuthMode, asResponseType);
		notifyOfApstrataResult("Preferences: " + prefs);
		
		client.setConn(connAnonymous);
		try {
			invokeApstrataSaveDocument(client, true);
			invokeApstrataSaveDocument(client, false);
			
		} catch (Exception e) {
	    	testsResults.setText("Exception: " + e.getMessage());
		}
	}

    private String getOptionText(String currentValue, String[] values, String[] entries) {
		int i;
		for (i = 0; i < values.length && !currentValue.equals(values[i]); i++) {
		}
		String s = "unknown " + currentValue;
		if (i < values.length) {
			s = entries[i];
		}
		return s;
    }
    
	private String formatPreferencesAsString(String baseUrl, String key, String secret, String userName, String userPassword, String authMode, String responseType){
		String authModeDisplayValue = getOptionText(authMode, getResources().getStringArray(R.array.settings_apstrata_auth_mode_values), getResources().getStringArray(R.array.settings_apstrata_auth_mode_entries));
		String responseTypeDisplayValue = getOptionText(responseType, getResources().getStringArray(R.array.settings_apstrata_response_type_values), getResources().getStringArray(R.array.settings_apstrata_response_type_entries));
		return "base url: " + baseUrl + ", key: " + key 
			+ (secret != null? ", secret: " + secret: "") 
			+ (userName != null? ", user: " + userName: "") 
			+ (userPassword != null? ", password: " + userPassword: "")
			+ ", auth mode: " + authModeDisplayValue + ", response: " + responseTypeDisplayValue;
	}
	
	private void verifyApstrataCredentials(final Client client) {
		AsyncTask<String, Void, String> at = new AsyncTask<String, Void, String>() {
			protected String doInBackground(String... params) {
				String response = "no response yet";
				try {
					
					Client.AuthMode mode = asAuthMode.equals("10")? Client.AuthMode.SIMPLE: Client.AuthMode.COMPLEX;
					
					if (asResponseType.equals(Client.RESPONSE_TYPE_JSON)) {
						response = client.callAPIJson("VerifyCredentials", null, null, mode);
					} else {
						response = client.callAPIXml("VerifyCredentials", null, null, mode);
					}
					
				} catch (Exception e) {
					response = "Error: " + e.getMessage();
					e.printStackTrace();
				}
				return response;
			}
			
		    protected void onPostExecute(String result) {
		    	notifyOfApstrataResult("Verify Credentials: " + result);
		    }
		};
		at.execute((String) null);
	}

	private void invokeApstrataSaveDocument(final Client client, final boolean someFlag) {
		AsyncTask<String, Void, String> at = new AsyncTask<String, Void, String>() {
			String fileFieldName = "apsdb_attachments";
			String fileName1 = "mytestfile1.txt";
			String fileName2 = "mytestfile2.txt";
			
			protected String doInBackground(String... params) {
				String response = "no response yet";
				try {
					Client.AuthMode mode = asAuthMode.equals("10")? Client.AuthMode.SIMPLE: Client.AuthMode.COMPLEX;
					
					List<NameValuePair> parameters = new ArrayList<NameValuePair>();
					parameters.add(new BasicNameValuePair("apsdb.store", "DefaultStore"));
					parameters.add(new BasicNameValuePair("apsdb.update", "false"));
					parameters.add(new BasicNameValuePair("somefield1", "some.value.1"));
					parameters.add(new BasicNameValuePair("somefield2", "some.value.2"));
					
					Map<String, List<File>> files = new HashMap<String, List<File>>();
					File somefile1 = createTextFile(fileName1, "some text content of some attachment file 1");
					File somefile2 = createTextFile(fileName2, "some text content of some attachment file 2");
					List<File> someFileList = new ArrayList<File>();
					someFileList.add(somefile1);
					someFileList.add(somefile2);
					files.put(fileFieldName, someFileList);

					if (asResponseType.equals(Client.RESPONSE_TYPE_JSON)) {
						response = client.callAPIJson("SaveDocument", parameters, files, mode);
					} else {
						response = client.callAPIXml("SaveDocument", parameters, files, mode);
					}
					
				} catch (Exception e) {
					response = "Error: " + e.getMessage();
					e.printStackTrace();
				}
				return response;
			}
			
			protected void onPostExecute(String result) {
		    	notifyOfApstrataResult("Save Document: " + result);
		    	String dockey = extractResultDocumentDockey(result);
		    	invokeApstrataGetFileAttachment(client, dockey, fileFieldName, !someFlag? fileName1: fileName2, someFlag);
		    }

			private String extractResultDocumentDockey(String result) {
				String dockey = null;
				try {
					if (asResponseType.equals(Client.RESPONSE_TYPE_JSON)) {
						dockey = new JSONObject(result).getJSONObject("response").getJSONObject("result").getJSONObject("document").getString("key");
					} else {
						Pattern pattern = Pattern.compile(".*<document\\s+key=\"(.+)\" versionNumber=\"(.+)\"/>.*");
						Matcher matcher = pattern.matcher(result);
						if (matcher.matches()) {
							dockey = matcher.group(1);
						}
					}
				} catch (Exception e) {}
				
				Log.d(this.getClass().getName(), "extracted dockey = " + dockey + " from apstrata response = " + result);
				return dockey;
			}
		};
		at.execute((String) null);
	}
	
	private void verifyApstrataCredentials(final Client client, final TokenConnection conn) {
		AsyncTask<String, Void, String> at = new AsyncTask<String, Void, String>() {
			protected String doInBackground(String... params) {
				String response = "no response yet";
				try {
					if (conn.validateToken()) {
						response = "token " + conn.getToken() + ", expires " + new Date(conn.getTokenExpires()) + ", lifetime " + new Date(conn.getTokenLifetime());
					} else {
						response = "token validation failed";
					}
					
				} catch (Exception e) {
					response = "Error: " + e.getMessage();
					e.printStackTrace();
				}
				return response;
			}
			
		    protected void onPostExecute(String result) {
		    	notifyOfApstrataResult("Verify Credentials: " + result);
		    }
		};
		at.execute((String) null);
	}

	private void invokeApstrataGetFileAttachment(final Client client, final String dockey, final String fieldName, final String fileName, final boolean asStream) {
		if (dockey == null) {
	    	notifyOfApstrataResult("dockey is null, cannot proceed with file attachment retrieval");
		} else {
			List<NameValuePair> parametersTemp = new ArrayList<NameValuePair>();
			parametersTemp.add(new BasicNameValuePair("apsdb.store", "DefaultStore"));
			parametersTemp.add(new BasicNameValuePair("apsdb.fieldName", fieldName));
			parametersTemp.add(new BasicNameValuePair("apsdb.fileName", fileName));
			parametersTemp.add(new BasicNameValuePair("apsdb.documentKey", dockey));
			final List<NameValuePair> parameters = parametersTemp;
			
			AsyncTask<String, Void, String> at;
			if (asStream) {
				at = new AsyncTask<String, Void, String>() {
					protected String doInBackground(String... params) {
						String response = "no response yet";
						StringBuffer sb = new StringBuffer();
						//AndroidHttpClient httpClient = AndroidHttpClient.newInstance("some-android-user-agent");
						DefaultHttpClient httpClient = MySSLSocketFactory.getNewHttpClient();
	
						try {
							Client.AuthMode mode = asAuthMode.equals("10")? Client.AuthMode.SIMPLE: Client.AuthMode.COMPLEX;
							InputStream is = client.callAPIStream("GetFile", parameters, null, mode, httpClient);
							BufferedReader reader = new BufferedReader(new InputStreamReader(is));
							String line = "";
							while ((line = reader.readLine()) != null) {
								sb.append(line);
							}
							response = sb.toString();
							
						} catch (Exception e) {
							response = "Error: " + e.getMessage();
							Log.e(this.getClass().getName(), "Error reading stream contents of apstrata file attachment of doc " + dockey + ", field " + fieldName + ", file " + fileName, e);
						} finally {
							//httpClient.close();
						}
						
						Log.d(this.getClass().getName(), "read stream contents of apstrata file attachment of doc " + dockey + ", field " + fieldName + ", file " + fileName + " = " + response);
						return response;
					}
					
					protected void onPostExecute(String result) {
						notifyOfApstrataResult("File " + fileName + " of field " + dockey + " " + fieldName + ": " + result);
					}
				};
			} else {
				final String path = getDir("myfolder", MODE_PRIVATE).getAbsolutePath() + File.separator + "copy-" + fileName;
				at = new AsyncTask<String, Void, String>() {
					protected String doInBackground(String... params) {
						String response = "no response yet";

						try {
							Client.AuthMode mode = asAuthMode.equals("10")? Client.AuthMode.SIMPLE: Client.AuthMode.COMPLEX;
							File file = client.callAPIFile("GetFile", parameters, mode, path);
							response = readTextFile(file);
							
						} catch (Exception e) {
							response = "Error: " + e.getMessage();
							Log.e(this.getClass().getName(), "Error reading contents of apstrata file attachment of doc " + dockey + ", field " + fieldName + ", file " + fileName + " into local file " + path, e);
						}
						
						Log.d(this.getClass().getName(), "read contents of apstrata file attachment of doc " + dockey + ", field " + fieldName + ", file " + fileName + " into local file " + path + " = " + response);
						return response;
					}
					
					protected void onPostExecute(String result) {
						notifyOfApstrataResult("File " + fileName + " of field " + dockey + " " + fieldName + " read into local file " + path + ": " + result);
					}
				};
				
			}
			at.execute((String) null);
		}
	}
	
	private void notifyOfApstrataResult(String result) {
		EditText testsResults = (EditText) this.findViewById(R.id.EditText1);
		if (testsResults.getText().length() == 0) {
	    	testsResults.append(result);
		} else {
			testsResults.append("\n\n" + result);
		}
	}
	
    private File createTextFile(String fileName, String fileContent) throws IOException {
		File file = new File(getDir("myfolder", MODE_PRIVATE).getAbsolutePath() + File.separator + fileName);
		Writer output = new BufferedWriter(new FileWriter(file));
		output.write(fileContent);
		output.close();
		return file;
	}

	private String readTextFile(File file) throws IOException {
		StringBuffer text = new StringBuffer();
		try {
			BufferedReader br = new BufferedReader(new FileReader(file));
			String line;
			boolean firstLine = true;
			while ((line = br.readLine()) != null) {
				if (!firstLine) {
					text.append('\n');
				}
				firstLine = false;
				text.append(line);
			}
		} catch (IOException e) {
			text.append(e.getMessage());
		}
		return text.toString();
	}

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
		MenuInflater inflater = getMenuInflater();
		inflater.inflate(R.menu.mainmenu, menu);
		return true;
    }

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		Intent i;
		switch (item.getItemId()) {
		case R.id.preferences:
			// Launch Preference activity
			i = new Intent(this, MyPreferencesActivity.class);
			startActivity(i);
			// Some feedback to the user
			Toast.makeText(this, "Set your apstrata preferences.", Toast.LENGTH_LONG).show();
			break;
		}
		return true;
	}

	@Override
	protected void onStop() {
		// TODO Auto-generated method stub
		super.onStop();
		if (this.connToken != null) {
			((TokenConnection) this.connToken).terminate();
		}
	}
	
}