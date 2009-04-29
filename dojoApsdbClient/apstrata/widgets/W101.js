dojo.provide("apstrata.widgets.W101");

dojo.require("dijit._Templated");

dojo.declare("apstrata.widgets.W101",
	[dijit._Widget, dijit._Templated],
	{

            // Custom Widget Attributes
            title: "hi",
            textColor: "red",

            // Dojo template that renders widget
           // templateString: "<div dojoAttachPoint='myDiv' style='color:${textColor}'>${title}</div>",
            templatePath: dojo.moduleUrl("apstrata.widgets", "templates/W101.html"),
            
            // Setters
            
            setTitle: function(title) {
                this.title = title;
            },
            
        
            postCreate: function(){
                    this.inherited(arguments);
                    console.debug(this.title);
                    console.debug(this.textColor);
                    this.connect(this.myDiv, "onclick","alertMe");
            },
            
            alertMe: function() {
                console.dir (this);
                console.debug(this.title);
            },
            
            startup: function(){
                    this.inherited(arguments);
            }
        });
