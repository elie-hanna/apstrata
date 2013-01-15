package com.apstrata.client.java;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.net.URLEncoder;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.TreeSet;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.log4j.Logger;


public class ApstrataClientJava {
	
	private String baseUrl;
	private String key;
	private String user;
	private AuthMode authMode;
	private String secret;
	
	private final MessageDigest messageDigest;
	
	public final static String	APSTRATA_PREFIX		= "apsws.";
	
	private final static String	USER				= APSTRATA_PREFIX + "user";
	private final static String	TIME_STAMP			= APSTRATA_PREFIX + "time";
	private final static String	SIGNATURE			= APSTRATA_PREFIX + "authSig";
	private final static String	SIGNATURE_MODE		= APSTRATA_PREFIX + "authMode";
	
	public final static String	RESPONSE_TYPE_PARAM = APSTRATA_PREFIX + "responseType";
	
	public final static String	RESPONSE_TYPE_XML	= "xml";
	public final static String	RESPONSE_TYPE_JSON	= "json";
	
	private static Logger logger = Logger.getLogger(ApstrataClientJava.class);
	
	// private final static String	RUN_AS_USER			= "apsim.runAs";
	
	public enum AuthMode {
	    SIMPLE, COMPLEX
	}
	
	private ApstrataClientJava(String baseUrl, String key, AuthMode authMode) throws Exception{
		this.baseUrl = baseUrl;
		this.key = key;
		this.authMode = authMode;

		try {
			messageDigest = MessageDigest.getInstance("MD5");
		} catch (NoSuchAlgorithmException e) {
			throw new Exception(e);
		}
	}
	
	/**
	 * Instantiates an ApstrataClientAndroid object for use with a non-owner user account
	 * 
	 * @param baseUrl identifies the scheme and the apstrata server that is targeted. Ex: "https://sandbox.apstrata.com/"
	 * @param key identifies the customer account
	 * @param user identifies the registered non-owner user account making the request
	 * @param password is the password of the registered non-owner user specified by the user parameter
	 * @param authMode identifies the authentication mode and is defined by the enum {@link #AuthMode}
	 * @throws Exception if unable to instantiate a MessageDigest that utilizes MD5
	 */
	public ApstrataClientJava(String baseUrl, String key, String user, String password, AuthMode authMode) throws Exception {
		this(baseUrl, key, authMode);
		this.user = user;
		this.secret = hexToString(messageDigest.digest(password.getBytes()));
	}
	
	/**
	 * Instantiates an ApstrataClientAndroid object for use with the owner account
	 * 
	 * @param baseUrl identifies the scheme and the apstrata server that is targeted. Ex: "https://sandbox.apstrata.com/"
	 * @param key identifies the customer account
	 * @param secret is the account shared secret
	 * @param authMode identifies the authentication mode and is defined by the enum {@link #AuthMode}
	 * @throws Exception if unable to instantiate a MessageDigest that utilizes MD5
	 */
	public ApstrataClientJava(String baseUrl, String key, String secret, AuthMode authMode) throws Exception {
		this(baseUrl, key, authMode);
		this.secret = secret;
	}
	
	/**
	 * invokes an apstrata api by specifying the api name and parameters
	 * 
	 * @param methodName identifies the API method being invoked
	 * @param params is a list of NameValuePair objects representing the HTTP text parameters to be sent to the server along with the request
	 * @param files is a map representing file parameters to be sent to the server along with the request. An entry's key is the parameter name, and the value is a list of files representing the [multiple] value[s] for this parameter
	 * @return the String response as received from the apstrata sevice
	 * @throws Exception
	 */
	public String callAPI(String methodName, List<NameValuePair> params, Map<String, List<File>> files) throws Exception {
		String apiUrl = getSignedRequestUrl(methodName, params, files);
		return getStringResponse(apiUrl, params, files);
	}
	
	/**
	 * invokes an apstrata api by specifying the api name, parameters and an HttpClient object. the calling code is responsible 
	 * for closing the httpClient upon consuming the stream. This method is used typically to request apstrata file attachments
	 * 
	 * @param methodName identifies the API method being invoked
	 * @param params is a list of NameValuePair objects representing the HTTP text parameters to be sent to the server along with the request
	 * @param files is a map representing file parameters to be sent to the server along with the request. An entry's key is the parameter name, and the value is a list of files representing the [multiple] value[s] for this parameter
	 * @param httpClient is an AndroidHttpClient used by the client object. the calling code is expected to close this httpClient upon consuming the stream
	 * @return an input stream that returns the data sent by apstrata in response to the call 
	 * @throws Exception
	 */
	public InputStream callAPIStream(String methodName, List<NameValuePair> params, Map<String, List<File>> files, HttpClient httpClient) throws Exception {
		String apiUrl = getSignedRequestUrl(methodName, params, files);
		return getStreamResponse(apiUrl, params, files, httpClient);
	}
	
