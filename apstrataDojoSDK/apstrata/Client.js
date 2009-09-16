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
dojo.provide("apstrata.Client");

dojo.require("apstrata.Connection")
dojo.require("apstrata.Get")
//dojo.require("apstrata.apsdb.client.Post")

dojo.declare("apstrata.Client", 
	[apstrata.util.logger.Loggable], 
	{
		constructor: function(attrs) {
			if (attrs) {
				if (attrs.connection) {
					this.connection = attrs.connection
				}
			}
			
			if (!this.connection) {
				this.connection = new apstrata.Connection()
			}
		},
		
		call: function(attrs) {
			if (attrs.action != "SaveDocumentPost") {
				var operation = new apstrata.Get(this.connection)
			} else {
//				var operation = new apstrata.apsdb.client.Post(this.connection)
			}

			operation.apsdbOperation = attrs.action

			operation.request.apsdb = attrs.apsdb
			operation.request.apsim = attrs.apsim

			for (prop in attrs.fields) {
				this.request[prop] = attrs.fields[prop];
			}
			
			dojo.connect(operation, "handleResult", function() {
				attrs.load(operation)
			})

			dojo.connect(operation, "handleError", function() {
				attrs.error(operation)
			})

			operation.execute()				
		} 
	})