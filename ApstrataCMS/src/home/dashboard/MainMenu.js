dojo.provide("apstrata.home.dashboard.MainMenu")

dojo.require("dojo.store.Memory")
dojo.require("apstrata.horizon.Menu")
dojo.require('amc.global.DataLoader');
dojo.require('amc.global.Welcome');

dojo.declare("apstrata.home.dashboard.MainMenu", 
[apstrata.horizon.Menu], 
{
	templatePath: dojo.moduleUrl("apstrata.home.dashboard", "templates/MainMenu.html"),
	items: [
			{	
				id:"manageApplications", 
				label: "Manage Applications", 
				panelClass: "apstrata.home.dashboard.ApplicationsGrid",
				attrs: {
					panelTitle: "Applications",
					maximizePanel: false,
					widthPanel:"420px",
					sbTitleMsg: "Search"
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
		globalData = new amc.global.DataLoader({
			"client": amc.globals.sdk.client
		});
		
		var userName = new amc.global.Welcome({
			"client": amc.globals.sdk.client,
			"dataLoader": globalData
		});
		dojo.place(userName.domNode, this.welcomeLbl, "only");

	},
	
	startup: function() {
		this.inherited(arguments);
		var args = { menuItemId: "manageApplications", panelTitle: "Manage Applications", maximizePanel: true};
		this._listContent._selectId = "manageApplications";
		this.select();
	}
})