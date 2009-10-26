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

dojo.provide("apstrata.admin.RESTMonitor")

dojo.declare("apstrata.admin.RESTMonitor", 
[dijit._Widget, dojox.dtl._Templated], 
{

	templatePath: dojo.moduleUrl("apstrata.admin", "templates/RESTMonitor.html"),
	widgetsInTemplate: true,
	
	postCreate: function() {
		var self = this

		dojo.subscribe("/apstrata/operation", function(data) {
			var style
			var c = self.dvMonitorOutput
			var target

			if (data.response) {
				// The 'target' has been created already, find it
				target = dojo.byId("REST-"+data.id)

				// Depending of the status color the message
				if (data.success == 'success') { //99ff66
					style = {position: 'relative', left: '30px', top:'-5px', opacity: '.87', width: '950px', background: '#99ff66', color: '#222222', fontFamily: 'monospace', padding: '10px'}
				} else {
					style = {position: 'relative', left: '30px', top:'-5px', opacity: '.85', width: '950px', background: '#ff9966', color: '#222222', fontFamily: 'monospace', padding: '10px'}
				}
			} else {
				// Create a target DIV that will contain both request and response
				
				target = dojo.create(
					"div", 
					{innerHTML: "", id: "REST-"+data.id}, 
					self.dvMonitorOutput
				)

				dojo.style(target, {
					height: (target.coffsetHeight - 20) + "px"
				})
				
				style = {width: '950px', background: '#a1a1a1', color: '#222222', fontFamily: 'monospace', padding: '10px', marginBottom: '1px'}
			}
			
			// Insert the request or response into the 'target' DIV
			var n = dojo.create(
				"div", 
				{innerHTML: data.message, style: style}, 
				target
			)

			// Make the message boxes round
			dojo.addClass(n, 'rounded-sml')

			if (false && data.response)	{
				// Insert <img for arrow into the 'target' DIV
				var a = dojo.create(
					"img", 
						{src: "images/rest-monitor-arrow.png", style: "position: relative; left: 8px; top: -"+ (n.offsetHeight+1) +"px;"}, 
					target
				)
			}	
//							{src: "images/rest-monitor-arrow.png", style: "position: absolute; left: 8px; top: "+ (n.offsetTop) +"px; left: "+ (n.offsetLeft-22) +"px;"}, 
			
			// Autoscroll REST monitor to the bottom
			self.dvMonitorOutput.scrollTop = self.dvMonitorOutput.scrollHeight - self.dvMonitorOutput.clientHeight
		})
	}
})