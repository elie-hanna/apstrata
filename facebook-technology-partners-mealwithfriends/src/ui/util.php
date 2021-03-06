<?php

	require_once 'lib/APSDB/APSDBClient.php';
	require_once 'lib/APSDB/APSDBConfig.php';
	
	class Util
	{
			
			static $APP_NAMESPACE = "mealwithfriends";
			static $APP_KEY = "157527211099108";
			static $WEB_URL = "http://as.elementn.com";
			static $WEB_DOMAIN = "as.elementn.com";
			static $APP_SECRET = "1229e940a7a4466e896c50cbf23786fa";
			
			public function Util() {
								
			}			
		
	        public function getLinkToFile($fieldName, $fileName, $docKey){
	    	        
	        	$timestamp = round(microtime(true) * 1000);
				$fileUrl = APSDBConfig::$SERVICE_URL . "/" . APSDBConfig::$ACCOUNT_KEY . "/GetFile?apsws.time=" . $timestamp . "&apsws.responseType=json&";
				$fileUrl = $fileUrl . "apsdb.fileName=" .  $fileName . "&apsdb.fieldName=" . $fieldName . "&apsdb.documentKey=" . $docKey . "&apsdb.store=" . APSDBConfig::$ACCOUNT_STORE;
				return $fileUrl;	
	        }	        
	}
	
?>