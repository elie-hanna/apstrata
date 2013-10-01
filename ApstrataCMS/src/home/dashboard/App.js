dojo.provide("apstrata.home.dashboard.App")

dojo.require("apstrata.horizon.Container")
dojo.require("apstrata.home.dashboard.MainMenu")

dojo.declare("apstrata.home.dashboard.App", 
[apstrata.horizon.Container], 
{
	applicationId: "apstrataWebsiteConsole",
	
	startup: function() {
	   this.addMainPanel(apstrata.home.dashboard.MainMenu, {})
	   dojo.place('<hr class="separator"/>', this._mainPanel.dvContent.firstChild, 'first');
	   dojo.place('<hr style="separator"/>', this._mainPanel.dvContent.firstChild, 'last');
	   this.inherited(arguments)
	}
})
