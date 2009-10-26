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

dojo.provide("apstrata.admin.ContextualHelp")

dojo.declare("apstrata.admin.ContextualHelp", 
[dijit._Widget, dojox.dtl._Templated], 
{

	templatePath: dojo.moduleUrl("apstrata.admin", "templates/ContextualHelp.html"),
	widgetsInTemplate: true,
	topic: '',
	content: '',
	
	constructor: function() {
		this.topic = "Read about: apstrata API"
	},
	
	postCreate: function() {
		var self = this

		dojo.subscribe("/apstrata/documentation/topic", function(data) {
			self.topic = "Read about: " + data.topic
			
	        var xhrArgs = {
	            url: "documentation/" + data.id + ".html",
	            handleAs: "text",
	            load: function(data) {
					self.content = data
	    			self.render()
					self.animateOpen()
		        },
	            error: function(error) {
					self.content = "An unexpected error occurred: " + error;
					self.render()
	            }
	        }
	
	        //Call the asynchronous xhrGet
	        var deferred = dojo.xhrGet(xhrArgs);
		})
	},
	
	animateOpen: function() {
		var self = this
		
        dojo.animateProperty({
            node: self.dvTopic,
            duration: 3000,
            properties: {
                backgroundColor: {
                    start: "#00de00",
                    end: "#dedede"
                }
            }
        }).play();
	
//		dojo.animateProperty({
//			node: "dvTopic",
//			properties: {
//				background: { end: "blue", start:"red" }
//			}
//		}).play();

//		dojo.style(self.dvTopic, {
//			background: "red"
//		})
	}
})