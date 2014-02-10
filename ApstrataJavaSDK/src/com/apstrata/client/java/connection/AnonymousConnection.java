package com.apstrata.client.java.connection;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;

/**
 * this is the Connection implementation that generates request signatures for anonymous requests, hence its name, AnonymousConnection.
 * it does not require any form of user name nor password. the 2 types of signatures it generates are identical.
 *
 */
public class AnonymousConnection implements Connection {
	
	public List<NameValuePair> getSimpleRequestSignature(String action, List<NameValuePair> parameters, Map<String, List<File>> files) throws Exception {
		long timeStamp = System.currentTimeMillis();
		List<NameValuePair> reqSignature = new ArrayList<NameValuePair>();
		reqSignature.add(new BasicNameValuePair(TIME_STAMP, String.valueOf(timeStamp)));
		return reqSignature;
	}

	public List<NameValuePair> getComplexRequestSignature(String action, List<NameValuePair> parameters, Map<String, List<File>> files) throws Exception {
		return getSimpleRequestSignature(action, parameters, files);
	}
}
