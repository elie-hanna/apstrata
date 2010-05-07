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
	logoutIcon: "../../apstrata/resources/images/pencil-icons/logout.png",
	
	constructor: function() {
		this._connection = null
	},
	
	setConnection: function(myConnection) {
		this._connection = myConnection
	},
	
	postCreate: function() {
		var mainPanel = this

		dojo.subscribe("/apstrata/connection/login/success", function(data) {
			mainPanel.data.push({label: "logout", iconSrc: mainPanel.logoutIcon})
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
			this.data.push({label: "logout", iconSrc: this.logoutIcon})
			this.render()
		} 

		this.home()
		this.inherited(arguments)
	},

	// Assumes the following data structure of the main list  
	//
	//	data: [
	//		{label: "LABEL", iconSrc: "PATH TO ICON", clazz: CLASS.OF.PANEL, auth: REQUIRES-AUTHENTICATION},
	//	],
	//
	// ex:
	//	data: [
	//		{label: "introduction", iconSrc: "../../apstrata/resources/images/pencil-icons/home.png", clazz: apstrata.mForms.HomePanel, auth: false},
	//	],

	onClick: function(index, label) {
		var self = this
		
		if (label == 'logout') {
			this.getContainer().connection.logout();
		} else if (this.data[index].auth) {
			if (connection.hasCredentials()) {
				this.openPanel(this.data[index].clazz)
			} else {
				var okay = false
				this.openPanel(apstrata.mForms.Login, {
					success: function() {
						self.openPanel(self.data[index].clazz)
					}, 
					failure: function() {
					} 
				})
			}			
		} else {
			this.openPanel(this.data[index].clazz)
		}
	},
	
	home: function() {
	}

})
