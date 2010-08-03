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
	null, 
	{
		
		_MESSAGE_DURATION: 1000,
		
		constructor: function(attrs) {
			var self = this

			if (attrs) {
				if (attrs.connection) {
					this.connection = attrs.connection
				}
				if (attrs.handleResult) {
					this.handleResult = attrs.handleResult
				}
				if (attrs.handleError) {
					this.handleError = attrs.handleError
				}
			}
			
			if (!this.connection) {
				this.connection = new apstrata.Connection()
			}
		},
		
		call: function(attrs) {
			var self = this
			
			dojo.publish("/apstrata/connection", [{
					action: 'start',
					message: "Calling apstrata API: <b>" + attrs.action + "</b>", 
					type: "message", 
					duration: self._MESSAGE_DURATION
			}])
			
			if (attrs.useHttpMethod) {
				if (attrs.useHttpMethod=="POST") {
					var operation = new apstrata.Post(this.connection)
				} else {
					var operation = new apstrata.Get(this.connection)
				} 
			} else {
				if ((attrs.action == "SaveDocument") || (attrs.action == "SaveSchema") || (attrs.action == "SaveScript")) {
					var operation = new apstrata.Post(this.connection)
				} else {
					var operation = new apstrata.Get(this.connection)
				}
			}

			operation.apsdbOperation = attrs.action

			operation.request = attrs.request

			var handle1 = dojo.connect(operation, "handleResult", function() {
				if (self.handleResult) self.handleResult(operation)
				attrs.load(operation)
				
				dojo.disconnect(handle1)
				dojo.disconnect(handle2)

				dojo.publish("/apstrata/connection", [{
					action: 'end',
					success: true,
					message: "Call to apstrata API: <b>" + attrs.action + "</b> successful", 					
					type: "message", 
					duration: self._MESSAGE_DURATION
				}]);
			})

			var handle2 = dojo.connect(operation, "handleError", function() {
				if (self.handleError) self.handleError(operation)
				attrs.error(operation)

				dojo.disconnect(handle1)
				dojo.disconnect(handle2)

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