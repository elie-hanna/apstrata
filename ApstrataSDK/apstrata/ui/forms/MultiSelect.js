dojo.provide("apstrata.ui.forms.MultiSelect")

dojo.require("dojox.dtl._Templated");
dojo.require("dijit.form.MultiSelect");

dojo.declare("apstrata.ui.forms.MultiSelect", 
[dijit.form.MultiSelect], 
{
	/*
	 * Options that will populate the select list
	 * example:
	 * 	[{id:"value1", name:"label1"},{id:"value2", name: "label2"}] 
	 */
	options: [],

	/*
	 * Extends the dijit.form.MultiSelect, to be used programatically by passing to it a set of options.
	 * Build the passed options array as HTML options and appends them to the MultiSelect empty domNode
	 */
	postCreate: function() {		
		if (this.options) {
			var self = this;
			dojo.forEach(this.options, function(option) {
				dojo.create('option', {innerHTML: option.name, value: option.id}, self.domNode);
			});
		}
		this.inherited(arguments)
	}
});
