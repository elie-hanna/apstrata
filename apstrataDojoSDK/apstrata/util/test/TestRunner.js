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

dojo.provide('apstrata.util.test.TestRunner');

dojo.declare("apstrata.util.test.TestRunner", 
		[], 
		{
			constructor: function(attrs) {
				if (attrs.id) this._id = attrs.id; else this._id = "unitTest"
				
				if (dojo.byId(this._id)==null) {
					// create div if not there
				} 
				
				this._testScope = attrs.scope
			},
			
			print: function (msg) {
				dojo.byId(this._id).innerHTML = dojo.byId(this._id).innerHTML + "<div class='operation'>" + msg + "</div>" 				
			},
			
	    	printOperationDecorated: function (operation, result) {
				this.printDecorated(operation.apsdbOperation, result?"success":"failure", operation.responseTime)
			},
			
	    	printDecorated: function (label, status, time) {
				var msg = "<span class='cell label'>" + label + " </span>"
					msg += "<span class='cell " + status + "' id='"+label+"'>" + status + "</span><span>" + time + " ms</span>"
				
				this.print(msg)
			},

			success: function (operation) {
				this.printOperationDecorated(operation, true)
				this.resetTime()
			},
			
			fail: function (operation) {
				this.printOperationDecorated(operation, false)
				this.resetTime()
			},
			
			resetTime: function () {
				this.time = new Date().getTime();
			},
			
			assert: function(label, condition, time) {
				if (time == undefined) {
					time = (new Date().getTime()) - this.time
				} 
				
				this.printDecorated(label, condition?"success":"failure", time)

				this.resetTime()
				return condition
			},
					
			run: function(test) {
				test.run(this)
			}
		})
