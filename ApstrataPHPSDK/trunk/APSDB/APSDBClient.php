<?php
/*******************************************************************************
 *  Copyright 2009 apstrata
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *
 *  You may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0.html
 *  This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 *  CONDITIONS OF ANY KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations under the License.
 * *****************************************************************************
 */

require_once 'APSDBConfig.php';
require_once 'Common/Constants.php';
require_once 'Common/KeyValue.php';

/**
 * APSDBClient
 *
 * Please update the configuration file (APSDBConfig.php) with the correct values
 *
 */
class APSDBClient
{
    private $accountKey;
    private $accountSecret;
    private $serviceURL;
    private $user;
    private $APS_DB_URL;

	/**
     * This client is used to make requests to Apstrata.
     * It can be used to make owner, user or anonymous requests depending on the parameters you pass.
     * 
     * Owner request:
     *
     * @param string $accountKey (mandatory)
     * 		This parameter should be the Apstrata authKey of your account.
     * @param string $accountSecret (mandatory)
     * 		This parameter should be the Apstrata secret of your account.
     * @param string $serviceURL
     * 		This parameter should be the serviceURL.
	 *	
     * User request:
     *
     * @param string $accountKey (mandatory)
     * 		This parameter should be the Apstrata authKey of your account.
     * @param string $accountSecret (mandatory)
     * 		This parameter should be the user's password.
     * @param string $userLogin (mandatory)
     * 		This parameter should be the user's login.
     * 
     * @param string $serviceURL
     * 		This parameter should be the serviceURL.

     *
     * Anonymous request:
     *
     * @param string $accountKey (mandatory)
     * 		This parameter should be the Apstrata authKey of your account.
     * @param string $serviceURL
     * 		This parameter should be the serviceURL.
     */
    public function  APSDBClient($accountKey, $accountSecret = null, $userLogin = null, $serviceURL = null)
    {
        $this->accountKey = $accountKey;
        $this->userLogin = $userLogin;
        
        if($userLogin != null){
        	// If this is a user request then the second parameter $accountSecret is the user's password
            $this->accountSecret = strtoupper(md5($accountSecret));
        } else{
            // If this is an owner request then the second parameter $accountSecret is the account's secret
            $this->accountSecret = $accountSecret;
        }
        
        if($serviceURL != null){
	        $this->serviceURL = $serviceURL;
        }else {
	        // The rest url will be read from the APSDBConfig.php file (remember to update it before using the client)
	        $theURL = APSDBConfig::$SERVICE_URL;
        	$this->serviceURL = $theURL;
        }        
            
        $this->APS_DB_URL = $this->serviceURL;
    }
    
    /**
     * This function makes requests to Apstrata to execute the specified API and returns the response's body and headers.
     * 
     * @param string $action (mandatory)
     *		The name of the Apstrata API that will be executed.
     * @param array $arrParams (mandatory)
     *		The array of $KeyValue object containing all the parameters to be passed to the API call.
     * @param string $destinationPath (optional)
     *		If this optional parameter is specified the response won't be returned by the function but will be written to the specified file.  
     *		Note though that the headers will be returned in the response as usual. This parameter is required if the API executed is GetFile.
     *
     * @return array containing the Apstrata response's body and headers. The returned array has two entries:
     *		'response' containing the body of the Apstrata response.
     *		'headers' containing the headers set by Apstrata.
     */
    public function callApi($action, $arrParams, $destinationPath = null)
    {
        // If the API executed is GetFile then the $destinationPath parameter is required.
        if($action == Constants::GET_FILE && $destinationPath == null)
        	exit(Constants::GET_FILE_MISSING_PARAM_ERROR_MSG);
        	
        $fullURL = $this->getFullURL($action, $arrParams,"POST");
        $result = $this->sendRequest($fullURL, $arrParams, $destinationPath);
        return array("response" => $this->formatResponse($result['response']), "headers" => $result['headers']);
    }
    
