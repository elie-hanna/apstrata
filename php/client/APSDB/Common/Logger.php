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


require_once 'APSDB/APSDBConfig.php';

/**
 *
 */
class Logger
{
    private $isLoggingOn;
    private $logFilePath;
    private static $instance;

    private function  __construct()
    {
        $this->isLoggingOn = APSDBConfig::$LOGGING_IS_ON;
        $this->logFilePath = APSDBConfig::$LOG_FILE_PATH;
    }

    public static function getInstance()
    {
        if(Logger::$instance == null)
        {
            Logger::$instance = new Logger();
        }
        return Logger::$instance;
    }

    public function logToFile($loggingMsg)
    {
        if($this->isLoggingOn)
        {
            $str = "[" . date("Y/m/d h:i:s", mktime()) . "] " . $loggingMsg;
            
            $fd = fopen($this->logFilePath, "a");
            
            fwrite($fd, $str . "\r\n");
            
            fclose($fd);
        }
    }

    public function isLoggingOn()
    {
        return $this->isLoggingOn;
    }
}
?>