package com.apstrata.client.java;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

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

import com.apstrata.client.java.connection.Connection;
import org.apache.log4j.Logger; 

public class Client {
	
	private final static String	APSTRATA_PREFIX		= "apsws.";
	private final static String	RESPONSE_TYPE_PARAM = APSTRATA_PREFIX + "responseType";
	
	public final static String	RESPONSE_TYPE_XML	= "xml";
	public final static String	RESPONSE_TYPE_JSON	= "json";
	
	public static Logger logger = Logger.getLogger("com.apstrata.client.java");
	
	public enum AuthMode {
	    SIMPLE, COMPLEX
	}
	
	private Connection connection;
	private String baseUrl;
	private String accountKey;
	
	
	public Client(String baseUrl, String accountKey, Connection conn) {
		this.connection = conn;
		this.baseUrl = baseUrl;
		this.accountKey = accountKey;
	}
	
	public Connection getConn() {
		return connection;
	}
	
	public void setConn(Connection conn) {
		this.connection = conn;
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
	public String getSignedRequestUrl(String action, List<NameValuePair> parameters, Map<String, List<File>> files, AuthMode mode) throws Exception {
		if (this.connection == null) {
			throw new Exception("null connection");
		}
		
		// TODO: add the run as user option to the call api options	
		
		String url = this.baseUrl + "/" + this.accountKey + "/" + action + "?";
		
		List<NameValuePair> requestSignatureParams = (mode == AuthMode.SIMPLE? 
					this.connection.getSimpleRequestSignature(action, parameters, files): 
					this.connection.getComplexRequestSignature(action, parameters, files));
		
		for (Iterator<NameValuePair> iterator = requestSignatureParams.iterator(); iterator.hasNext();) {
			NameValuePair nameValuePair = (NameValuePair) iterator.next();
			url += nameValuePair.getName() + "=" + nameValuePair.getValue() + (iterator.hasNext()? "&": "");
		}

		logger.debug(this.getClass().getName() + " built apstrata url: " + url);
		return url;
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
	public String callAPI(String methodName, List<NameValuePair> params, Map<String, List<File>> files, AuthMode mode) throws Exception {
		String apiUrl = this.getSignedRequestUrl(methodName, params, files, mode);
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
	public InputStream callAPIStream(String methodName, List<NameValuePair> params, Map<String, List<File>> files, AuthMode mode, HttpClient httpClient) throws Exception {
		String apiUrl = this.getSignedRequestUrl(methodName, params, files, mode);
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
	public String callAPIJson(String methodName, List<NameValuePair> params, Map<String, List<File>> files, AuthMode mode) throws Exception {
		List<NameValuePair> paramsUpdated = setApiParam(params, RESPONSE_TYPE_PARAM, RESPONSE_TYPE_JSON);
		String resultText = callAPI(methodName, paramsUpdated, files, mode);
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
	public String callAPIXml(String methodName, List<NameValuePair> params, Map<String, List<File>> files, AuthMode mode) throws Exception {
		List<NameValuePair> paramsUpdated = setApiParam(params, RESPONSE_TYPE_PARAM, RESPONSE_TYPE_XML);
		String resultText = callAPI(methodName, paramsUpdated, files, mode);
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
	public File callAPIFile(String methodName, List<NameValuePair> params, AuthMode mode, String path) throws Exception {
		String apiUrl = getSignedRequestUrl(methodName, params, null, mode);
		
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
		if (params != null) {
			for (Iterator<NameValuePair> iterator = params.iterator(); iterator.hasNext();) {
				NameValuePair nameValuePair = (NameValuePair) iterator.next();
				if (!nameValuePair.getName().equals(paramName)) {
					paramsUpdated.add(nameValuePair);
				}
			}
		}
		paramsUpdated.add(new BasicNameValuePair(paramName, paramValue));
		return paramsUpdated;
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
			
		}
		
		logger.debug(this.getClass().getName() + " success invoking apstrata at " + fullURL + ", response: " + sb);
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
			Charset utf8Charset = Charset.forName("UTF-8");
			
			if (parameters != null) {
				for (Iterator<NameValuePair> iterator = parameters.iterator(); iterator.hasNext();) {
					NameValuePair nameValuePair = (NameValuePair) iterator.next();
					entity.addPart(nameValuePair.getName(), new StringBody(nameValuePair.getValue(), utf8Charset));
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
			
			logger.debug(this.getClass().getName() + " exception invoking apstrata at " + fullURL, e);
			throw new Exception(e);
		}
	}
	
}
