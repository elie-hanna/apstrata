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
 * 
 */
class DocumentField
{
    private $fieldName;
    private $fieldValues;

    public function  __construct($fieldName, $fieldValue)
    {
        $this->fieldName = $fieldName;
        $this->fieldValues = array();
        array_push($this->fieldValues, $fieldValue);
    }

    public function addValue($fieldValue)
    {
        array_push($this->fieldValues, $fieldValue);
    }

    /**
     * Returns field name
     *
     * @return string
     */
    public function getFieldName()
    {
        return $this->fieldName;
    }

    /**
     * Returns field value
     *
     * @return string fieldValue
     */
    public function getFieldValues()
    {
        return $this->fieldValues;
    }
}
?>
