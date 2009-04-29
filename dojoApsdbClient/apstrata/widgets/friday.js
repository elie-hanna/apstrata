dojo.provide("apstrata.widgets.Friday");

dojo.require("dijit._Templated");

dojo.declare("apstrata.widgets.Friday",
	[dijit._Widget, dijit._Templated],
	{

            // Custom Widget Attributes
            title: "",
            color: "",

            // Dojo template that renders widget
            templateString: "<div style='color:" + color + "'>" + title + "</div>",
        
            postCreate: function(){
                    this.inherited(arguments);
            },
            
            startup: function(){
                    this.inherited(arguments);
            }
        });
