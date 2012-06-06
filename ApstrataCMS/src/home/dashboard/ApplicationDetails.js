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
dojo.provide("apstrata.home.dashboard.ApplicationDetails");

dojo.require("apstrata.sdk.ObjectStore");
dojo.require("dojox.grid.EnhancedGrid");
dojo.require("dojox.form.FileInput");
dojo.require("dijit.form.Form");

dojo.require("apstrata.horizon.PanelAlert");

dojo.require("apstrata.home.dashboard.ChannelDetails");

dojo.declare("apstrata.home.dashboard.ApplicationDetails", 
[apstrata.horizon.Panel], 
{

	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.home.dashboard", "templates/ApplicationDetails.html"),
	
	constructor: function(attrs) {
		this.attrs = {};
		if (attrs){
			this.attrs = attrs;
			this.application = attrs.application;
			this.backup = dojo.clone(this.application);
			this.client = attrs.accountClient ? attrs.accountClient : this.container.client;	
			this.docStore = attrs.docStore;		
		}
		
		if (!this.client) {
			this.client = this.container.client;
		}
		
		if (!this.docStore) {
			this.docStore = 'DefaultStore';
		}
		
		this._buildStore();
	},	
	
	postCreate: function() {		
		var form = new dijit.form.Form();
		this.dvForm.set("encType", "multipart/form-data");
		if (this.attrs.isNewApplication){
			this._editApplication();			
		}else {
			this.applicationID.set("value", this.attrs.application.applicationID);
			this.password.set("value", this.attrs.application.password);
			this.certificate.innerHTML = "<a id='certificateLink' href='" + this._getCertificate() + "' target='_blank'>Certificate</a>";
		};
		
		this._createGrid();
		
		dojo.connect(this.editApplicationButton, "onClick", dojo.hitch(this, "_editApplication"));
		dojo.connect(this.addChannelButton, "onClick", dojo.hitch(this, "_addChannel"));
		dojo.connect(this.removeChannelButton, "onClick", dojo.hitch(this, "_removeChannel"));
		dojo.connect(this.cancelChangesButton, "onClick", dojo.hitch(this, "_cancelChanges"));
		dojo.connect(this.saveChangesButton, "onClick", dojo.hitch(this, "_saveChanges"));	
		this.inherited(arguments);
	},
	
	startup: function() {
		this.inherited(arguments);
	},
	
	onClick: function(event) {
		this._onGridRowSelected(event);
	},
	
	/*
	 * This method is called by the child panel (containing the details of the selected channel)
	 * when its content is updated ('save' is clicked and changes have been sent to the server) 
	 */
	refreshContent: function() {
		
		this.grid.store.close();		
		this._buildStore();
		this.grid.setStore(new apstrata.sdk.ObjectStoreAdaptor({objectStore: this.store}));		
	},
	
	_buildStore: function() {
				
		var applicationID =  this.attrs.isNewApplication ? "" : this.attrs.application.applicationID;
		var docStore = this.attrs.docStore ? this.attrs.docStore : "DefaultStore";
		this.store = new apstrata.sdk.ObjectStore(
				{
					store : this.docStore,
					connection : this.client.connection,
					queryFields : "key, platform, lifetime, applicationID, deviceTokens",
					queryExpression : "applicationID = \"" + applicationID + "\" and platform is not null"
				});
		
	},

	/*
	 * Open a new panel containing the selected channel instance (from the selected row).
	 * Switch the visibility of the remove channel ("-") button to visible in order to 
	 * enable the user to remove the selected channel
	 */
	_onGridRowSelected: function(event) {
		var self = this;
		
		dojo.style(this.removeChannelButton.domNode, "visibility", "visible");	
		dojo.style(this.cancelChangesButton.domNode, "visibility", "visible");
		this.candidateRow = event.rowIndex;

		var channel = self.grid.getItem(event.rowIndex);		
		if (channel){
			if (channel.deviceTokens){
				channel.deviceTokensAsObjects = [];
					if (dojo.isArray(channel.deviceTokens)){
						dojo.forEach(channel.deviceTokens, function(token, index){
							channel.deviceTokensAsObjects[index] = {'token' : token, 'index' :index};
						});
				}else {
					channel.deviceTokensAsObjects[0] = { 'token' : channel.deviceTokens, 'index' : 0};
				}
			}
			
			self.attrs = dojo.mixin(self.attrs, {isNewChannel : false});
			self.openPanel(apstrata.home.dashboard.ChannelDetails,{channel : channel, accountClient : self.client, attrs : self.attrs, docStore : self.attrs.docStore});
		}
	},
	
	/*
	 * Create the grid that will contain the list of the channels of the current application
	 */
	_createGrid: function() {
		var self = this;
		self.grid = new dojox.grid.EnhancedGrid( 
				{					
					structure : [
					             {'name': 'Channel Id', 'field': 'key', 'width': 'auto'},                             
	                             {'name': 'Platform', 'field': 'platform'},
	                             {'name': 'Life time', 'field': 'lifetime'},	
	                             {'name': 'Device Tokens', 'field': 'deviceTokens', 'hidden': true}                                                                                    
			                 ],
			        clientSort: true,
			        rowSelector: '10px',
			        style: 'height:100%;width:350px'
				});
		
		dojo.connect(self.grid, "onRowClick", dojo.hitch(self, "_onGridRowSelected"));
				
		self.grid.setStore(new apstrata.sdk.ObjectStoreAdaptor({objectStore: self.store}));
		self.grid.startup();
		dojo.place(self.grid.domNode, self.gridDiv)
	},
	
	/*
	 * Open a new panel for entering channel information. The opened panel
	 * will contain an empty channel instance with a default life-time of '5'
	 * an applicationID equal to the current application's id.
	 * You can only add a channel if the application already existed or if 
	 * it was saved.
	 */
	_addChannel: function() {
		var self = this;
		var isValid = this.dvForm.validate();
		if (this.attrs.isNewApplication){
			this._alert("You first need to save your changes");
		}
		
		if (isValid) {		
			var self = this;
			var channel = {
				channelId : '',
				platform : '',
				lietie : 5,
				applicationID : this.applicationID.get("value"),
				deviceTokens : [],
				deviceTokensAsObjects : [{}]
			};
			self.attrs = dojo.mixin(self.attrs, {isNewChannel : true});
			self.openPanel(apstrata.home.dashboard.ChannelDetails,{channel : channel, accountClient :  self.client, attrs : self.attrs});
		}
	},
	
	/*
	 * Remove the selected row from the grid and store, then close the corresponding child panel.
	 * Changes won't be effective until the user clicks on "save"
	 */
	_removeChannel: function(event) {
		var self = this;
		if (!this.channelsToRemove) {
			this.channelsToRemove = new Array();
		}
		
		if (this.candidateRow >= 0){
			var channel = this.grid.getItem(this.candidateRow);
			if (channel){				
				self.grid.store.deleteItem(channel);
				self.closePanel();
				this.candidateRow = -1;
				this.channelsToRemove.push(channel.key);
			}
		}
		
		dojo.style(this.saveChangesButton.domNode, "visibility", "visible");
		dojo.style(this.removeChannelButton.domNode, "visibility", "hidden");
		dojo.style(this.cancelChangesButton.domNode, "visibility", "visible");
	},
	
	/*
	 * Switch the panel to edit mode
	 */
	_editApplication: function() {
		if (this.attrs.isNewApplication){
			this.applicationID.set("readOnly", false);
		}
		
		this.password.set("readOnly", false);
		dojo.style(this.certificateFile.domNode, "visibility", "visible");
		dojo.style(this.saveChangesButton.domNode, "visibility", "visible");
		dojo.style(this.addChannelButton.domNode, "visibility", "visible");
		dojo.style(this.cancelChangesButton.domNode, "visibility", "visible");
		dojo.style(this.editApplicationButton.domNode, "visibility", "hidden");
		dojo.style(this.editApplicationButton.domNode, "visibility", "hidden");		
	},
	
	/*
	 * Undo the changes that were done by the user (of course if he did not click on "save" before).
	 * Reset the visibility of the buttons to its initial value.
	 * Reset the file upload widget  
	 * Reset the store
	 * Close the child panel if it was opened
	 */
	_cancelChanges: function() {	
		var self = this;
		
		if (this.attrs.isNewApplication){
			this.close();
		}else {
		
			this.applicationID.set("readOnly", true);		
			this.password.set("readOnly", true);
			this.password.set("value", this.backup.password)
			dojo.style(this.certificateFile.domNode, "visibility", "hidden");
			dojo.style(this.cancelChangesButton.domNode, "visibility", "hidden");
			dojo.style(this.addChannelButton.domNode, "visibility", "hidden");
			dojo.style(this.removeChannelButton.domNode, "visibility", "hidden");
			dojo.style(this.editApplicationButton.domNode, "visibility", "visible");
			
			// Remove any newly attached certificate
			this.certificateFile.reset();
			
			// restore initial device channel values and update the grid by resetting the store
			var storeReloaded = this.grid.store.fetch();	
			this.store = storeReloaded.store.objectStore;
			this.grid.setStore(new apstrata.sdk.ObjectStoreAdaptor({objectStore: self.store}));
			
			// flush the arrays of channels to remove
			if (this.channelsToRemove && this.channelToRemove.length > 0) {
				this.channelsToRemove.splice(0, this.channelsToRemove.length);
			} 
			
			// Close child panel if any
			this.closePanel();
		}
	},
	
	/*
	 * Persist the changes that were made by the user by calling the UpdateCertificate API
	 * and reloading the store of the parent panel
	 */
	_saveChanges: function() {
		var isValid = this.dvForm.validate();
		if (isValid) {	
			
			var self = this;			
			var scriptParams = {};
			scriptParams["applicationID"] = this.applicationID.get("value");
			scriptParams["password"] = this.password.get("value");
			scriptParams["apsdb.store"] = this.attrs.docStore ? this.attrs.docStore : "DefaultStore";
			
			var action = this.attrs.isNewApplication ? "AddCertificate" : "RunScript";
			
			if (action == "RunScript"){
				scriptParams["channelsToRemove"] = this.channelsToRemove;
				scriptParams["apsdb.scriptName"] = "dashboard.updateApplication";
			}
			
			this.client.call(action, scriptParams, self.dvForm.domNode, {method:"post"}).then(
					function(response){
						if (response.result.errorDetail){
							if (response.result.errorDetail instanceof Object){
								self._alert("Script error");
							}else {
								self._alert(response.result.errorDetail);
							}
						}else {
							self._parent.refreshContent();
							
							// flush the arrays of channels to remove
							if (this.channelsToRemove && this.channelsToRemove.length > 0) {
								this.channelsToRemove.splice(0, this.channelsToRemove.length);
							} 
							
							if (this.attrs.isNewApplication) {
								this.attrs.isNewApplication = false;
							}
							
							// Layout the updated grid by sorting twice (TODO: need a better alternative)
							this.grid.sort();
							this.grid.sort();
						}
					},
					function(response){
						if (typeof(response) == "string") {
							self._alert(response);
						}else {
							var error = response.result.errorDetail ? response.result.errorDetail : response.result.errorCode
							self._alert(response.result.errorDetail);
						}
					}
			);			
		}		
	},
	
	/*
	 * Builds and returns the URL to download the certificate file that is related
	 * to the application. 
	 */
	_getCertificate: function(event) {	
		var docStore = this.attrs.docStore ? this.attrs.docStore : "DefaultStore";
		var params = {
			"apsdb.documentKey" : this.applicationID.get("value"),
			"apsdb.fileName" : "certificate",
			"apsdb.fieldName" : "apsdb_attachments",
			"apsdb.store" : docStore
		};
		
		var connection = this.client.connection;
		var url = connection.sign("GetFile", dojo.objectToQuery(params)).url;
		return url;
	},
	
	/*
	 * Display an alert message
	 */
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