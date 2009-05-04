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


require_once 'DocumentField.php';
/**
 * 
 */
class Document
{
    private $key;
    private $fields;

    public function  __construct($key)
    {
        $this->key = $key;
        $this->fields = array();
    }

    /**
     * Returns document key
     *
     * @return string
     */
    public function getDocumentKey()
    {
        return $this->key;
    }

    /**
     * Returns an array containing the document fields
     * that are selected by the query. Each item in the array
     * is an instance of DocumentField
     *
     * @return array fields
     */
    public function getDocumentFields()
    {
        return $this->fields;
    }

    public function addDocumentField($fieldName, $fieldValue)
    {
        $fieldWithSameName = false;
        $existingField = null;
        for($i = 0; $i < count($this->fields); $i++)
        {
            if($this->fields[$i]->getFieldName() == $fieldName)
            {
                $existingField = $this->fields[$i];
                break;
            }
        }
        if($existingField != null)
        {
            $existingField->addValue($fieldValue);
        }
        else
        {
            $existingField = new DocumentField($fieldName, $fieldValue);
            array_push($this->fields, $existingField);
        }
    }
}
?>