	/**
	 * invokes an apstrata api by specifying the api name, parameters and requesting the JSON return format. 
	 * this would be the same as calling {@link #callAPI(String, List, Map)} after setting the parameter {@link #RESPONSE_TYPE_PARAM} 
	 * with the single value {@link #RESPONSE_TYPE_JSON} 
	 * 
	 * @param methodName identifies the API method being invoked
	 * @param params is a list of NameValuePair objects representing the HTTP text parameters to be sent to the server along with the request
	 * @param files is a map representing file parameters to be sent to the server along with the request. An entry's key is the parameter name, and the value is a list of files representing the [multiple] value[s] for this parameter
	 * @return the String response in JSON format as received from the apstrata sevice
	 * @throws Exception
	 */
	public String callAPIJson(String methodName, List<NameValuePair> params, Map<String, List<File>> files) throws Exception {
		List<NameValuePair> paramsUpdated = setApiParam(params, RESPONSE_TYPE_PARAM, RESPONSE_TYPE_JSON);
		String resultText = callAPI(methodName, paramsUpdated, files);
		return resultText;
	}
	
	/**
	 * invokes an apstrata api by specifying the api name, parameters and requesting the XML return format. 
	 * this would be the same as calling {@link #callAPI(String, List, Map)} after setting the parameter {@link #RESPONSE_TYPE_PARAM} 
	 * with the single value {@link #RESPONSE_TYPE_XML} 
	 * 
	 * @param methodName identifies the API method being invoked
	 * @param params is a list of NameValuePair objects representing the HTTP text parameters to be sent to the server along with the request
	 * @param files is a map representing file parameters to be sent to the server along with the request. An entry's key is the parameter name, and the value is a list of files representing the [multiple] value[s] for this parameter
	 * @return the String response in XML format as received from the apstrata sevice
	 * @throws Exception
	 */
	public String callAPIXml(String methodName, List<NameValuePair> params, Map<String, List<File>> files) throws Exception {
		List<NameValuePair> paramsUpdated = setApiParam(params, RESPONSE_TYPE_PARAM, RESPONSE_TYPE_XML);
		String resultText = callAPI(methodName, paramsUpdated, files);
		return resultText;
	}
	
	/**
	 * invokes an apstrata file-returning api by specifying the api name, parameters and the path to the destination file. 
	 * This method is used typically to request apstrata file attachments
	 * 
	 * @param methodName identifies the API method being invoked
	 * @param params is a list of NameValuePair objects representing the HTTP text parameters to be sent to the server along with the request
	 * @param path is the path to the destination file, where the content of the file attachment is to be stored
	 * @return a handle to the destination file, where the content is stored
	 * @throws Exception
	 */
	public File callAPIFile(String methodName, List<NameValuePair> params, String path) throws Exception {
		String apiUrl = getSignedRequestUrl(methodName, params, null);
		
		//AndroidHttpClient httpClient = AndroidHttpClient.newInstance("some-android-user-agent");
		DefaultHttpClient httpClient = MySSLSocketFactory.getNewHttpClient();
		File file = new File(path);
		FileOutputStream f = new FileOutputStream(file);
		
		try {
			InputStream in = getStreamResponse(apiUrl, params, null, httpClient);
			
			int byteCount = 0;
			byte[] byteBuffer = new byte[1024];
			
		    while ((byteCount = in.read(byteBuffer)) > 0) {
		         f.write(byteBuffer, 0, byteCount);
		    }
			
			return file;
		} finally {
			
			f.close();
			//httpClient.close();
		}
	}
	
	/**
	 * add the name/value pair parameter to the list, overwriting existing pairs that have the same name as the one being added,
	 * thereby making sure that the supplied value is the only value present in the list and later on submitted to the api
	 * @param params
	 * @param paramName
	 * @param paramValue
	 * @return
	 */
	private List<NameValuePair> setApiParam(List<NameValuePair> params, String paramName, String paramValue) {
		List<NameValuePair> paramsUpdated = new ArrayList<NameValuePair>();
		for (Iterator<NameValuePair> iterator = params.iterator(); iterator.hasNext();) {
			NameValuePair nameValuePair = (NameValuePair) iterator.next();
			if (!nameValuePair.getName().equals(paramName)) {
				paramsUpdated.add(nameValuePair);
			}
		}
		paramsUpdated.add(new BasicNameValuePair(paramName, paramValue));
		return paramsUpdated;
	}

