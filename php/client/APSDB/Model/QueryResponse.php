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


require_once 'APSDBResponse.php';
require_once 'Document.php';

/**
 * instance of QueryResponse will be returned
 * by the query method in the client
 * service
 *
 */
class QueryResponse extends APSDBResponse
{

    private $count;
    private $documents;

    /**
     * Constructor
     * @param String $xmlResponseBody
     */
    public function  __construct($xmlResponseBody)
    {
        //bug in php not handling xml with xmlns
        $count = 1;
        $xmlResponseBody = str_replace("xmlns", "xmlns:ns", $xmlResponseBody, $count);
        $dom = new DOMDocument();
        $dom->loadXML($xmlResponseBody);
        $xpath = new DOMXPath($dom);

        $log = Logger::getInstance();

        parent::setParentFields($xpath, $xmlResponseBody);

        $countNodeList = $xpath->query('//count');
        if($countNodeList->length > 0)
        {
            $this->count = $countNodeList->item(0)->nodeValue;
        }

        $this->documents = array();

        $documentNodeList = $xpath->query("//document");
        foreach ($documentNodeList as $documentNode)
        {
            $documentFields = $documentNode->childNodes;
            $documentKey = $documentNode->attributes->getNamedItem("key")->nodeValue;

            $currentDocument = new Document($documentKey);

            if($log->isLoggingOn())
            {
                $log->logToFile(" Document Key -----> ". $documentKey);
                $log->logToFile(" Number of Fields -----> ". $documentFields->length);
            }
            foreach ($documentFields as $fieldNode)
            {
                $fieldName = $fieldNode->attributes->getNamedItem("name")->nodeValue;
                $fieldValueNodeList = $fieldNode->childNodes;
                $numValues = $fieldValueNodeList->length;

                for($i = 0; $i < $numValues; $i++)
                {
                    $fieldValue = $fieldValueNodeList->item($i)->nodeValue;
                    $currentDocument->addDocumentField($fieldName, $fieldValue);
                    if($log->isLoggingOn())
                    {
                        $log->logToFile(" Field Name -----> ". $fieldName);
                        $log->logToFile(" Field Value -----> ". $fieldValue);
                    }
                }                
            }

            //adding the document to the response document array
            array_push($this->documents, $currentDocument);
        }
    }

    /**
     * The array will contain objects of type
     * Document
     *
     * @return array documents
     */
    public function getDocuments()
    {
        return $this->documents;
    }

    public function getCount()
    {
        return $this->count;
    }

}
?>