package com.apstrata.client.java.test;

import static org.junit.Assert.*;

import org.junit.Ignore;
import org.junit.Test;

import com.apstrata.client.java.connection.TokenConnection;

import org.apache.log4j.Logger;

public class TestClient {

	private static final Logger logger = Logger.getLogger(TestClient.class);
	
	// URL to Apstrata account
	private static final String BASE_URL = "https://sandbox.apstrata.com/apsdb/rest";
	
	// URL to Apsrata account through http
	private static final String NON_SECURED_BASE_URL = "http://sandbox.apstrata.com/apsdb/rest";
	
	// Apstrata authentication key to use
	private static final String ACCOUNT_KEY = "O71307F690";
	
	// Valid username of a user int the Apstrata account
	private static final String USER_NAME = "user1@mail.com";
	
	// Valid password for the aforementioned user
	private static final String PASSWORD = "password";
	
	// Some invalid value
	private static final String INVALID_PASSWORD = "blah";
	
	// time in seconds before refreshing a token
	private static final long RENEW = 5;
	
	// time in seconds before regenerating a token
	private static final long REGENERATE = 15;

	private static final int MAX_LOOPS = 5;
	
	@Test
	public void testTokenConnection() {
		
		TokenConnection connection = null;
		try {
			
			connection = new TokenConnection(BASE_URL, ACCOUNT_KEY, USER_NAME, PASSWORD, RENEW, REGENERATE);
			boolean result = connection.validateToken();
			assertTrue(result);
			for (int i = 0; i < Math.round(REGENERATE / RENEW) * MAX_LOOPS; i++) {
				
				Thread.sleep(RENEW * 1000);
				logger.info("Verifying token validaty after sleep " + i);
				assertTrue(connection.validateToken());				
			}
		} catch (Exception e) {
			
			e.printStackTrace();
			fail();
		} finally {
			
			if (connection != null) {
				connection.terminate();
			}
		}
	}
	
	@Test
	@Ignore
	public void testTerminatedTokenConnection() {
		
		TokenConnection connection = null;
		try {
			
			connection = new TokenConnection(BASE_URL, ACCOUNT_KEY, USER_NAME, PASSWORD, RENEW, REGENERATE);
			boolean result = connection.validateToken();
			assertTrue(result);
			Thread.sleep(REGENERATE * 1000);
			result = connection.validateToken();
			assertTrue(result);
			connection.terminate();
			Thread.sleep(REGENERATE * 2000);
			result = connection.validateToken();			
			assertFalse(result);
		} catch (Exception e) {
			
			e.printStackTrace();
			fail();
		} finally {
			
			if (connection != null) {
				connection.terminate();
			}
		}
	}
	
	@Test
	@Ignore
	public void testInvalidPassword() {		
		
		TokenConnection connection = null;
		try {
					
			connection = new TokenConnection(BASE_URL, ACCOUNT_KEY, USER_NAME, INVALID_PASSWORD, RENEW, REGENERATE);
			boolean result = connection.validateToken();
			assertFalse(result);			
		} catch (Exception e) {
			
			e.printStackTrace();
			fail();
		} finally {
			
			if (connection != null) {
				connection.terminate();
			}
		}
	}
	
	@Test
	@Ignore
	public void testNonSecuredURL() {		
		
		TokenConnection connection = null;
		try {
					
			connection = new TokenConnection(NON_SECURED_BASE_URL, ACCOUNT_KEY, USER_NAME, INVALID_PASSWORD, RENEW, REGENERATE);
			boolean result = connection.validateToken();
			assertFalse(result);			
		} catch (Exception e) {
			
			e.printStackTrace();
			fail();
		} finally {
			
			if (connection != null) {
				connection.terminate();
			}
		}
	}
}