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
dojo.provide("apstrata.util.BulkUpdate");

dojo.declare('apstrata.util.BulkUpdate', [], {
	
	data: null,
	
	operation: function(action, request, next) {
		var self = this
		
		console.dir([action, request, next])
		
		this.client.call({
			action: action,
			request: request,
			load: function(operation) {
				if (next) next()
			},
			error: function(operation) {
				if (next) next()
			}
		})
	},
	
	queue: function(action, requestQueue, nextOperation) {
		var self = this
		
		if (requestQueue.length>0) {
			var curRequest = requestQueue.pop()
			
			this.operation(action, curRequest, function() {
				self.queue(action, requestQueue, nextOperation)
			})
		} else {
			if (nextOperation) nextOperation()
		}
	},

	init: function() {
		var self = this
		
		var store = function() {
			if (self.data.stores) {
				self.queue("CreateStore", self.data.stores)
			} 
		}

		var user = function () {
			if (self.data.users) {
				self.queue("SaveUser", self.data.users, store)
			} else {
				store()
			}
		}

		var group = function () {
			if (self.data.groups) {
				self.queue("CreateGroup", self.data.groups, user)
			} else {
				user()
			}
		}
		
		group()
	},

	constructor: function(attrs) {
		this.data = attrs.data
		
		this.client = new apstrata.Client({
			connection: attrs.connection,
			handleResult: function(operation) {},
			handleError: function(operation) {}
		})
		
		this.init()
	}					
})
