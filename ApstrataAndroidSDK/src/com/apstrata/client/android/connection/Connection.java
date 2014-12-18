package com.apstrata.client.android.connection;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.apache.http.NameValuePair;

/**
 * interface for connection implementations. the connection interface specifies methods for generating request signatures.
 * request signatures are lists of name/value pairs that are appended as parameters to urls invoked by the apstrata android client.
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
	final static String	SIGNATURE_MODE_COMPLEX	= "complex";

	/**
	 * builds a simple request signature corresponding to the combination of the request's action, text parameters and file parameters (for file upload requests)
	 * @param action		the name of the apstrata endpoint invoked by the request, ie, SaveDocument, RunScript, etc...
	 * @param parameters	the list of request parameters, passed as name/value pairs
	 * @param files			the list of the request's file parameters
	 * @return 				the simple signature, consisting of a list of name/value parameters that should be included in the request
	 * @throws 				Exception
	 */
	public List<NameValuePair> getSimpleRequestSignature(String action, List<NameValuePair> parameters, Map<String, List<File>> files) throws Exception;
	
	/**
	 * builds a complex signature for an HTTP POST request. This signature corresponds to the combination of the request's action, text parameters and file parameters (for file upload requests)
	 * @param action 		the name of the apstrata endpoint invoked by the request, ie, SaveDocument, RunScript, etc...
	 * @param parameters 	the list of request parameters, passed as name/value pairs
	 * @param files 		the list of the request's file parameters
	 * @return 				the complex signature, consisting of a list of name/value parameters that should be included in the request
	 * @throws 				Exception
	 */
	public List<NameValuePair> getComplexRequestSignature(String action, List<NameValuePair> parameters, Map<String, List<File>> files) throws Exception;
	
	/**
	 * builds a complex signature for an HTTP GET request. This signature corresponds to the combination of the request's action, text parameters and file parameters (for file upload requests)
	 * @param action 		the name of the apstrata endpoint invoked by the request, ie, SaveDocument, RunScript, etc...
	 * @param parameters 	the list of request parameters, passed as name/value pairs
	 * @param files 		the list of the request's file parameters
	 * @return 				the complex signature, consisting of a list of name/value parameters that should be included in the request
	 * @throws 				Exception
	 */
	public List<NameValuePair> getComplexRequestSignatureHttpGET(String action, List<NameValuePair> parameters, Map<String, List<File>> files) throws Exception;
}
