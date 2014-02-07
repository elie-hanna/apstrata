package com.apstrata.client.android.connection;

import java.io.File;
import java.io.FileInputStream;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.net.URLEncoder;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;

import android.util.Log;

/**
 * this is the Connection implementation that generates request signatures using a user name and password, hence its name, UserConnection. 
 *
 */
public class UserConnection implements Connection {
	
	private String baseUrl;
	private String accountKey;
	private String userName;
	private String userPassword;
	private MessageDigest md5;
	
	/**
	 * @param baseUrl identifies the scheme and the apstrata server that is targeted. Ex: "https://sandbox.apstrata.com/"
	 * @param accKey identifies the customer account
	 * @param userName is the user login
	 * @param userPassword is the user password
	 * @throws Exception if unable to instantiate a MessageDigest that utilizes MD5
	 */
	public UserConnection(String baseUrl, String accKey, String userName, String userPassword) throws Exception {
		try {
			this.md5 = MessageDigest.getInstance("MD5");
		} catch (NoSuchAlgorithmException e) {
			throw new Exception(e);
		}
		
		this.baseUrl = baseUrl;
		this.accountKey = accKey;
		
		this.userName = userName;
		this.userPassword = hexToString(this.md5.digest(userPassword.getBytes()));
	}


	public List<NameValuePair> getSimpleRequestSignature(String action, List<NameValuePair> parameters, Map<String, List<File>> files) throws Exception {
		long timeStamp = System.currentTimeMillis();
		
		String stringToSign = timeStamp + this.userName + action + this.userPassword;
		String signature = hexToString(md5.digest(stringToSign.getBytes()));
		
		Log.d(this.getClass().getName(), "Level 1 signature of: " + stringToSign + " = " + signature);
		
		List<NameValuePair> reqSignature = new ArrayList<NameValuePair>();
		
		reqSignature.add(new BasicNameValuePair(USER, this.userName));
		reqSignature.add(new BasicNameValuePair(SIGNATURE, signature));
		reqSignature.add(new BasicNameValuePair(TIME_STAMP, String.valueOf(timeStamp)));
		reqSignature.add(new BasicNameValuePair(SIGNATURE_MODE, SIGNATURE_MODE_SIMPLE));
		
		return reqSignature;
	}

	public List<NameValuePair> getComplexRequestSignature(String action, List<NameValuePair> parameters, Map<String, List<File>> files) throws Exception {
		String signature = null;
		long timeStamp = System.currentTimeMillis();
		
		Set<String> treeSet = new TreeSet<String>();
		
		treeSet.add(USER + "=" + this.userName);
		treeSet.add(encodeValue(TIME_STAMP) + "=" + encodeValue(String.valueOf(timeStamp)));
		
		if (parameters != null) {
			for (NameValuePair qParam : parameters) {
				String encodedParamName = encodeValue(qParam.getName());
				String encodedParamValue = "";
				if (qParam.getValue() != null) {
					encodedParamValue = encodeValue(qParam.getValue());
				}
				treeSet.add(encodedParamName + "=" + encodedParamValue);
			}
		}

		boolean isMultiPart = files != null && files.size() > 0;
		if(isMultiPart){
			for (Iterator<String> iterator = files.keySet().iterator(); iterator.hasNext();) {
				String fileFieldName = iterator.next();
				String encodedParamName = encodeValue(fileFieldName);
				List<File> fieldFiles = files.get(fileFieldName);
				for (Iterator<File> iterator2 = fieldFiles.iterator(); iterator2.hasNext();) {
					File file = (File) iterator2.next();
					FileInputStream fis = new FileInputStream(file);
					byte[] bytes = new byte[4096];
					int readPos = fis.read(bytes);
					while (readPos != -1) {
						this.md5.update(bytes, 0, readPos);
						readPos = fis.read(bytes);
					}
					
					String hashedValue = hexToString(this.md5.digest());
					String encodedParamValue = encodeValue(hashedValue);
					treeSet.add(encodedParamName + "=" + encodedParamValue);
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
			mac.init(new SecretKeySpec(this.userPassword.getBytes(), algorithm));
			
			String url = this.baseUrl + "/" + this.accountKey + "/" + action;
			String stringToSign = "POST" + "\n" + encodeValue(url) + "\n" + stBuilder.toString();
			signature = hexToString(mac.doFinal(stringToSign.getBytes()));
			
			Log.d(this.getClass().getName(), "Level 2 signature of: " + stringToSign + " = " + signature);
			
		} catch (InvalidKeyException e) {
			throw new Exception(e);
		} catch (NoSuchAlgorithmException e) {
			throw new Exception(e);
		} catch (UnsupportedEncodingException e) {
			throw new Exception(e);
		}
		
		List<NameValuePair> reqSignature = new ArrayList<NameValuePair>();
		
		reqSignature.add(new BasicNameValuePair(USER, this.userName));
		reqSignature.add(new BasicNameValuePair(SIGNATURE, signature));
		reqSignature.add(new BasicNameValuePair(TIME_STAMP, String.valueOf(timeStamp)));
		
		return reqSignature;
	}

	private String hexToString(byte[] bytes) {
		BigInteger hash = new BigInteger(1, bytes);
		String hashedValue = hash.toString(16);

		StringBuilder builder = new StringBuilder(hashedValue);
		while (builder.length() < 2 * bytes.length) {
			builder.insert(0, '0');
		}
		return builder.toString().toUpperCase(Locale.US);
	}
	
	private String encodeValue(String value) throws UnsupportedEncodingException {
		return URLEncoder.encode(value, "UTF-8").replace("+", "%20").replace("*", "%2A");
	}
}
