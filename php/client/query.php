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
    require_once 'APSDB/Model/QueryRequest.php';
    require_once 'credentials.php';

    $service = new APSDBClientService($publicAccessKey, $privateAccessKey);

    $storeName = "myStore"; //TODO: replace by your store name
    $queryRequest = new QueryRequest($storeName);
    $queryRequest->addField("field1");
    $queryRequest->addField("newNumericField4");
    $queryRequest->setQueryCondition('field1="myField1"');
    $response = $service->query($queryRequest);

    echo "Status: " . $response->getStatus() . "<br />";
    echo "Message: " . $response->getMessage() . "<br />";
    $documentArray = $response->getDocuments();
    foreach ($documentArray as $doc)
    {
        echo "Document Key: " . $doc->getDocumentKey() . "<br />";
        $docFields = $doc->getDocumentFields();
        foreach ($docFields as $field)
        {
            $valuesArr = $field->getFieldValues();
            for($i =0; $i < count($valuesArr); $i++)
                echo "&nbsp;&nbsp;Field Name: " . $field->getFieldName() . "&nbsp;&nbsp;&nbsp;&nbsp;Field Value: " . $valuesArr[$i] . "<br />";
        }
    }
?>    