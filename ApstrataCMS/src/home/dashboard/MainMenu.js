dojo.provide("apstrata.home.dashboard.MainMenu")

dojo.require("dojo.store.Memory")
dojo.require("apstrata.horizon.Menu")

dojo.declare("apstrata.home.dashboard.MainMenu", 
[apstrata.horizon.Menu], 
{
	templatePath: dojo.moduleUrl("apstrata.home.dashboard", "templates/MainMenu.html"),
	items: [
			{	
				id:"accounts", 
				label: "Accounts", 
				panelClass: "apstrata.home.dashboard.Accounts",
				attrs: {
					panelTitle: "Accounts",
					maximizePanel: true,
					credentials: apstrata.apConfig["apstrata.sdk"].Connection.credentials,
				}
			},
			{
				id:"profile", 
				label: "Profile",
				panelClass: "apstrata.home.dashboard.DeveloperProfile",
				attrs: {
					panelTitle: "Profile",
					maximizePanel: true,
					sbTitleMsg: "Search"
				}
			}
	],

	
	constructor: function(args) {
		var self = this
		//
		// widget attributes
		//
		this.filterable = false
		this.sortable = false
		this.editable = false
		
		this.store = new dojo.store.Memory({data: self.items})
	},
	
	postCreate: function(){
		this.inherited(arguments);
	},
	
	startup: function() {
		this.inherited(arguments);
		var args = { menuItemId: "accounts", panelTitle: "Accounts", maximizePanel: true};
		this._listContent._selectId = "accounts";
		this.select();
	}
})