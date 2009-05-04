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
 * instance of Query will be passed as
 * parameter to the create store method in the client
 * service
 *
 */
class QueryRequest extends APSDBRequest
{
    private $storeName;
    private $query;
    private $fields;
    private $sort;
    private $resultsPerPage = 10;
    private $pageNumber = 1;
    private $searchString;
    private $forceCurrentSnapShot;
    private $showCount;

    const STRING_TYPE = "string";
    const DATE_TYPE = "date";
    const NUMBER_TYPE = "numeric";

    /**
     *
     * @param string $storeName
     */
    function  __construct($storeName, $forceCurrentSnapShot = false)
    {
        $this->storeName = $storeName;
        $this->action = Constants::QUERY;
        $this->fields = array();
        $this->sort = array();
        $this->forceCurrentSnapShot = $forceCurrentSnapShot;
        $this->showCount = false;
    }

    public function getStoreName()
    {
        return $this->storeName;
    }

    public function setStoreName($storeName)
    {
        $this->storeName = $storeName;
    }

    /**
     * Add query condition
     * Examples of query conditions:
     * - name[string] = “James”
     * - name[string] = lastName[string]
     * - (name = "James" AND birthday[date:dd-NM-yyyy] = "30-05-1982") OR (name = "John" AND age[numeric] = 26)
     * 
     * @param string $query
     */
    public function setQueryCondition($query)
    {
        $this->query = $query;
    }

    public function getQueryCondition()
    {
        return $this->query;
    }

    /**
     * Adds field to select
     *
     * @param string $fieldName
     */
    public function addField($fieldName)
    {
        array_push($this->fields, $fieldName);
    }

    /**
     * reutrns an array of the fields we want
     * to select
     *
     * @return array fields
     */
    public function getFields()
    {
        return $this->fields;
    }

    /**
     * This method will add sorting to the expected output
     * Field type can be numeric/string/date/email
     *
     * @param string $fieldName
     * @param string $fieldType
     */
    public function addASCSortField($fieldName, $fieldType)
    {
        if($fieldType != null)
        {
            array_push($this->sort, $fieldName."[".$fieldType."]:ASC");
        }
        else
        {
            array_push($this->sort, $fieldName.":ASC");
        }
    }

    public function addDESCSortField($fieldName, $fieldType)
    {
        if($fieldType != null)
        {
            array_push($this->sort, $fieldName."[".$fieldType."]:DESC");
        }
        else
        {
            array_push($this->sort, $fieldName.":DESC");
        }
    }

    /**
     * will return the array containing the sorting expressions
     *
     * @return array sort
     */
    public function getSort()
    {
        return $this->sort;
    }

    /**
     * Results are divided into pages depending on the resultsPerPage param.
     * The pageNumber parameter specifies the page needed in case more than
     * one exist
     *
     * @param int $pageNumber
     */
    public function setPageNumber($pageNumber)
    {
        $this->pageNumber = $pageNumber;
    }

    public function getPageNumber()
    {
        return $this->pageNumber;
    }

    /**
     * Specifies the maximum number of documents
     * to be fetched per result
     *
     * @param int $resPerPage
     */
    public function setResultsPerPage($resPerPage)
    {
        $this->resultsPerPage = $resPerPage;
    }

    public function getResultsPerPage()
    {
        return $this->resultsPerPage;
    }

    public function setSearchString($searchString)
    {
        $this->searchString = $searchString;
    }

    public function getSearchString()
    {
        return $this->searchString;
    }

    public function getParameters()
    {
        $params = array();
        $params['apsdb.store'] = $this->getStoreName();
        if(count($this->getSort()) > 0)
        {
            $params['apsdb.sort'] = implode(',', $this->getSort());
        }
        $params['apsdb.query'] = $this->getQueryCondition();
        $params['apsdb.queryFields'] = implode(',', $this->getFields());
        $params['apsdb.resultsPerPage'] = $this->getResultsPerPage();
        $params['apsdb.pageNumber'] = $this->getPageNumber();
        if($this->getSearchString() != '')
        {
            $params['apsdb.ftsString'] = $this->getSearchString();
        }

        $params['apsdb.forceCurrentSnapShot'] = $this->forceCurrentSnapShot;

        $params['apsdb.count'] = $this->showCount;

        return $params;
    }

    public function setShowCount($showCount)
    {
        $this->showCount = $showCount;
    }

    public function isShowCount()
    {
        $this->showCount;
    }
}
?>
