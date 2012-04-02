dojo.provide("apstrata.widgets.forms.FormGenerator")

dojo.require("dojox.dtl._Templated")

dojo.require("dojo.store.Memory")
dojo.require("dojo.data.ObjectStore")

dojo.require("dijit.form.Form")

dojo.require("apstrata.widgets.forms.FieldSet")

/**
 * 
 * @param {Object} attrs
 */
dojo.declare("apstrata.widgets.forms.FormGenerator", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templatePath: dojo.moduleUrl("apstrata.widgets.forms","templates/FormGenerator.html"),
	
	widgetsInTemplate: true,
	definition: null,
	definitionPath: "",
	label: "",
	
	constructor: function(options) {
		if (options.definition) {
			this.definition = options.definition
		} else {
			this.definitionPath = options.definitionPath 
		}
	},
	
	postCreate: function() {
		this._getdefinition().then(dojo.hitch(this,"_buildForm"), dojo.hitch(this,"_error"))
	},
	
	//
	// Private methods
	//
	
	_getdefinition: function() {
		var deferred = new dojo.Deferred()
		if (this.definition) deferred.resolve()
		return deferred
	},

	_buildForm: function() {
		if (this.definition.label) this.label = this.definition.label
		this.render()
		
		this._rootFieldSet = new apstrata.widgets.forms.FieldSet({
			type: "main", style: "single",
			fieldset: self.definition.fieldset
		}, this.dvFieldset)
	},
	
	_error: function() {
	}

	
})