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
			if (data.response) {
				if (data.success == 'success') {
					style = {position: 'relative', left: '30px', width: '950px', background: '#99ff66', color: '#222222', fontFamily: 'monospace', padding: '10px', marginBottom: '10px'}
				} else {
					style = {position: 'relative', left: '30px', width: '950px', background: '#ff9966', color: '#222222', fontFamily: 'monospace', padding: '10px', marginBottom: '10px'}
				}
			} else {
				style = {width: '950px', background: '#a1a1a1', color: '#222222', fontFamily: 'monospace', padding: '10px', marginBottom: '1px'}
			}
			
			var n = dojo.create(
				"div", 
				{innerHTML: data.message, style: style}, 
				self.output
			)

			dojo.addClass(n, 'rounded-sml')
			self.output.scrollTop = self.output.scrollHeight - self.output.clientHeight

		})
	},
	
	startup: function() {
	},
	
	render: function() {
		
	}
})