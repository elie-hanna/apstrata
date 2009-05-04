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
 * instance of CreateStoreRequest will be passed as
 * parameter to the create store method in the client
 * service
 *
 */
class CreateStoreRequest extends APSDBRequest
{
    private $storeName;

    /**
     * Constructor
     * @param string $storeName
     */
    function  __construct($storeName)
    {
        $this->action = Constants::CREATE_STORE;
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
     *
     * @return array params
     */
    public function getParameters()
    {
        $params = array();
        $params['apsdb.store'] = $this->getStoreName();
        return $params;
    }
}
?>
