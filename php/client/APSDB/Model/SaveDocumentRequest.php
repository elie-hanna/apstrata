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
class SaveDocumentRequest extends APSDBRequest
{
    private $storeName;
    private $documentKey;
    private $fields;
    
    /**
     * Constructor
     */
    function  __construct($storeName, $documentKey = null)
    {
        $this->fields = array();
        $this->storeName = $storeName;
        if($documentKey != null)
        {
            $this->documentKey = $documentKey;
        }
        else
        {
            $this->documentKey = null;
        }
        $this->action = Constants::SAVE_DOCUMENT;
    }

    /**
     * Returns an array for parameters. These parameters
     * will be used to construct the query string
     *
     * @return array params
     */
    public function getParameters()
    {
        $params = array();
        if($this->documentKey != null)
        {
            $params['apsdb.documentKey'] = $this->documentKey;
        }
        $params['apsdb.store'] = $this->storeName;
        $numFields = count($this->fields);
        $appendFieldsArray = array();
        $sendSeperator = false;
        $fullTextSearchableFieldsArr = array();
        for($i = 0; $i < $numFields; $i++)
        {
            $currentField = $this->fields[$i];
            $fieldNameParam = $currentField['fieldName'];
            $fieldTypeParam = $fieldNameParam.'.apsdb.fieldType';
            $fieldDateFormatParam = $fieldNameParam.'.apsdb.fieldDateFormat';
            $params[$fieldNameParam] = $currentField['fieldValue'];
            if($currentField['fieldType'] != '')
            {
                //case of a file this will not exist
                $params[$fieldTypeParam] = $currentField['fieldType'];
            }
            if($currentField['fieldDateFormat'] != '')
            {
                $params[$fieldDateFormatParam] = $currentField['fieldDateFormat'];
            }
            if($currentField['appendField'] == true)
            {
                array_push($appendFieldsArray, $currentField['fieldName']);
            }

            if($currentField['containsMultipleValues'] == true)
            {
                $sendSeperator = true;
            }

            if($currentField['isFullTextSearchable'])
            {
                array_push($fullTextSearchableFieldsArr, $fieldNameParam);
            }
        }

        if($sendSeperator == true)
        {
            $params['apsdb.mvfSeparator'] = Constants::APPEND_VALUE_SEPERATOR;
        }

        if(count($appendFieldsArray) > 0)
        {
            $params['apsdb.multivalue_append'] = implode(",", $appendFieldsArray);
        }

        if(count($fullTextSearchableFieldsArr) > 0)
        {
            $params['apsdb.ftsFields'] = implode(",", $fullTextSearchableFieldsArr);
        }
        return $params;
    }

    /**
     * Adds a field to the document. If appendToExistingField is true, the field will have an extra
     * value, else it will be overriden
     *
     * @param string $fieldName
     * @param string $fieldValue
     * @param string $fieldType
     * @param string $fieldDateFormat
     * @param boolean $replaceExistingFieldInRequest
     * @param boolean $appendToExistingFieldOnServer
     */
    public function addField($fieldName, $fieldValue, $fieldType, $fieldDateFormat, $replaceExistingFieldInRequest, $appendToExistingFieldOnServer, $isFullTextSearchable)
    {
        $existingFieldWithSameNameIndex = $this->getFieldIndex($fieldName);
        
        if($existingFieldWithSameNameIndex == -1)
        {
            $item = array
            (
                'fieldName' => $fieldName,
                'fieldValue' => $fieldValue,
                'fieldType' => $fieldType,
                'fieldDateFormat' => $fieldDateFormat,
                'appendField' => $appendToExistingFieldOnServer,
                'containsMultipleValues' => false,
                'isFullTextSearchable' => $isFullTextSearchable
            );            
            array_push($this->fields, $item);
        }
        else
        {
            if($replaceExistingFieldInRequest == false)
            {
                //Logger::logToFile("Appending value to field");
                $this->fields[$existingFieldWithSameNameIndex]['fieldValue'] .= Constants::APPEND_VALUE_SEPERATOR . $fieldValue;
                $this->fields[$existingFieldWithSameNameIndex]['containsMultipleValues'] = true;
                //Logger::logToFile("Appending value to field ".$this->fields[$existingFieldWithSameNameIndex]['fieldValue']);
            }
            else
            {
                $this->fields[$existingFieldWithSameNameIndex]['fieldValue'] = $fieldValue;
                $this->fields[$existingFieldWithSameNameIndex]['fieldType'] = $fieldType;
                $this->fields[$existingFieldWithSameNameIndex]['fieldDateFormat'] = $fieldDateFormat;
                $this->fields[$existingFieldWithSameNameIndex]['isFullTextSearchable'] = $isFullTextSearchable;
            }
            $this->fields[$existingFieldWithSameNameIndex]['appendField'] = $appendToExistingFieldOnServer;
        }
    }

    /**
     * Will upload a file when saving the document
     * Throws an exception if file does not exist
     *
     * @param string $fieldName
     * @param string $filePath
     */
    public function addFile($fieldName, $filePath, $isFullTextSearchable)
    {
        if(file_exists($filePath))
        {
            $item = array
            (
                'fieldName' => $fieldName,
                'fieldValue' => Constants::FILE_INDICATOR.$filePath,
                'fieldType' => '',
                'fieldDateFormat' => '',
                'appendField' => '',
                'containsMultipleValues' => false,
                'isFullTextSearchable' => $isFullTextSearchable
            );
            array_push($this->fields, $item);
        }
        else
        {
            throw new Exception("File does not exist");
        }
    }

    private function getFieldIndex($fieldName)
    {
        $numberOfFields = count($this->fields);
        $log = Logger::getInstance();
        if($log->isLoggingOn())
        {
            $log->logToFile("getFieldIndex ".$numberOfFields);
        }
        for($i = 0; $i < $numberOfFields; $i++)
        {
            $currentItem = $this->fields[$i];
            if(isset ($currentItem) && $currentItem['fieldName'] == $fieldName)
            {
                return $i;
            }
        }
        return -1;
    }

    
}
?>
