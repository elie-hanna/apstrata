dojo.provide("apstrata.widgets.PropertiesEditor");

dojo.require("apstrata.widgets.PropertyEditor"); 

dojo.require("dijit._Templated");
dojo.require("dijit.layout.LayoutContainer"); 

dojo.declare("apstrata.widgets.PropertiesEditor",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		valueType: 1,
		templatePath: dojo.moduleUrl("apstrata.widgets", "templates/PropertiesEditor.html"),
		postCreate: function(){
//			this.connect(this.removeIcon, "onclick", "removeField");
		},
		
		startup: function(){
			this.inherited(arguments);
		},
		
		postMixInProperties: function() {
			this.inherited(arguments);
		},

		addChild: function(newField) {
			this.propertiesPanel.addChild(newField);
		}
	});
