dojo.provide("apstrata.home.dashboard.AvailableStores");

dojo.require("apstrata.horizon.NewList");
dojo.require("apstrata.sdk.AdminStore");
dojo.require("apstrata.home.dashboard.PushNotifications");

dojo.declare("apstrata.home.dashboard.AvailableStores", 
[apstrata.horizon.NewList], 
{
	//
	// widget attributes
	//
	filterable: true,
	sortable: true,
	editable: false,
	
	labelAttribute: "name",
	idAttribute: "name",
	
	constructor: function(attrs) {
		var self = this
		if (attrs) {
			this.client = attrs.accountClient ? attrs.accountClient : this.container.client;
		}
		this.store = new apstrata.sdk.AdminStore({
			connection: this.client.connection
		});
		
		this.store.setType('stores');
	},

	postCreate: function() {
		this.inherited(arguments);		
	},
	
	startup: function() {
		dojo.style(this.domNode, "width", "190px");		
		this.inherited(arguments);
	},
	
	onClick: function(id, selectedIds) {
		this.openPanel(apstrata.home.dashboard.PushNotifications, {accountClient : this.client, store: id});
	},

	getId: function(item) {return item.name},
	getLabel: function(item) {return item.name},
	
})