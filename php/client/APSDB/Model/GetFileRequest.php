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


require_once 'APSDBRequest.php';

/**
 * instance of GetFileRequest will be passed as
 * parameter to the getFile method in the client
 * service
 *
 */
class GetFileRequest extends APSDBRequest
{
    private $storeName;
    private $documentKey;
    private $fieldName;

    /**
     * Constructor
     * @param String $storeName
     */
    function  __construct($storeName, $documentKey, $fieldName)
    {
        $this->action = Constants::GET_FILE;
        $this->storeName = $storeName;
        $this->documentKey = $documentKey;
        $this->fieldName = $fieldName;
    }

    public function setStoreName($storeName)
    {
        $this->storeName = $storeName;
    }

    /**
     *
     * @return string storeName
     */
    public function getStoreName()
    {
        return $this->storeName;
    }

    public function getParameters()
    {
        $params = array();
        $params['apsdb.store'] = $this->storeName;
        $params['apsdb.documentKey'] = $this->documentKey;
        $params['apsdb.fieldName'] = $this->fieldName;
        return $params;
    }
}
?>