	/**
	 * Returns a string representing the full URL with the additional necessary query string
	 * 
	 * @param action
	 * @param parameters
	 * @param files
	 * @return String full URL
	 * @throws Exception
	 */
	public String getSignedRequestUrl(String action, List<NameValuePair> parameters, Map<String, List<File>> files) throws Exception {
		long timeStamp = System.currentTimeMillis();
		
		List<String> stringedParams = new ArrayList<String>();
		String url = this.baseUrl + "/" + this.key + "/" + action;

		stringedParams.add(TIME_STAMP + "=" + timeStamp);

		if (this.user != null) {
			stringedParams.add(USER + "=" + this.user);
		}

/*	
 * TODO: add the run as user option to the call api options	
 		if (this.runAsUser != null) {
			stringedParams.add(Constants.RUN_AS_USER + "=" + this.runAsUser);
		}
*/

		String signature = null;
		// if secret is null then trying to do anonymous access
		if (this.secret != null) {
			if (this.authMode == AuthMode.COMPLEX) {
				// grouping all parameters for signature level 2
				List<NameValuePair> allParams = new ArrayList<NameValuePair>();
				
				if (parameters != null) {
					allParams.addAll(parameters);
				}
				allParams.add(new BasicNameValuePair(TIME_STAMP, String.valueOf(timeStamp)));

				if (this.user != null) {
					allParams.add(new BasicNameValuePair(USER, this.user));
				}

/*
 * TODO: add the run as user option to the call api options	
 				if (this.runAsUser != null) {
					allParams.add(new BasicNameValuePair(RUN_AS_USER, this.runAsUser));
				}
*/

				signature = getLevel2Signature(this.secret, allParams, files,  url);
				
			} else if (this.authMode == AuthMode.SIMPLE) {
				String authKey = this.key;
				if (this.user != null) {
					authKey = this.user;
				}
				signature = getLevel1Signature(authKey, this.secret, action, timeStamp);
				stringedParams.add(SIGNATURE_MODE + "=simple");
				
			} else {
				// TODO: token based, add it as a cookie or param
				throw new Exception("token based auth not yet supported");
			}
			
			stringedParams.add(SIGNATURE + "=" + signature);
		}
		
		url += "?";
		for (String stringedParam: stringedParams) {
			url += stringedParam + "&";
		}
		
		logger.debug(this.getClass().getName() + "built apstrata url: " + url);
		return url;
	}
	
	/**
	 * returns a string response generated by an apstrata service
	 * 
	 * @param fullURL
	 * @param parameters
	 * @param files
	 * @return
	 * @throws Exception
	 */
	private String getStringResponse(String fullURL, List<NameValuePair> parameters, Map<String, List<File>> files) throws Exception {
		// AndroidHttpClient httpClient = AndroidHttpClient.newInstance("some-android-user-agent");
		DefaultHttpClient httpClient = MySSLSocketFactory.getNewHttpClient();
		StringBuffer sb = new StringBuffer();
		
		try {
			InputStream responseStream = getStreamResponse(fullURL, parameters, files, httpClient);
			BufferedReader reader = new BufferedReader(new InputStreamReader(responseStream));
			String line = "";
			while ((line = reader.readLine()) != null) {
				sb.append(line);
			}
		} finally {
			// httpClient.close();
		}
		
		logger.debug(this.getClass().getName() + "success invoking apstrata at " + fullURL + ", response: " + sb);
		return sb.toString();
	}
	
	/**
	 * returns an input stream response generated by an apstrata service
	 * 
	 * @param fullURL
	 * @param parameters
	 * @param files
	 * @param httpClient
	 * @return
	 * @throws Exception
	 */
	private InputStream getStreamResponse(String fullURL, List<NameValuePair> parameters, Map<String, List<File>> files, HttpClient httpClient) throws Exception {
		HttpPost httpPost = new HttpPost(fullURL);

		boolean isMultiPart = files != null && files.size() > 0;
		if (isMultiPart) {
			MultipartEntity entity = new MultipartEntity();
			
			if (parameters != null) {
				for (Iterator<NameValuePair> iterator = parameters.iterator(); iterator.hasNext();) {
					NameValuePair nameValuePair = (NameValuePair) iterator.next();
					entity.addPart(nameValuePair.getName(), new StringBody(nameValuePair.getValue()));
				}
			}
			
			if (files != null){
				Set<Entry<String, List<File>>> allFileParamEntrySet = files.entrySet();
				for (Iterator<Entry<String, List<File>>> iterator1 = allFileParamEntrySet.iterator(); iterator1.hasNext();) {
					Entry<String, List<File>> oneFileParamEntry = iterator1.next();
					List<File> oneFileParamFileList = oneFileParamEntry.getValue();
					for (Iterator<File> iterator2 = oneFileParamFileList.iterator(); iterator2.hasNext();) {
						File oneFileParamFile = (File) iterator2.next();
						entity.addPart(oneFileParamEntry.getKey(), new FileBody(oneFileParamFile));
					}
				}
			}
			
			httpPost.setEntity(entity);
			
		} else {
			if (parameters != null) {
				httpPost.setEntity(new UrlEncodedFormEntity(parameters,"UTF-8"));
			}	
		}
		
		try {
			HttpResponse response = httpClient.execute(httpPost);

			// Read the response body.
			InputStream responseStream = response.getEntity().getContent();
			return responseStream;
			
		} catch (IOException e) {
			logger.debug(this.getClass().getName() + "exception invoking apstrata at " + fullURL +"Exception: "+ e.getMessage());
			throw new Exception(e);
		}
	}
	
