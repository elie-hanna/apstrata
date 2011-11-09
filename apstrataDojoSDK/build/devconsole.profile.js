dependencies = {
    layers:  [ 
        {
	        name: "../apstrata/devConsole-lib.js",
	        
	        dependencies: [
				// dojo/dijit basics
				"dijit.form.CheckBox",
				"dijit.form.Form",
				"dijit.form.Button",
				"dijit.form.ValidationTextBox",
				"dijit.form.SimpleTextarea",
				"dijit.form.Textarea",
				"dijit.form.DateTextBox",
				"dijit.form.HorizontalSlider",
				"dijit.form.HorizontalRuleLabels",
				"dijit.form.FilteringSelect",
				"dijit._Widget",
				"dijit.layout._LayoutWidget",
				"dojox.dtl._Templated",
				"dojox.widget.Toaster",
				"dojo.fx.easing",
				"dojo.data.ItemFileReadStore",
				
				// apstrata/horizon modules
				"apstrata.horizon.HStackableMainPanel",
				"apstrata.horizon._HStackableMixin",
				"apstrata.horizon.Login",
				"apstrata.horizon.Preferences",
				"apstrata.horizon.HStackableContainer",
				"apstrata.horizon.ContextualHelp",
				
				"apstrata.widgets.QueryWidget",
				"apstrata.widgets.Alert",
				"apstrata.widgets.SlidingPanel",
				"apstrata.widgets.client.ConnectionStatus",
				"apstrata.widgets.client.RESTMonitor",
				
				"apstrata.ItemApsdbReadStore",
				"apstrata.Client",
				"apstrata.StickyConnection",
				
				"apstrata.util.logger.BasicLogger",
				"apstrata.apstrata",
				
				
				// devConsole modules
				"apstrata.devConsole.ApConfig",
				"apstrata.devConsole.DevConsole",
				"apstrata.devConsole.HomePanel",
				"apstrata.devConsole.StoresPanel",
				"apstrata.devConsole.SchemasPanel",
				"apstrata.devConsole.ScriptsPanel",
				"apstrata.devConsole.GroupsPanel",
				"apstrata.devConsole.UsersPanel",
				"apstrata.devConsole.QueryPanel",
				"apstrata.devConsole.Login"
								
	        ]
        }
    ],
    prefixes: [
		[ "apstrata", "../../../../apstrata" ]
    ]
};