    /**
     * This function is called to construct the REST URL by adding some necessary parameters to the hostname.
     * 
     * @param string $action (mandatory)
     *		The name of the Apstrata API that will be executed.
     * @param array $params (mandatory)
     *		The array of $KeyValue object containing all the parameters to be passed to the API call.
     
     * @return string containing the REST URL to be sent to Apstrata.
     */
    public function getFullURL($action, $params,$method)
    {
        // Adding apsws.responseType and apsws.time parameters
        $time = time();
        $paramString = "?apsws.responseType=json&apsws.time=" . $time;
        
        // Adding apsws.user parameter if the request was executed by a user.
        if($this->userLogin != null)
            $paramString .= "&apsws.user=" . $this->userLogin;
        
        $tmpURL = "";
        $tmpURL =  $this->APS_DB_URL . "/" . $this->accountKey . "/" . $action;

        // If the request is executed by an account's owner or a user then compute the signature to be sent with the request.
        if($this->accountSecret != null){
            
	        $allParam = array();
	        array_push($allParam, new KeyValue("apsws.time", $time));
	        array_push($allParam, new KeyValue("apsws.responseType", "json"));
	
	        if($this->userLogin != null)
	            array_push($allParam, new KeyValue("apsws.user", $this->userLogin));
	
	        for($i=0; $i < count($params); $i++){
	            array_push($allParam, $params[$i]);
	        }
	        
            $isFile = false;
	        for($i=0; $i < count($params); $i++){
	            if($params[$i]->isFile()){
	                $isFile = true;
	                break;
	            }
	        }
	        
	        if($isFile){
		        $paramString .= "&apsws.authSig=" . $this->getLevel1HashString($this->accountKey, $this->accountSecret, $action, $time);
	        	$paramString .= "&apsws.authMode=simple";
	        }else {
	        	$paramString .= "&apsws.authSig=" . $this->getLevel2HashString($allParam, $this->accountSecret, $tmpURL,$method);
	        }
	        
        }
        return $tmpURL . $paramString;
    }

    /**
     * This function produces the Apstrata Default signature.
     * This is the most secure method of authentication because it requires hashing all content of a request 
     * along with the secret of the account or the password of the user and then sending the hash.  
     * 
     * @param array $params (mandatory)
     *		The array of $KeyValue object containing all the parameters to be passed to the API call.
     * @param string $secretKey (mandatory)
     * 		If the request is executed by the owner then this should be the account's secret, if it is executed by
     *		a user then this parameter should be the user's password.
     * @param string $url (mandatory)
     * 		The $url will include the scheme, host, port (if present), and the path. It will not include any of the parameters. 
     * 		(ex: http://sandbox.apstrata.com/apsdb/rest/[authentication_key]/[action])
     *
     * @return string containing the Apstrata default signature.
     * 
     */
    private function getLevel2HashString($params, $secretKey, $url,$method)
    {
        $arrToSort = array();
        for($i =0; $i < count($params); $i++){
        
            $value = $params[$i]->getValue();
            $key = $params[$i]->getKey();
            $rightHandSide = "";
            if($params[$i]->isFile()){
            
                if($value != null && $value != "")
            		$tmp_name = $value["tmp_name"];
                    $rightHandSide = rawurlencode(strtoupper(md5_file($tmp_name)));
                    
                $value = rawurlencode($key)."=".$rightHandSide;
                if($this->contains($arrToSort, $value) == false)
                    array_push($arrToSort, $value);
                    
            } else {
            
                if($value != null && $value != "")
                    $rightHandSide = rawurlencode($value);
                    
                $value = rawurlencode($key)."=".$rightHandSide;
                
                if($this->contains($arrToSort, $value) == false)
                    array_push($arrToSort, $value);
                    
            }
        }
        sort($arrToSort);
        $stringToHash = "";
        for($i=0; $i < count($arrToSort); $i++){
        
            $stringToHash .= $arrToSort[$i];
            if($i < count($arrToSort) - 1)
                $stringToHash .= "&";
        }
        $stringToHash = $method . "\n" . rawurlencode($url) . "\n" . $stringToHash;
        return hash_hmac("sha1", $stringToHash, $secretKey);
    }

 	/**
     * Tests if the array $arr contains $value.
     * 
     * @param array $arr
     * @param string $value
     * @return boolean true if the array contains the value and false otherwise.
     */
    private function contains($arr, $value)
    {
        for($i=0; $i< count($arr); $i++){
            if($arr[$i] == $value)
                return true;
        }
        return false;
    }

