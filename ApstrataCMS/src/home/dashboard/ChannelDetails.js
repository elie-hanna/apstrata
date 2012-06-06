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
dojo.provide("apstrata.home.dashboard.ChannelDetails");

dojo.require("dojo.data.ObjectStore");
dojo.require("dojox.grid.DataGrid");

dojo.declare("apstrata.home.dashboard.ChannelDetails", 
[apstrata.horizon.Panel], 
{

	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.home.dashboard", "templates/ChannelDetails.html"),
	
	constructor: function(attrs) {
		this.attrs = {};	
		if (attrs){
			this.channel = attrs.channel;
			this.client = attrs.accountClient ? attrs.accountClient : this.container.client;
			this.backup = dojo.clone(this.channel);
			this.attrs = attrs;					
		}	
		
		if (!this.client){
			this.client = this.container.client;
		}
	},	
	
	postCreate: function() {		
		this.channelID.set("value", this.channel.key);
		this.platform.set("value", this.channel.platform);
		this.lifetime.set("value", this.channel.lifetime);
		
		this._createGrid();		
		this.inherited(arguments);
		if (this.attrs.isNewChannel) {
			this._editChannel();
		}
		
		dojo.connect(this.editChannelButton, "onClick", dojo.hitch(this, "_editChannel"));
		dojo.connect(this.addTokenButton, "onClick", dojo.hitch(this, "_addToken"));
		dojo.connect(this.removeTokenButton, "onClick", dojo.hitch(this, "_removeToken"));
		dojo.connect(this.cancelChangesButton, "onClick", dojo.hitch(this, "_cancelChanges"));
		dojo.connect(this.saveChangesButton, "onClick", dojo.hitch(this, "_saveChanges"));	
	},
	
	startup: function() {
		this.inherited(arguments);
		this.grid.sort();//for some reason, this is the only way to render the grid 
	},
	
	_createMemoryStoreFromTokens: function() {
		
		var self = this;
		var tokensArray = self.backup.deviceTokensAsObjects ? 
									self.backup.deviceTokensAsObjects : 
									[{token : "...", index : this.grid.rowCount}];
		
		// Create a memory store to store a copy of the channel tokens.
		// Note the "identifier" property of the data structure: it must be specified so you can add new rows !
		return new dojo.store.Memory(
				{
					data : {
						identifier: "index",
						items: dojo.clone(tokensArray)
					}
				});
	},
	
	_createGrid: function() {
		var self = this;
		this.grid = new dojox.grid.DataGrid( 
				{			
					structure : [
					             {name: "Token", field: "token", width: "auto", editable: true},
					             {name: "index", field: "index", hidden: true}                                                         
			                 ],			        
			        clientSort: true,
					rowSelector: '10px',
					selectionMode: 'single',
					style: 'height:100%;width:400px'
				});
				
		var memoryStore = this._createMemoryStoreFromTokens();		
		this.grid.setStore(new dojo.data.ObjectStore( { objectStore : memoryStore }));
		this.grid.startup();
		dojo.place(this.grid.domNode, this.gridDiv);	
		dojo.connect(this.grid, "onRowClick", dojo.hitch(this, "_allowTokenRemove"));		
	},
	
	_toggleAttachedPoints: function(value) {
		this.platform.set("readOnly", value);
		this.lifetime.set("readOnly", value);
	},
	
	_toggleSaveCancel: function(value) {
		dojo.style(this.saveChangesButton.domNode, "visibility", value);
		dojo.style(this.cancelChangesButton.domNode, "visibility", value);
	},
	
	_editChannel: function(event) {
		if (this.attrs.isNewChannel) {
			this.channelID.set("readOnly", false);
		}
		
		this._toggleAttachedPoints(false);
		dojo.style(this.editChannelButton.domNode, "visibility", "hidden");
		dojo.style(this.addTokenButton.domNode, "visibility", "visible");
		this._allowChannelUpdate();
	},
	
	_allowChannelUpdate: function(){
		
		this._toggleSaveCancel("visible");			
	},
	
	_allowTokenRemove: function(event) {
		
		dojo.style(this.removeTokenButton.domNode, "visibility", "visible");
		this.candidateRow = event.rowIndex;
		this._allowChannelUpdate();		
	},
	
	_addToken: function(event) {
		var isValid = this.dvForm.validate();
		if (isValid) {	
			this.grid.store.newItem({token : "...", index : this.grid.rowCount});
			this.grid.store.save();
			this._allowChannelUpdate();
		}
	},
	
	_cancelChanges: function() {
		var self = this;
		
		if (this.attrs.isNewChannel){
			this.close();
		}else {
		
			// restore the initial values of the attached point from the channel properties
			this.platform.set("value", this.backup.platform);
			this.lifetime.set("value", this.backup.lifetime);
			
			this._toggleAttachedPoints(true);
			
			// restore initial device tokens values and update the grid by resetting the store
			this.grid.store.close();		
			var memoryStore = this._createMemoryStoreFromTokens();		
			this.grid.setStore(new dojo.data.ObjectStore( { objectStore : memoryStore }));		
			this.grid.startup();
			
			dojo.style(this.editChannelButton.domNode, "visibility", "visible");		
			dojo.style(this.removeTokenButton.domNode, "visibility", "hidden");
			this._toggleSaveCancel("hidden");		
		}
	},
	
	_saveChanges: function() {
		
		var isValid = this.dvForm.validate();
		if (isValid) {	
			var self = this;
			
			var platform = this.platform.get("value");
			var lifetime = this.lifetime.get("value");
			var channelID = this.channelID.get("value");
			var applicationID = this.channel.applicationID;
			var tokens = [];
			var docStore = this.attrs.docStore ? this.attrs.docStore : "DefaultStore";
			
			for (var i = 0; i < this.grid.rowCount; i++) {
				var token = this.grid.getItem(i).token;
				if (token && token != "..."){
					tokens[i] = token;
				}
			}
			
			var operation = "UpdateChannel";
			var expression = {
					"apsdb.store" : docStore,
					"channelId": this.channel.key, 
					"platform": platform, 
					"deviceTokens": tokens 
					};
			
			if (this.attrs.isNewChannel) {
				operation = "CreateChannel";
				expression = {
						"apsdb.store" : docStore,
						"channelId": channelID, 
						"platform": platform, 
						"deviceTokens": tokens, 
						"applicationID" : applicationID					
				}
			};
			
			// call the UpdateChannel service				
			this.client.call(operation, expression).then(
					function(response, o) {
						
						if (response.metadata.status == "failure"){
							self._alert(response.metadata.errorDetail);
						}else {
											
							// update the buttons visibility in the current panel
							self._toggleAttachedPoints(false);
							dojo.style(self.editChannelButton.domNode, "visibility", "visible");
							dojo.style(self.removeTokenButton.domNode, "visibility", "hidden");
							self._toggleSaveCancel("hidden");
							
							// update the parent panel
							self._parent.refreshContent();
						}				
					}, 
					function(response, o) {
						if (typeof(response) == "string") {
							self._alert(response);
						}else {
							self._alert(response.metadata.errorDetail);
						}						
					}
				)			
		}
	},
	
	_removeToken: function(event) {
		var self = this;
		if (this.candidateRow >= 0){
			var token = this.grid.getItem(this.candidateRow);
			if (token){				
				self.grid.store.deleteItem(token);
				this.candidateRow = -1;
			}
		}
	},
	
	_alert: function(message) {
		var self = this;
		new apstrata.horizon.PanelAlert({
					panel: self, 
					width: 320,
					height: 140,
					iconClass: "errorIcon",
					message: message,
					actions: ['OK'],
					actionHandler: function(action) {
						self.closePanel();
					}
				}
			);		
	}
	
})