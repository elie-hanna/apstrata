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
dojo.require("apstrata.Post")

dojo.declare("apstrata.Client", 
	[apstrata.util.logger.Loggable], 
	{
		
		_MESSAGE_DURATION: 1000,
		
		constructor: function(attrs) {
			if (attrs) {
				if (attrs.connection) {
					this.connection = attrs.connection
				}
			}
			
			if (!this.connection) {
				this.connection = new apstrata.Connection()
			}
			
			if (attrs.handleResult) this.handleResult = attrs.handleResult
			if (attrs.handleError) this.handleError = attrs.handleError
		},
		
		call: function(attrs) {
			var self = this
			
			dojo.publish("/apstrata/connection", [{
					action: 'start',
					message: "Calling apstrata API: <b>" + attrs.action + "</b>", 
					type: "message", 
					duration: self._MESSAGE_DURATION
			}])
			
			if (attrs.action != "SaveDocument") {
				var operation = new apstrata.Get(this.connection)
			} else {
				var operation = new apstrata.Post(this.connection)
			}

			operation.apsdbOperation = attrs.action

			operation.request = {}

			operation.request.apsdb = attrs.apsdb
			operation.request.apsim = attrs.apsim

			for (prop in attrs.fields) {
				operation.request[prop] = attrs.fields[prop];
			}
			
			dojo.connect(operation, "handleResult", function() {
				if (self.handleResult) self.handleResult(operation)
				attrs.load(operation)

				dojo.publish("/apstrata/connection", [{
					action: 'end',
					success: true,
					message: "Call to apstrata API: <b>" + attrs.action + "</b> successful", 					
					type: "message", 
					duration: self._MESSAGE_DURATION
				}]);
			})

			dojo.connect(operation, "handleError", function() {
				if (self.handleError) self.handleError(operation)
				attrs.error(operation)

				dojo.publish("/apstrata/connection", [{
					action: 'end',
					success: false,
					message: "Call to apstrata API: <b>" + attrs.action + "</b> failed", 					
					type: "warning", 
					duration: self._MESSAGE_DURATION
				}]);
			})

			operation.execute(attrs)				
		} 
	})