    /**
     * This function sends the request to Apstrata to execute the specified API and returns the response's body and headers.
     * 
     * @param string $fullURL (mandatory)
     *		The full url of the request.
     * @param array $parameters (mandatory)
     *		The array of $KeyValue object containing all the parameters to be passed to the API call.
     * @param string $destinationPath (mandatory)
     *		If this parameter is not null, the response won't be returned by the function but will be written to the specified file.  
     *		Note though that the headers will be returned in the response as usual. 
     *
     * @return array containing the Apstrata response's body and headers. The returned array has two entries:
     *		'response' containing the body of the Apstrata response.
     *		'headers' containing the headers set by Apstrata.
     */
    private function sendRequest($fullURL, array $parameters, $destinationPath)
    {
        $useMutliPart = false;
        for($i=0; $i < count($parameters); $i++){
            if($parameters[$i]->isFile()){
                $useMutliPart = true;
                break;
            }
        }

        if($useMutliPart == false) 
            return $this->sendNonMultiPart($fullURL, $parameters, $destinationPath);
        else 
            return $this->sendMultiPart($fullURL, $parameters, $destinationPath);
    }

    private function sendNonMultiPart($fullURL, $parameters, $destinationPath)
    {
        $query = "";
        for($i=0; $i < count($parameters); $i++){
        
            $query .= urlencode($parameters[$i]->getKey()) . "=" . urlencode($parameters[$i]->getValue());
            if($i < count($parameters) - 1)
                $query .= "&";
        }

        $url = parse_url ($fullURL);
        $postReq  = "POST ".$url['path']."?".$url['query']." HTTP/1.0\r\n";
        $postReq .= "Host: " . $url['host'] . (empty($url['port']) ? "" : ":".$url['port']) ."\r\n";
        $postReq .= "Content-Type: application/x-www-form-urlencoded; charset=utf-8\r\n";
        $postReq .= "Content-Length: " . strlen($query) . "\r\n";
        $postReq .= "\r\n";
        $postReq .= $query;
        
        $port = $this->getPort($url, $fullURL);
        $hostName = $this->getHostName($url, $fullURL);
        
        $sourceFileHandle = @fsockopen($hostName, $port, $errno, $errstr);
        
        if($sourceFileHandle){
            
            fwrite($sourceFileHandle, $postReq);
            $response = $this->getResponse($sourceFileHandle, $destinationPath);
	        fclose($sourceFileHandle);
	        return $this->buildResponse($response);
	        
        } else {
            exit(Constants::CANNOT_CONNECT_TO_SERVER_ERROR_MSG);
        }
    }

    private function sendMultiPart($fullURL, $parameters, $destinationPath)
    {
        $boundary = "---------------------".substr(md5(rand(0,32000)),0,10);
        $url = parse_url ($fullURL);
        $postReq  = "POST ".$url['path']."?".$url['query']." HTTP/1.0\r\n";
        $postReq .= "Host: " . $url['host'] . "\r\n";
        $postReq .= "Content-Type: multipart/form-data; boundary=". $boundary ."\r\n";
        $postReq .= "Content-length: " . $this->getContentLength($boundary, $parameters) . "\r\n\r\n";
        $postReq .= "--". $boundary . "\r\n";
        
        $port = $this->getPort($url, $fullURL);
		$hostName = $this->getHostName($url, $fullURL);
		
        $sourceFileHandle = @fsockopen($hostName, $port, $errno, $errstr);
        
        if($sourceFileHandle){
        
            fwrite($sourceFileHandle, $postReq);
            
            for($i=0; $i < count($parameters); $i++){
                
                if($parameters[$i]->isFile() == false){
                
                    $data = "Content-Disposition: form-data; name=\"".$parameters[$i]->getKey()."\"\r\n";
                    $data .= "\r\n".$parameters[$i]->getValue()."\r\n";                    
                    fwrite($sourceFileHandle, $data);
                    
                } else {
                	
	            	$theValue = $parameters[$i]->getValue();
            	
	            	$theFilename = $theValue["name"];
	            	settype($theFilename, "string");
	
                    $fileName = basename($theFilename);
                    $data ="Content-Disposition: form-data; name=\"". $parameters[$i]->getKey() ."\"; filename=\"".$fileName."\"\r\n";
                    $data .= "Content-Type: application/octet-stream\r\n\r\n";
                    fwrite($sourceFileHandle, $data);
	                $filContentHandler = fopen($theValue["tmp_name"], "r");
                    if($filContentHandler){
                        while (!feof($filContentHandler)){
	                        fwrite($sourceFileHandle, fread($filContentHandler, 1024));
	                    }
                    
                        fclose($filContentHandler);
                        fwrite($sourceFileHandle, "\r\n");
                    } 
                                       
                }
                if($i < count($parameters) - 1) 
                    fwrite($sourceFileHandle, "--" .$boundary. "\r\n");
                else 
                    fwrite($sourceFileHandle, "--".$boundary. "--\r\n");
            }
            
            $response = $this->getResponse($sourceFileHandle, $destinationPath);
	        fclose($sourceFileHandle);
	        return $this->buildResponse($response);
	        
        } else {
        
            exit(Constants::GENERAL_ERROR_MSG);
            
        }
    }

