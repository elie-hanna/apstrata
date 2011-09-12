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

dojo.provide('apstrata.GetFile');

dojo.require('apstrata.Operation');

dojo.declare("apstrata.GetFile",
[apstrata.Operation],
{
    /**
     * @constructor ListStores Does not require any parameters
    */
    constructor: function(connection) {
		this.apsdbOperation = "GetFile"
    },
	
	getUrl: function(attrs) {
        if (attrs) {
			this.request = {}
			this.request.apsdb = {}
			this.request.apsdb.store = attrs.store	
			this.request.apsdb.documentKey = attrs.documentKey
			this.request.apsdb.fieldName = attrs.fieldName
			this.request.apsdb.fileName = attrs.fileName
			this.request.apsdb.setContentDisposition = attrs.setContentDisposition
	
			return this.buildUrl()
		} else {
			throw new Error("apstrata.GetFile: attributes not provided.")
		}
	}
});
