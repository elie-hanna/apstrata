/*******************************************************************************
 *  Copyright 2009-2011 Apstrata
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
dojo.provide("apstrata.home.dashboard.PushNotifications");

dojo.require("dojox.grid.EnhancedGrid");
dojo.require("apstrata.sdk.ObjectStore");
dojo.require("apstrata.horizon.Grid");
dojo.require("apstrata.home.dashboard.ApplicationDetails");

dojo.declare("apstrata.home.dashboard.PushNotifications", 
[apstrata.horizon.Grid], 
{

	_query : {
		store : "DefaultStore", 
		query : "applicationID is not null and password is not null and apsdb_attachments = \"certificate\" ", 
		queryFields : "key, applicationID, password, apsdb_attachments"		
	},
	
	constructor: function(attr) {
		
		this.gridClass = dojox.grid.EnhancedGrid;
		if (attr) {
			this.docStore = attr.store ? attr.store : "DefaultStore";
			this.client = attr.accountClient ? attr.accountClient : this.container.client;
		}
		
		if (!this.client) {
			this.client = this.container.client;
		}
		
		this.store = new apstrata.sdk.ObjectStore({
			store: this.docStore,
			connection : this.client.connection,
			queryFields : this._query.queryFields,
			queryExpression : this._query.query
		});		
		
		this.gridParams = {
				store: new apstrata.sdk.ObjectStoreAdaptor({objectStore: this.store}),
				structure: [
							[
								{ field: 'key', hidden: true, width: 'auto'},
								{ field: 'applicationID', width: 'auto'},
								{ field: 'password', width: 'auto'},
								{ name: 'Has certificate', field: 'apsdb_attachments', width: 'auto'},							
							]
						],
				style: 'width:400px'		
		}
	},
	
	onClick: function(e) {
		var self = this;
		var application = self._grid.getItem(e.rowIndex);
		if (application != null) {		
			eval("var applicationObject = " + JSON.stringify(application) + ";");	
			var newPanel = self.openPanel(apstrata.home.dashboard.ApplicationDetails,{application : applicationObject, accountClient : self.client, docStore: self.docStore });			
		}
	},
	
	refreshContent: function() {
		var storeReloaded = this._grid.store.fetch();
		this.store = storeReloaded.store.objectStore;
		this._grid.setStore(new apstrata.sdk.ObjectStoreAdaptor({objectStore: self.store}));
	},
	
	newItem: function() {
		this.openPanel(apstrata.home.dashboard.ApplicationDetails,{accountClient : this.client, docStore: this.docStore, isNewApplication: true });
	},
	
	deleteItems: function() {
		this.inherited(arguments);
		//TODO find another way to force display of grid
		this._grid.sort();
		this._grid.sort();
	},
	
	filter: function(attr) { 		
		var self = this
		
		var storeParams = {
			connection: self.client.connection,
			store: "DefaultStore",
			resultsPerPage: self.rowsPerPage,
			queryFields: this._query.queryFields,	
			queryExpression : "applicationID like \"" + attr.search.trim() + "%\" and password is not null and apsdb_attachments = \"certificate\""		
		}
		
		self._grid.setStore(new apstrata.sdk.ObjectStoreAdaptor({objectStore: new apstrata.sdk.ObjectStore(storeParams)}))
	}
	
})