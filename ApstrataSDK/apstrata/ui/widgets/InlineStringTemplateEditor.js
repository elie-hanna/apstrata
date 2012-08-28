dojo.provide('apstrata.ui.widgets.InlineStringTemplateEditor');

dojo.require("dojox.dtl._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.InlineEditBox");

dojo.declare("apstrata.ui.widgets.InlineStringTemplateEditor", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templateString: dojo.cache("apstrata.ui.widgets", "templates/InlineStringTemplateEditor.html"),	
	widgets: null,
	processedTemplate: "",
	widgetsInTemplate: true,
	
	constructor: function(args){
		dojo.mixin(this, args);
		this.init();
	},
	
	init: function(){
		this.processedTemplate = this.template.replace(/\$\$(.*?)\$\$/g , "<span dojoType=\"dijit.InlineEditBox\">$1</span>");
	},
	
	get: function(name) {
		if (name=="value") {
			return this.fullText.innerText || this.fullText.textContent;
		}else{
			return this.inherited(arguments);
		}
	},
	
	set: function(name, v) {
		if (name=="value") {
			this.template = v;
			this.init();
			this.render();
		}else{
			this.inherited(arguments);
		}
	}
})
