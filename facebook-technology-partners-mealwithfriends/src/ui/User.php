<?php
	
	require_once 'lib/APSDB/APSDBClient.php';
	require_once 'lib/APSDB/APSDBConfig.php';
	require_once 'util.php';
	
	class User {
	
		private $userName;
		private $hashedPassword;
		private $accessToken;
		private $name;
		private $picture;
		private $apstrataToken;
	
		// Use this constructor if you have an Apstrata hashed password for the user and
		// optionnally, a Facebook access token	
		public function User($userName, $hashedPassword, $accessToken, $apstrataToken) {
			
			$this->userName = $userName;
			$this->hashedPassword = $hashedPassword;
			$this->accessToken = $accessToken;  
			$this->apstrataToken = $apstrataToken;
			$this->loadUserInfo();
		}
		
		public function getApstrataToken() {
			return $this->apstrataToken;
		}
		
		public function getUserName() {
			return $this->nameToken;
		}
		
		public function getName() {
			return $this->name;
		}
		
		public function getPicture() {
			return $this->picture;
		}
		
		public function getAccessToken() {
			return $this->accessToken;		
		}
		
		public function getHashedPassword() {
			return $this->hashedPassword;
		}
		
		public function loadUserInfo() {
		
			$params = array();
			if ($this->userName != null) {
				
				array_push($params, new KeyValue("apsdb.scriptName", "ftp.api.getUserData"));
				if ($this->hashedPassword != null) {										 
					$client = new APSDBClient(APSDBConfig :: $ACCOUNT_KEY, $hashedPassword, $userName, true);					
				}else {
					$client = new APSDBClient(APSDBConfig :: $ACCOUNT_KEY, null, $this->userName, false, $this->apstrataToken);
				}
					
				$userInfoResult = $client->callApi("RunScript", $params);
				if ($userInfoResult['response']['result'] != null) {
					
					$this->picture = $userInfoResult['response']['result']['user']['facebookPicture'];
					$this->name = $userInfoResult['response']['result']['user']['name'];
				} 
			}	
		}
		 
	}
?>