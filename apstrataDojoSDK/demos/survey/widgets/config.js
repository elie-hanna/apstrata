/*******************************************************************************
 *  Copyright 2009 Apstrata
 *  
 *  This file is part of Apstrata Database Javascript Client.
 *  
 *  Apstrata Database Javascript Client is free software: you can redistribute it
 *  and/or modify it under the terms of the GNU Lesser General Public License as
 *  published by the Free Software Foundation, either version 3 of the License,
 *  or (at your option) any later version.
 *  
 *  Apstrata Database Javascript Client is distributed in the hope that it will be
 *  useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *  
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with Apstrata Database Javascript Client.  If not, see <http://www.gnu.org/licenses/>.
 * *****************************************************************************
 */
dojo.provide("surveyWidget.widgets.config")
dojo.declare("surveyWidget.widgets.config", [], {})

// The following two global variables are used when constructing the survey embed codes.

// apServiceURL is used to communicate with our REST-ful services. 
var apServiceURL = "http://apsdb.apstrata.com/sandbox-apsdb/rest"  //"http://apsdb.apstrata.com/apsdb/rest" 

// apSourceURL points to where the survey code is hosted. 
var apSourceURL = "http://developer.apstrata.com/apstrataSDK/" 