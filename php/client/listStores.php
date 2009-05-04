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

    require_once 'APSDB/APSDBClientService.php';
    require_once 'credentials.php';

    $service = new APSDBClientService($publicAccessKey, $privateAccessKey);
    $response = $service->listStores();
    echo "Status: " . $response->getStatus() . "<br />";
    echo "number of stores: ".$response->getNumberOfStores()."<br />";
    $storesArray = $response->getStores();
    for($i = 0; $i < $response->getNumberOfStores(); $i++)
    {
        $currentStore = $storesArray[$i];
        echo $currentStore->getStoreName() . "<br />";
    }
?>