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


require_once 'APSDB/Common/Constants.php';
require_once 'APSDB/Common/Logger.php';

/**
 * APSDBResponse is an abstract class.
 * All kind of response from APSDB will extend it.
 *
 */
abstract class APSDBResponse
{
    protected $status;
    protected $message;
    protected $errorCode;

    protected function setParentFields($xpath, $xmlResponse)
    {
        Logger::getInstance()->logToFile("Setting parent fields ");
        Logger::getInstance()->logToFile($xmlResponse);
        Logger::getInstance()->logToFile($xpath->query('//response/status')->length);
        $this->status = $xpath->query('//response/status')->item(0)->nodeValue;

        $messageItem = $xpath->query('//response/message');        
        if($messageItem->length > 0)
        {
            $this->message = $messageItem->item(0)->nodeValue;
        }
        
        $errorCodeItem = $xpath->query('//response/errorCode');
        if($this->status != Constants::SUCCESSFUL_RESPONSE && $errorCodeItem->length > 0)
        {
            $this->errorCode = $errorCodeItem->item(0)->nodeValue;
        }
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function getMessage()
    {
        return $this->message;
    }

    public function getErrorCode()
    {
        return $this->errorCode;
    }
}
?>
