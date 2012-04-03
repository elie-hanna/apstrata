dojo.provide("apstrata.widgets.forms.FormGenerator")

dojo.require("dojox.dtl._Templated")

dojo.require("dijit.form.Form")

dojo.require("apstrata.widgets.forms.FieldSet")

/**
 * Generates a dijit.form.Form automatically based on a definition object
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
	value: null,
	
	/**
	 * Instantiates a FormGenerator that will generate a dynamic form widget based on options.definition 
	 * 
	 * @param {Object} options.definition 		form Definition object
	 * @param {string} options.definitionPath	URL to the form definition  
	 * 
	 * @construct
	 */
	constructor: function(options) {
		if (options.definition) {
			this.definition = options.definition
		} else {
			this.definitionPath = options.definitionPath 
		}
	},
	
	postCreate: function() {
		// Build the form only after loading the definition
		this._getdefinition().then(dojo.hitch(this,"_buildForm"), dojo.hitch(this,"_error"))
	},
	
	//
	// Publich methods
	//
	
	/**
	 * This method disables all buttons on a form, 
	 * 	it is useful when doing an async operation or animation and need to stop the user from doing any
	 * 	action until it's done
	 * 
	 * @param {boolean} disabled
	 */
	disableButtons: function(disabled) {
		dojo.query(".dijitButton", this.domNode).forEach(function(node, index, arr){
		    dijit.byId(dojo.attr(node, "widgetid")).set("disabled", disabled?"disabled":"")
		})
	},

	//
	// Events
	//
	
	/**
	 * Is called when an action button is pressed
	 * 
	 * @param {string} action 	Action button label
	 * @param {Object} values 	form values
	 */
	onAction: function(action, values) {},
	
	//
	// Private methods
	//
	
	/**
	 * Load the definition from a url at definitionPath is provided and definition is not
	 */
	_getdefinition: function() {
		var deferred = new dojo.Deferred()
		if (this.definition) deferred.resolve()
		return deferred
	},

	/**
	 * Generate the form based on definition
	 */
	_buildForm: function() {
		var self = this
		
		// add custom CSS class
		//  TODO: this is not working go figure!
		if (this.definition.cssClass) dojo.addClass(this.domNode, this.definition.cssClass)
		
		// If the user has provided a label show it
		if (this.definition.label) this.label = this.definition.label
		this.render()

		// This is important to set the appropriate number of rows in a multivalue field
		//	based on this.value
		this.cardinalityValues = {}
		for (key in this.value) {
			// The starting cardinality depends on how many values were set for each attribute 
			if (dojo.isArray(value[key])) this.cardinalityValues[key] = value[key].length; 
				// if it's not an array then the cardinaltity value is 1
				else this.cardinalityValues[key] = 1
		}		
		
		// Start building the form
		this._rootFieldSet = new apstrata.widgets.forms.FieldSet({
			type: "form", style: "form",
			fieldset: self.definition.fieldset,
			value: self.value,
			formGenerator: self
		}, this.dvFieldset)
		
		this._addActions()
		
		// Dijit.form.Form will do the heavylifting to set the values on all fields
		if (this.value) this.frmMain.set("value", this.value)
	},
	
	/**
	 * Add the actions at the bottom of the form based on definition.actions
	 */
	_addActions: function() {
		var self = this
		
		dojo.forEach(self.definition.actions, function(action) {
			var button = new dijit.form.Button({
				label: action,
				onClick: function() {
					
					var values = self.frmMain.get("value")

					// get rid of the undefined values,
					//  TODO: don't know why we're getting undefined values by the name of the FieldSets					
					for (k in values) {
						if (values[k] == undefined) delete values[k]
					}
					console.dir(values)
					self.onAction(action, values)
				}
			})
			
			dojo.place(button.domNode, self.dvActions)
		})
	},
	
	/**
	 * Display an error in case we can't load the definition
	 */
	_error: function() {
	}

	
})