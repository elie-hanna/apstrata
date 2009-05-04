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
 * instance of DeleteStoreRequest will be passed as
 * parameter to the deleteStore method in the client
 * service
 *
 */
class DeleteStoreRequest extends APSDBRequest
{
    private $storeName;

    /**
     * Constructor
     * @param String $storeName
     */
    function  __construct($storeName)
    {
        $this->action = Constants::DELETE_STORE;
        $this->storeName = $storeName;
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

    /**
     * Returns an array containing the parameters
     * to form query string
     *
     * @return array
     */
    public function getParameters()
    {
        $params = array();
        $params['apsdb.store'] = $this->getStoreName();
        return $params;
    }
}
?>
