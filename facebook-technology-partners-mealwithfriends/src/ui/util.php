<?php

	require_once 'lib/APSDB/APSDBClient.php';
	require_once 'lib/APSDB/APSDBConfig.php';
	
	class Util
	{
			
			static $APP_NAMESPACE = "mealwithfriends";
			static $APP_KEY = "157527211099108";
			static $WEB_URL = "http://as.elementn.com";
			
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