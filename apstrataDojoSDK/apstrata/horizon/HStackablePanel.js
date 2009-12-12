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

dojo.provide("apstrata.horizon.HStackablePanel")
dojo.provide("apstrata.horizon.HStackableMainPanel")

dojo.declare("apstrata.horizon.HStackableMainPanel", 
[apstrata.horizon.HStackableList], 
{
	constructor: function() {
		this._connection = null
	},
	
	setConnection: function(myConnection) {
		this._connection = myConnection
	},
	
	postCreate: function() {
		var mainPanel = this

		dojo.subscribe("/apstrata/connection/login/success", function(data) {
			mainPanel.data.push({label: "logout", iconSrc: "../../apstrata/resources/images/pencil-icons/left.png"})
			mainPanel.render()
		})
		
		dojo.subscribe("/apstrata/connection/logout", function(data) {
			mainPanel.data.pop()
			mainPanel.render()
			mainPanel.home()
		})
		
		this.inherited(arguments)
	},
	
	startup: function() {
		if (this._connection.hasCredentials()) {
			this.data.push({label: "logout", iconSrc: "../../apstrata/resources/images/pencil-icons/left.png"})
			this.render()
		} 
	}
})
