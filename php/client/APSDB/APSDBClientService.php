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

require_once 'APSDB/Common/Logger.php';
require_once 'APSDB/APSDBConfig.php';
require_once 'APSDB/Common/Constants.php';

/**
 * APSDBClientService
 *
 * Please update the configuration file (APSDBConfig.php) with the correct
 * values
 *
 */
class APSDBClientService
{
    private $publicAccessKey;
    private $privateAccessKey;
    private $APS_DB_URL;

    /**
     * Constructor
     *
     * @param string $publicAccessKey
     * @param string $privateAccessKey
     */
    public function  __construct($publicAccessKey, $privateAccessKey)
    {
        $this->publicAccessKey = $publicAccessKey;
        $this->privateAccessKey = $privateAccessKey;
        $this->APS_DB_URL = APSDBConfig::$SERVICE_URL;
    }

    /**
     * Responsible for creating a store.
     * Will return an object inheriting APSDBResponse of
     * type CreateStoreResponse
     * 
     * @param string $storeName
     * @return CreateStoreResponse
     */
    public function createStore($storeName)
    {
        require_once 'Model/CreateStoreRequest.php';
        require_once 'Model/CreateStoreResponse.php';
        $createStoreRequest = new CreateStoreRequest($storeName);
        $fullURL = $this->APS_DB_URL . $this->getURLParams($createStoreRequest->getAction());
        $result = $this->sendRequest($fullURL, $createStoreRequest->getParameters());
        $response = $result['response'];
        return new CreateStoreResponse($response);
    }

    /**
     * Responsible for deleting a store. will return an instance of
     * DeleteStoreResponse which inherits APSDBResponse
     * 
     * @param string $storeName
     * @return DeleteStoreResponse
     */
    public function deleteStore($storeName)
    {
        require_once 'Model/DeleteStoreRequest.php';
        require_once 'Model/DeleteStoreResponse.php';
        $deleteStoreRequest = new DeleteStoreRequest($storeName);
        $fullURL = $this->APS_DB_URL . $this->getURLParams($deleteStoreRequest->getAction());
        $result = $this->sendRequest($fullURL, $deleteStoreRequest->getParameters());
        $response = $result['response'];
        return new DeleteStoreResponse($response);
    }

    /**
     * Will return a ListStoresResponse containing all the store names
     *
     * @return ListStoresResponse
     */
    public function listStores()
    {
        require_once 'Model/ListStoresRequest.php';
        require_once 'Model/ListStoresResponse.php';
        $listStoresRequest = new ListStoresRequest();
        $fullURL = $this->APS_DB_URL . $this->getURLParams($listStoresRequest->getAction());
        $result = $this->sendRequest($fullURL, $listStoresRequest->getParameters());
        $response = $result['response'];
        return new ListStoresResponse($response);
    }

    /**
     * Will save or update a document
     *
     * @param SaveDocumentRequest $saveDocumentRequest
     * @return SaveDocumentResponse
     */
    public function saveDocument($saveDocumentRequest)
    {        
        require_once 'Model/SaveDocumentResponse.php';
        $fullURL = $this->APS_DB_URL . $this->getURLParams($saveDocumentRequest->getAction());
        $result = $this->sendRequest($fullURL, $saveDocumentRequest->getParameters());
        $response = $result['response'];
        return new SaveDocumentResponse($response);
    }

    /**
     * Deletes a document
     *
     * @param string $storeName
     * @param string $documentKey
     * @return DeleteDocumentResponse
     */
    public function deleteDocument($storeName, $documentKey)
    {
        require_once 'Model/DeleteDocumentRequest.php';
        require_once 'Model/DeleteDocumentResponse.php';

        $deleteDocumentRequest = new DeleteDocumentRequest($storeName, $documentKey);
        $fullURL = $this->APS_DB_URL . $this->getURLParams($deleteDocumentRequest->getAction());
        $result = $this->sendRequest($fullURL, $deleteDocumentRequest->getParameters());
        $response = $result['response'];
        return new DeleteDocumentResponse($response);       
    }

    /**
     * Returns a QueryResponse which contains an array
     * of Document
     *
     * @param QueryRequest $queryRequest
     * @return QueryResponse
     */
    public function query($queryRequest)
    {
        require_once 'Model/QueryRequest.php';
        require_once 'Model/QueryResponse.php';

        $fullURL = $this->APS_DB_URL . $this->getURLParams($queryRequest->getAction());
        $result = $this->sendRequest($fullURL, $queryRequest->getParameters());
        $response = $result['response'];
        return new QueryResponse($response);
    }

    /**
     * This method will return a url pointing to the file
     *
     * @param string $storeName
     * @param string $documentKey
     * @param string $fieldName
     */
    public function getFileURL($storeName, $documentKey, $fieldName, $setContentDisposition = false)
    {
        require_once 'Model/GetFileRequest.php';

        $getFileRequest = new getFileRequest($storeName, $documentKey, $fieldName);
        $fullURL = $this->APS_DB_URL . $this->getURLParams($getFileRequest->getAction());
        $parameters = $getFileRequest->getParameters();
        foreach ($parameters as $key => $value)
        {
            $fullURL .= "&" . urlencode($key) . "=" . urlencode($parameters[$key]);
        }
        $fullURL .= "&apsdb.setContentDisposition=";
        if($setContentDisposition)
        {
            $fullURL .= "true";
        }
        else
        {
          $fullURL .= "false";
        }
        return $fullURL;
    }