    /**
     * This method is responsible for calculating the content length when sending
     * multipart requests
     *
     * @param string $boundary
     * @param array $parameters
     * @return int representing the content length
     */
    private function getContentLength($boundary, $parameters)
    {

        $filesLength = 0;
        $data = "--". $boundary . "\r\n";
        for($i=0; $i < count($parameters); $i++){

            if($parameters[$i]->isFile()){
            	$theValue = $parameters[$i]->getValue();
            	
            	$theFilename = $theValue["name"];
            	settype($theFilename, "string");

                $fileName = basename($theFilename);
                $data .="Content-Disposition: form-data; name=\"". $parameters[$i]->getKey() ."\"; filename=\"".$fileName."\"\r\n";
                $data .= "Content-Type: application/octet-stream\r\n\r\n";
                $filesLength = $filesLength + filesize($theValue["tmp_name"]);
                $data .= "\r\n";
            } else {
                $data .= "Content-Disposition: form-data; name=\"".$parameters[$i]->getKey()."\"\r\n";
                $data .= "\r\n".$parameters[$i]->getValue()."\r\n";
            }
            
            if($i < count($parameters) - 1)
                $data .= "--" .$boundary. "\r\n";
            else
                $data .= "--".$boundary. "--\r\n";
                
        }
        return strlen($data) + $filesLength;        
    }
    
    private function buildResponse($response)
    {
        $tmp = explode("\r\n\r\n", $response);
		
        $responseBody = $tmp[1];
        $headers = explode("\r\n", $tmp[0]);
                
        return array("response" => $responseBody,"headers"=>$headers);
    }
    
    private function getLevel1HashString($userName, $secret, $action, $timeStamp) 
	{
		$valueToHash = $timeStamp . $userName . $action . $secret;
		$signature = md5($valueToHash, false);
		return $signature;
	}			
    
    
    private function  formatResponse($jsonResponseBody)
    {
       $response = json_decode($jsonResponseBody,true);
       return $response['response'];
    }
    
    private function getPort($url, $fullURL)
    {
    	$port = "";
    	
        if(isset ($url['port']) == false || $url['port'] == ''){
        	if(substr($fullURL, 0, 5) == "https")
            	$port = '443';
        	else
        		$port = '80';
        } else {
            $port = $url['port'];
        }
        
        return $port;
    }
    
    private function getHostName($url, $fullURL)
    {
    	$hostName = $url['host'];
        if(substr($fullURL, 0, 5) == "https")
        	$hostName = "ssl://" . $hostName;
        	
        return $hostName;
    }
    
    private function getResponse($sourceFileHandle, $destinationPath)
    {
    	$response = "";   
    	if($destinationPath != null){
    	
    		$startOfBodyResponse = false; 
    		$line = "";    
            $destinationFileHandle = fopen($destinationPath, 'w');
            
            while(!feof($sourceFileHandle)){
            	
	            if(!$startOfBodyResponse){
	            	$line = fgets($sourceFileHandle);
	            	$response .= $line;
	            } else {
                    fwrite($destinationFileHandle, fread($sourceFileHandle, 1024)); 
                }
                
                if($line == "\r\n"){
                    $startOfBodyResponse = true;
                }
            }
            fclose($destinationFileHandle);
        } else {
            while (!feof($sourceFileHandle)) {
                $response .= fgets($sourceFileHandle, 1024);
            }
        }
        return $response;
    }
}
?>
