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
dojo.provide("apstrata.home.dashboard.Dashboard")

dojo.require("apstrata.horizon.Container")
dojo.require("apstrata.home.dashboard.Menu")

dojo.declare("apstrata.home.dashboard.Dashboard", 
[apstrata.horizon.Container], 
{
	applicationId: "apstrata-home",
	showToolbar: false,
	connection: {},
	
	constructor: function(attrs) {
		dojo.mixin(this, attrs);
	},
	
	onCredentials: function(credentials) {
		this.connection = new apstrata.sdk.Connection({credentials: credentials, loginType: "user"});		
		this.client = new apstrata.sdk.Client(this.connection);
	},
	
	startup: function() {
		this.addMainPanel(apstrata.home.dashboard.Menu);
		this.inherited(arguments);
	}
})