    public function getFile($storeName, $documentKey, $fieldName, $destinationPath, $overWriteExistingFile)
    {
        if($overWriteExistingFile === true)
        {
            if(file_exists($destinationPath) === true)
            {
                unlink($destinationPath);
            }
        }
        else
        {
            if(file_exists($destinationPath) === true)
            {
                throw new Exception("File already Exist");
            }
        }
        $fileURL = $this->getFileURL($storeName, $documentKey, $fieldName, false);

        $url = parse_url ($fileURL);
        $getRequest  = "GET ".$url['path']."?".$url['query']." HTTP/1.0\r\n";
        $getRequest .= "Host: " . $url['host'] . "\r\n";
		$getRequest .= "Connection: Close\r\n\r\n";

        $port = "";
        if(isset ($url['port']) == false || $url['port'] == '')
        {
            $port = '80';
        }
        else
        {
            $port = $url['port'];
        }

        $f = fsockopen($url['host'], $port, $errno, $errstr);//@fopen($fileURL, "r", true, $responseHeaders);

        if($f)
        {
            fwrite($f, $getRequest);

            $handle = fopen($destinationPath, 'a');
            $startOfFile = false;
            $firstLine = null;
            while(!feof($f))
            {
                $line = fgets($f);
                if($firstLine == null)
                {
                    $firstLine = $line;
                    if(strstr($firstLine, "400"))
                    {
                        fclose($handle);
                        fclose($f);
                        throw new Exception("Bad request (400)");
                    }
                    if(strstr($firstLine, "404"))
                    {
                        fclose($handle);
                        fclose($f);
                        throw new Exception("File not found (404)");
                    }
                }
                if($startOfFile)
                {
                    fwrite($handle, $line);
                }
                if($line == "\r\n")
                {
                    $startOfFile = true;
                }
            }
            fclose($handle);
            fclose($f);
        }
        else
        {
            throw new Exception("Cannot connect to server");
        }
    }

    /**
     * Responsible of returning the necessary query string
     * These parameters will be appended to the URL
     * 
     * @param string $action
     * @return string
     */
    private function getURLParams($action)
    {
        $time = time();
        $paramString = "?apsdb.action=" . $action;
        $paramString .= "&apsws.time=" . $time;
        $paramString .= "&apsws.authKey=" . $this->publicAccessKey;
        $paramString .= "&apsws.authSig=" . $this->getHashString($action, $time);
        return $paramString;
    }

    /**
     * Responsible for producing the signature
     * 
     * @param String $action
     * @param String $time
     */
    private function getHashString($action, $time)
    {
        $valueToHash = $time . $this->publicAccessKey . $action . $this->privateAccessKey;
        $hashedValue = md5($valueToHash);
        return $hashedValue;
    }

    /**
     * Invoke request and return response and content type
     * Will throw an exception in case the request failed
     * 
     * @param string $fullURL
     * @param array $parameters
     * @return array
     */
    //TODO: Should stream to disk in the getFile case
    private function sendRequest($fullURL, array $parameters)
    {
        
        $ch = curl_init();

        // set the target url
        curl_setopt($ch, CURLOPT_URL, $fullURL);

        // how many parameter to post
        curl_setopt($ch, CURLOPT_POST, count($parameters));

        //$fd = fopen("C:/APSDBLog.TXT", "a");
        //curl_setopt($ch, CURLOPT_WRITEHEADER, $fd);

        curl_setopt($ch, CURLOPT_POSTFIELDS, $this->prepareQueryStValues($parameters));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        //will return false if failed
        //else it will return the response
        $result = curl_exec ($ch);
        
        $log = Logger::getInstance();

        if($log->isLoggingOn())
        {
            $log->logToFile("Curl Result: " . $result);
        }

        if($result == false)
        {
            if($log->isLoggingOn())
            {
                $log->logToFile("Curl Result FAILED ". curl_error($ch) . " (" . curl_errno($ch) . ")");
            }
            curl_close ($ch);
            throw new Exception(Constants::GENERAL_ERROR_MSG);
        }
        else
        {
            $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
            if($log->isLoggingOn())
            {
                $log->logToFile("Content Type: " . $contentType);
            }
            curl_close ($ch);
        }
        return array("response" => $result, "contentType" => $contentType);
    }

    /**
     * Will go through the array of query string
     * if any has a file delimeter, will replace it with
     * an @ so the curl can upload the file. if a file exist
     * an array will be returned in order for curl library to submit
     * multipart
     *
     * @param array $parameters
     * @return object
     */
    private function prepareQueryStValues(array $parameters)
    {
        $paraArr = array();
        $returnString = true;
        foreach ($parameters as $key => $value)
        {
            $subStr = substr($value, 0, strlen(Constants::FILE_INDICATOR));
            if($subStr == Constants::FILE_INDICATOR)
            {
                $returnString = false;
                $parameters[$key] = '@' . substr($value, strlen(Constants::FILE_INDICATOR));
            }
            array_push($paraArr, $key.'='.urlencode($parameters[$key]));
        }
        $parameters['apsdb.requestType'] = "POST";

        $log = Logger::getInstance();
        if($log->isLoggingOn())
        {
            $log->logToFile("Query To Post: " . print_r($parameters, true));
        }

        if($returnString == false)
        {
            return $parameters;
        }
        else
        {
            return implode("&", $paraArr);
        }
    }
}
?>
