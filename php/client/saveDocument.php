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
    require_once 'APSDB/Model/SaveDocumentRequest.php';
    require_once 'credentials.php';

    $service = new APSDBClientService($publicAccessKey, $privateAccessKey);
    $storeName = "myStore"; //TODO: replace by your store name

    $saveDocumentRequest = new SaveDocumentRequest($storeName, "documentKey");
    $saveDocumentRequest->addField("newNumericField4", "1200", "numeric", null, false, false, true);
    $saveDocumentRequest->addField("newNumericField4", "1100", "numeric", null, false, false, true);
    $saveDocumentRequest->addField("field1", "myField1", "string", null, true, true, true);
    $saveDocumentRequest->addFile("first_file", "C:/Sunset.jpg", true);

    $response = $service->saveDocument($saveDocumentRequest);

    echo "Document Key: " . $response->getDocumentKey() . "<br />";
    echo "Status: " . $response->getStatus() . "<br />";
    echo "Message: " . $response->getMessage() . "<br />";

?>