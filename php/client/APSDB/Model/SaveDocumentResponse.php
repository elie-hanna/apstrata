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

/**
 * instance of SaveDocumentResponse will be passed as
 * parameter to the saveDocument method in the client
 * service
 *
 */
class SaveDocumentResponse extends APSDBResponse
{

    private $documentKey;
    
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
        parent::setParentFields($xpath, $xmlResponseBody);
        if($this->status == "success")
        {
            $documentItem = $xpath->query('//document');
            $this->documentKey = $documentItem->item(0)->attributes->getNamedItem("key")->nodeValue;
        }
    }

    /**
     * Returns the document key
     *
     * @return string documentKey
     */
    public function getDocumentKey()
    {
        return $this->documentKey;
    }
}
?>
