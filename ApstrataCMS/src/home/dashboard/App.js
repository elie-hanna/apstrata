dojo.provide("apstrata.home.dashboard.App")

dojo.require("apstrata.horizon.Container")
dojo.require("apstrata.home.dashboard.MainMenu")

dojo.declare("apstrata.home.dashboard.App", 
[apstrata.horizon.Container], 
{
	applicationId: "apstrataWebsiteConsole",
	logo: "",
	
	startup: function() {
	   this.addMainPanel(apstrata.home.dashboard.MainMenu, {logo: this.logo})
	   dojo.place('<hr class="separator"/>', this._mainPanel.dvContent.firstChild, 'first');
	   dojo.place('<hr style="separator"/>', this._mainPanel.dvContent.firstChild, 'last');
	   this.inherited(arguments)
	}
})
