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
		this.connection = new apstrata.sdk.TokenConnection({credentials: credentials, isUseParameterToken: true});		
		this.client = new apstrata.sdk.Client(this.connection);
		
		var item = {
			id:"logout", 
			label: "Logout"
		};
		
		try {
			this.main.addItem(item);
		} catch (e) {
			//catch the exception that results from adding the logout item when it already exists and do nothing about it
		}	
		
		//redirect in case the "redirectTo" URL parameter is specified
		if (location.search) {
			urlParams = dojo.queryToObject(location.search.substring(1));
			redirectUrl = urlParams.redirectTo;
			if (redirectUrl) {
				location.href = redirectUrl;
			}
		}
	},
	
	startup: function() {
		this.addMainPanel(apstrata.home.dashboard.Menu);
		this.inherited(arguments);
		
		if (this._curtain) {
			var d = dojo.query(".horizonBackground")[0];
			if (d) {
				var p = dojo.position(d);			
				dojo.style(this._curtain, {
					top: p.y + "px",
					left: p.x + "px",
					width: p.w + "px",
					height: p.h + "px"
				})
			}
		}
	},
	
	logout: function() {
		this.connection.logout({
			success: function() {
				window.location = apstrata.registry.get("apstrata.cms", "baseUrl");	
			},
			failure: function() {
				
			}
		})
	}
})