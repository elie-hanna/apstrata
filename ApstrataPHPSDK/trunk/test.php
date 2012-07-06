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

     /**
     * sample code to create store
     */

    require_once 'APSDB/APSDBClient.php';
	require_once 'APSDB/Common/KeyValue.php';
    require_once 'credentials.php';
		
	$client = new APSDBClient($publicAccessKey, $privateAccessKey);
    $params = array();
    array_push($params, new KeyValue("apsdb.store", "newStore"));
   
    $response = $client->callApi("CreateStore", $params);

	echo "<pre>";
    print_r ($response);   
	echo "</pre>"; 

?>