	/**
	 * Generate a level 1 signature for a request
	 * 
	 * @param authenticationKey
	 * @param secretAccessKey
	 * @param action
	 * @param timeStamp
	 * @return
	 * @throws Exception
	 */
	private synchronized String getLevel1Signature(String authenticationKey, String secretAccessKey, String action, long timeStamp) throws Exception {
		try {
			MessageDigest messageDigest = MessageDigest.getInstance("MD5");
			
			String stringToSign = timeStamp + authenticationKey + action + secretAccessKey;
			String signature = hexToString(messageDigest.digest(stringToSign.getBytes()));
			
			logger.debug(this.getClass().getName() + "Level 1 signature of: " + stringToSign + " = " + signature);
			return signature;
			
		} catch (NoSuchAlgorithmException e) {
			throw new Exception(e);
		}
	}

	/**
	 * Generate a level 2 signature from all the parameters sent in the request
	 * 
	 * @param privateAccessKey
	 * @param parameters
	 * @param files
	 * @param baseURL
	 * @return String representing the signature
	 * @throws Exception
	 */
	private synchronized String getLevel2Signature(String privateAccessKey, List<NameValuePair> parameters, Map<String, List<File>> files, String baseURL) throws Exception {
		Set<String> treeSet = new TreeSet<String>();
		
		for (NameValuePair qParam : parameters) {
			String encodedKey = encodeValue(qParam.getName());
			String encodedValue = "";
			if (qParam.getValue() != null) {
				encodedValue = encodeValue(qParam.getValue());
			} 
			treeSet.add(encodedKey + "=" + encodedValue);
		}

		boolean isMultiPart = files != null && files.size() > 0;
		if(isMultiPart){
			MessageDigest md5 = MessageDigest.getInstance("MD5");
			for (Iterator<String> iterator = files.keySet().iterator(); iterator.hasNext();) {
				String fieldName = iterator.next();
				String encodedKey = encodeValue(fieldName);
				List<File> fieldFiles = files.get(fieldName);
				for (Iterator<File> iterator2 = fieldFiles.iterator(); iterator2.hasNext();) {
					File file = (File) iterator2.next();
					FileInputStream fis = new FileInputStream(file);
					byte[] bytes = new byte[4096];
					int readPos = fis.read(bytes);
					while (readPos != -1) {
						md5.update(bytes, 0, readPos);
						readPos = fis.read(bytes);
					}
					
					String hashedValue = hexToString(md5.digest());
					String value = encodeValue(hashedValue);
					treeSet.add(encodedKey + "=" + value);
				}
			}
		}	
		
		StringBuilder stBuilder = new StringBuilder();

		Iterator<String> it = treeSet.iterator();
		while (it.hasNext()) {
			String tmpSt = it.next();
			stBuilder.append(tmpSt);
			if (it.hasNext()) {
				stBuilder.append("&");
			}
		}
		
		try {
			final String algorithm = "HmacSHA1";
			Mac mac = Mac.getInstance(algorithm);
			mac.init(new SecretKeySpec(privateAccessKey.getBytes(), algorithm));
			
			String stringToSign = "POST" + "\n" + encodeValue(baseURL) + "\n" + stBuilder.toString();
			String signature = hexToString(mac.doFinal(stringToSign.getBytes()));
			
			logger.debug(this.getClass().getName() + "Level 2 signature of: " + stringToSign + " = " + signature);
			return signature;
			
		} catch (InvalidKeyException e) {
			throw new Exception(e);
		} catch (NoSuchAlgorithmException e) {
			throw new Exception(e);
		} catch (UnsupportedEncodingException e) {
			throw new Exception(e);
		}
	}
	
	private String encodeValue(String value) throws UnsupportedEncodingException {
		return URLEncoder.encode(value, "UTF-8").replace("+", "%20").replace("*", "%2A");
	}
	
	private String hexToString(byte[] bytes) {
		BigInteger hash = new BigInteger(1, bytes);
		String hashedValue = hash.toString(16);

		StringBuilder builder = new StringBuilder(hashedValue);
		while (builder.length() < 2 * bytes.length) {
			builder.insert(0, '0');
		}
		return builder.toString().toUpperCase();
	}

}
