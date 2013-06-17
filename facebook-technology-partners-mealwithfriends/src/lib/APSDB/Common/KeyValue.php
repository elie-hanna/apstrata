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
 * KeyValue
 */
class KeyValue {

    private $key;
    private $value;
    private $isFile;

    public function __construct($key, $value, $isFile = false)
    {
        $this->key = $key;
        $this->value = $value;
        $this->isFile = $isFile;
    }

    public function isFile()
    {
        return $this->isFile;
    }

    public function setIsFile($isFile)
    {
        $this->isFile = $isFile;
    }

    public function setKey($key)
    {
        $this->key = $key;
    }

    public function getKey()
    {
        return $this->key;
    }

    public function getValue()
    {
        return $this->value;
    }

    public function setValue($value)
    {
        $this->value = $value;
    }
}
?>
