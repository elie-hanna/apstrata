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

dojo.provide("apstrata.dojo.client.apsdb.Core");

// Include the core classes here for convenience
// to avoid including them explicitly for every page
// that needs to communicate with Apstrata
dojo.require ("apstrata.dojo.client.util.Logger");
dojo.require ("apstrata.dojo.client.apsdb.Connection");

// Place here only safe functions and variables
// that could be used concurrently by multiple instances

APSTRATA_CORE = {
    logConfig: {
	buffer:  new Array(),	// global array to contain the log
	level: 0, 		// severity of log messages to display
	verbose: true, 		// show log messages on console
	logGarbageCollection: 10 	// minutes to clear the log messages buffer		
    },
    
    log: function(origin, attr1, attr2, attr3) {
	if (this.logger == undefined) this.logger = new apstrata.dojo.client.util.Logger()
	
	if (attr1 == undefined) {
		this.logger._LOGGER.className = ""
		this.logger.log(origin)			
	} else {
		this.logger._LOGGER.className = origin
		this.logger.log(attr1, attr2, attr3)			
	}

    }
}


