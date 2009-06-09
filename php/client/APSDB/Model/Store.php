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
class Store
{
    private $storeName;
    private $usage;
    private $creationDate;

    public function  __construct($storeName, $usage, $creationDate)
    {
        $this->creationDate = $creationDate;
        $this->storeName = $storeName;
        $this->usage = $usage;
    }

    public function getStoreName()
    {
        return $this->storeName;
    }

    public function getUsage()
    {
        return $this->usage;
    }

    public function getCreationDate()
    {
        return $this->creationDate;
    }
}
?>