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
require_once 'Store.php';

/**
 * instance of ListStoresResponse will be returned
 * by the listStores method in the client
 * service
 *
 */
class ListStoresResponse extends APSDBResponse
{
    private $stores;
    private $numberOfStores;
    
    /**
     * Constructor
     * @param String $xmlResponseBody
     */
    public function  __construct($xmlResponseBody)
    {
        //bug in php not handling xml with xmlns
        $count = 1;
        $xmlResponseBody = str_replace("xmlns", "xmlns:ns", $xmlResponseBody, $count);
        $log = Logger::getInstance();
        $log->logToFile("List Stores Body: ".$xmlResponseBody);
        $dom = new DOMDocument();
        $dom->loadXML($xmlResponseBody);
        $xpath = new DOMXPath($dom);
        parent::setParentFields($xpath, $xmlResponseBody);
        if($this->status == Constants::SUCCESSFUL_RESPONSE)
        {
            //fill stores
            $resultItem = $xpath->query('//store');
            $numberOfStores = $resultItem->length;
            $this->numberOfStores = $numberOfStores;
            $log->logToFile("Number of stores: ".$numberOfStores);
            $this->stores = array();
            for($i = 1; $i <= $numberOfStores; $i++)
            {
                $currentStoreName = $xpath->query('//store['.$i.']')->item(0)->attributes->getNamedItem("name")->nodeValue;
                
                /** status are not currently supported in the current api **/
                $currentUsageItem = $xpath->query('//store['.$i.']/usage');
                $currentUsage = '';
                /*if($currentUsageItem->length > 0)
                {
                    $currentUsage = $currentUsageItem->item(0)->nodeValue;
                }*/

                $currentCreationDateItem = $xpath->query('//store['.$i.']/creationDate');
                $currentCreationDate = '';
                /*if($currentCreationDateItem->length > 0)
                {
                    $currentCreationDate = $currentCreationDateItem->item(0)->nodeValue;
                }*/
                $log->logToFile("Node Value: ".$currentStoreName. " -- ".$currentUsage." -- ".$currentCreationDate);
                $currentStore = new Store($currentStoreName, $currentUsage, $currentCreationDate);
                array_push($this->stores, $currentStore);
            }
        }
    }

    /**
     * Returns an array of Store instances
     *
     * @return array stores
     */
    public function getStores()
    {
        return $this->stores;
    }

    /**
     * Returns the number of stores a user has
     *
     * @return int
     */
    public function getNumberOfStores()
    {
        return $this->numberOfStores;
    }
}
?>
