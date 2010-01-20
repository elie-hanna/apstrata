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
dojo.provide("apstrata.util.ImportJson");

dojo.require("apstrata.util.logger.Loggable");
dojo.require("apstrata.apsdb.client.Client")

dojo.declare("apstrata.util.ImportJson",
[apstrata.util.logger.Loggable],
{
	constructor: function(attrs) {
		var client
		
		if (attrs && attrs.connection) {
			client = new apstrata.apsdb.client.Client(attrs.connection)
		} else {
			client = new apstrata.apsdb.client.Client()
		}
		
		var store = attrs.store?attrs.store:client.connection.defaultStore
		
		if (attrs && attrs.data) {
			dojo.forEach(attrs.data, function(item) {
				var doc = {store: store, fields: item}
				if (attrs.documentKey) if (item[attrs.documentKey]) doc.fields["apsdb.documentKey"] = item[attrs.documentKey]
				client.queue("SaveDocument", doc)
			})
		}

		client.execute({iterationSuccess: attrs.onItemAdded})
	}
})
