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
class Constants
{
    const SUCCESSFUL_RESPONSE = "success";

    /**
     * append value seperator will be used to append
     * values to the same field
     */
    const APPEND_VALUE_SEPERATOR = "__APD_SEP_";
    const GENERAL_ERROR_MSG = "An Error Has Occured";
    /**
     * used to incdicate that this is field
     * of type file
     */
    const FILE_INDICATOR = "@APSFILE@";

    /**
     * Different actions to be sent to the
     * api
     */
    const CREATE_STORE = "CreateStore";
    const DELETE_STORE = "DeleteStore";
    const LIST_STORES = "ListStores";
    const SAVE_DOCUMENT = "SaveDocument";
    const DELETE_DOCUMENT = "DeleteDocument";
    const GET_FILE = "GetFile";
    const QUERY = "Query";
}
?>
