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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONObject;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.http.AndroidHttpClient;
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

import com.apstrata.client.android.ApstrataClientAndroid;
import com.apstrata.client.android.ApstrataClientAndroid.AuthMode;

public class OverviewActivity extends Activity {
	SharedPreferences preferences;
	
	/** Called when the activity is first created. */
    @Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
		
		// Initialize preferences
		preferences = PreferenceManager.getDefaultSharedPreferences(this);
		
		Button buttonRunTest = (Button) findViewById(R.id.ButtonRunTests);
		buttonRunTest.setOnClickListener(new OnClickListener() {
			public void onClick(View v) {
				handleClick(v);
			}
		});
    }
    
    private void handleClick(View v) {
    	EditText testsResults = (EditText) this.findViewById(R.id.EditText1);
    	testsResults.setText("");
    	
		String asBaseUrl = preferences.getString("apstrata_base_url", null);
		String asKey = preferences.getString("apstrata_key", null);
		String asSecret = preferences.getString("apstrata_secret", null);
		String asAuthMode = preferences.getString("apstrata_auth_mode", null);
		String asResponseType = preferences.getString("apstrata_response_type", null);
		
		if (asBaseUrl == null || asKey == null || asSecret == null || asAuthMode == null || asResponseType == null) {
			testsResults.setText("Configuration incomplete, click preferences to configure apstrata client");
			return;
		}
		
		String prefs = showPrefs(asBaseUrl, asKey, asSecret, asAuthMode, asResponseType);
		notifyOfApstrataResult("Preferences: \n" + prefs);
		
		verifyApstrataCredentials(asBaseUrl, asKey, asSecret, asAuthMode, asResponseType);
		invokeApstrataSaveDocument(asBaseUrl, asKey, asSecret, asAuthMode, asResponseType, true);
		invokeApstrataSaveDocument(asBaseUrl, asKey, asSecret, asAuthMode, asResponseType, false);
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
    
	private String showPrefs(String baseUrl, String key, String secret, String authMode, String responseType){
		String authModeDisplayValue = getOptionText(authMode, getResources().getStringArray(R.array.settings_apstrata_auth_mode_values), getResources().getStringArray(R.array.settings_apstrata_auth_mode_entries));
		String responseTypeDisplayValue = getOptionText(responseType, getResources().getStringArray(R.array.settings_apstrata_response_type_values), getResources().getStringArray(R.array.settings_apstrata_response_type_entries));
		return "base url: " + baseUrl + ", key: " + key + ", secret: " + secret + ", auth mode: " + authModeDisplayValue + ", response: " + responseTypeDisplayValue;
	}
	
	private void verifyApstrataCredentials(final String baseUrl, final String key, final String secret, final String authMode, final String responseType) {
		AsyncTask<String, Void, String> at = new AsyncTask<String, Void, String>() {
			protected String doInBackground(String... params) {
				String response = "no response yet";
				try {
//					ApstrataClientAndroid client = new ApstrataClientAndroid("https://27.111.175.219/apsdb/rest", "K4E685E0EAC", "0F37CB31B2810DF485D9", AuthMode.SIMPLE);
					ApstrataClientAndroid client = new ApstrataClientAndroid(baseUrl, key, secret, authMode.equals("10")? AuthMode.SIMPLE: AuthMode.COMPLEX);
					List<NameValuePair> parameters = new ArrayList<NameValuePair>();
					
					if (responseType.equals(ApstrataClientAndroid.RESPONSE_TYPE_JSON)) {
						response = client.callAPIJson("VerifyCredentials", parameters, null);
					} else {
						response = client.callAPIXml("VerifyCredentials", parameters, null);
					}
					
				} catch (Exception e) {
					response = "Error: " + e.getMessage();
					e.printStackTrace();
				}
				return response;
			}
			
		    protected void onPostExecute(String result) {
		    	notifyOfApstrataResult("Verify Credential response: \n" + result);
		    }
		};
		at.execute((String) null);
	}

	private void invokeApstrataSaveDocument(final String baseUrl, final String key, final String secret, final String authMode, final String responseType, final boolean someFlag) {
		AsyncTask<String, Void, String> at = new AsyncTask<String, Void, String>() {
			String fileFieldName = "apsdb_attachments";
			String fileName1 = "mytestfile1.txt";
			String fileName2 = "mytestfile2.txt";
			
			protected String doInBackground(String... params) {
				String response = "no response yet";
				try {
					ApstrataClientAndroid client = new ApstrataClientAndroid(baseUrl, key, secret, authMode.equals("10")? AuthMode.SIMPLE: AuthMode.COMPLEX);
					
					List<NameValuePair> parameters = new ArrayList<NameValuePair>();
					parameters.add(new BasicNameValuePair("apsdb.store", "LoadTestStore"));
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

					if (responseType.equals(ApstrataClientAndroid.RESPONSE_TYPE_JSON)) {
						response = client.callAPIJson("SaveDocument", parameters, files);
					} else {
						response = client.callAPIXml("SaveDocument", parameters, files);
					}
					
				} catch (Exception e) {
					response = "Error: " + e.getMessage();
					e.printStackTrace();
				}
				return response;
			}
			
			protected void onPostExecute(String result) {
		    	notifyOfApstrataResult("Save Document response: \n" + result);
		    	String dockey = extractResultDocumentDockey(result);
		    	invokeApstrataGetFileAttachment(baseUrl, key, secret, authMode, responseType, dockey, fileFieldName, fileName1, someFlag);
		    }

			private String extractResultDocumentDockey(String result) {
				String dockey = null;
				try {
					if (responseType.equals(ApstrataClientAndroid.RESPONSE_TYPE_JSON)) {
						dockey = new JSONObject(result).getJSONObject("response").getJSONObject("result").getJSONObject("document").getString("key");
					} else {
						Pattern pattern = Pattern.compile(".*<document\\s+key=\"(.+)\"/>.*");
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
	
	private void invokeApstrataGetFileAttachment(final String baseUrl, final String key, final String secret, final String authMode, final String responseType, final String dockey, final String fieldName, final String fileName, final boolean asStream) {
		if (dockey == null) {
	    	notifyOfApstrataResult("dockey is null, cannot proceed with file attachment retrieval");
		} else {
			List<NameValuePair> parametersTemp = new ArrayList<NameValuePair>();
			parametersTemp.add(new BasicNameValuePair("apsdb.store", "LoadTestStore"));
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
						AndroidHttpClient httpClient = AndroidHttpClient.newInstance("some-android-user-agent");
	
						try {
							ApstrataClientAndroid client = new ApstrataClientAndroid(baseUrl, key, secret, authMode.equals("10")? AuthMode.SIMPLE: AuthMode.COMPLEX);
							
							InputStream is = client.callAPIStream("GetFile", parameters, null, httpClient);
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
							httpClient.close();
						}
						
						Log.d(this.getClass().getName(), "read stream contents of apstrata file attachment of doc " + dockey + ", field " + fieldName + ", file " + fileName + " = " + response);
						return response;
					}
					
					protected void onPostExecute(String result) {
						notifyOfApstrataResult("File attachment " + fileName + " of doc field " + dockey + "." + fieldName + ": \n" + result);
					}
				};
			} else {
				final String path = getDir("myfolder", MODE_PRIVATE).getAbsolutePath() + File.separator + "copy-" + fileName;
				at = new AsyncTask<String, Void, String>() {
					protected String doInBackground(String... params) {
						String response = "no response yet";

						try {
							ApstrataClientAndroid client = new ApstrataClientAndroid(baseUrl, key, secret, authMode.equals("10")? AuthMode.SIMPLE: AuthMode.COMPLEX);
							
							File file = client.callAPIFile("GetFile", parameters, path);
							response = readTextFile(file);
							
						} catch (Exception e) {
							response = "Error: " + e.getMessage();
							Log.e(this.getClass().getName(), "Error reading contents of apstrata file attachment of doc " + dockey + ", field " + fieldName + ", file " + fileName + " into local file " + path, e);
						}
						
						Log.d(this.getClass().getName(), "read contents of apstrata file attachment of doc " + dockey + ", field " + fieldName + ", file " + fileName + " into local file " + path + " = " + response);
						return response;
					}
					
					protected void onPostExecute(String result) {
						notifyOfApstrataResult("File attachment " + fileName + " of doc field " + dockey + "." + fieldName + " read into local file " + path + ": \n" + result);
					}
				};
				
			}
			at.execute((String) null);
		}
	}
	
	private void notifyOfApstrataResult(String result) {
		EditText testsResults = (EditText) this.findViewById(R.id.EditText1);
    	testsResults.append(result + "\n\n");
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
}