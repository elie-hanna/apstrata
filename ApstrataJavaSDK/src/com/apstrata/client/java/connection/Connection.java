package com.apstrata.client.java.connection;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.apache.http.NameValuePair;

/**
 * interface for connection implementations. the connection interface specifies methods for generating request signatures.
 * request signatures are lists of name/value pairs that are appended as parameters to urls invoked by the apstrata client.
 * these parameters collectively form the request's signature and are used by server side code to validate the request.
 * request signatures come in 2 flavours: complex and simple, hence the 2 corresponding methods of the interface.
 * 
 * @author apstrata
 *
 */
public interface Connection {
	
	final static String	APSWS_PREFIX			= "apsws.";
	final static String	APSDB_PREFIX			= "apsdb.";
	
	final static String	USER					= APSWS_PREFIX + "user";
	final static String	TIME_STAMP				= APSWS_PREFIX + "time";
	final static String	SIGNATURE_MODE			= APSWS_PREFIX + "authMode";
	final static String	SIGNATURE				= APSWS_PREFIX + "authSig";
	
	final static String	SIGNATURE_MODE_SIMPLE	= "simple";

	public List<NameValuePair> getSimpleRequestSignature(String action, List<NameValuePair> parameters, Map<String, List<File>> files) throws Exception;
	
	public List<NameValuePair> getComplexRequestSignature(String action, List<NameValuePair> parameters, Map<String, List<File>> files) throws Exception;
}
