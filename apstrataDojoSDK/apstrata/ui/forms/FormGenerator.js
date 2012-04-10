/*******************************************************************************
 *  Copyright 2009-2012 Apstrata
 *  
 *  This file is part of Apstrata Database Javascript Client.
 *  
 *  Apstrata Database Javascript Client is free software: you can redistribute it
 *  and/or modify it under the terms of the GNU Lesser General Public License as
 *  published by the Free Software Foundation, either version 3 of the License,
 *  or (at your option) any later version.
 *  
 *  Apstrata Database Javascript Client is distributed in the hope that it will be
 *  useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *  
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with Apstrata Database Javascript Client.  If not, see <http://www.gnu.org/licenses/>.
 * *****************************************************************************
 */
dojo.provide("apstrata.ui.forms.FormGenerator")

dojo.require("dojox.dtl._Templated")

dojo.require("dijit.form.Form")

dojo.require("apstrata.ui.Curtain")

dojo.require("apstrata.ui.forms.FieldSet")

/**
 * Generates a dijit.form.Form automatically based on a definition object
 * 
 * @param {Object} attrs
 */
dojo.declare("apstrata.ui.forms.FormGenerator", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templatePath: dojo.moduleUrl("apstrata.ui.forms","templates/FormGenerator.html"),
	
	widgetsInTemplate: true,
	label: "",

	// Instantiation attributes
	value: null,
	definition: null,
	definitionPath: "",
	autoWidth: false,
	displayGroups: "",
	
	/**
	 * Instantiates a FormGenerator that will generate a dynamic form widget based on options.definition 
	 * 
	 * @param {Object} options.definition 		form Definition object
	 * @param {string} options.definitionPath	URL to the form definition  
	 * @param {Object} options.value			Value object that will be displayed in the form
	 * @param {string} options.displayGroups	Allows fields to be displayed selectively based on the 
	 * 											values provided in this comma separated list
	 * 
	 * @construct
	 */
	constructor: function(options) {
		this.autoWidth = options.autoWidth
		if (options.definition) {
			this.definition = options.definition
		} else {
			this.definitionPath = options.definitionPath 
		}
		
		this.options = options
		if (options.displayGroups) this._groups = options.displayGroups.split(",")
		
		// Map that contains all fields in the form
		//	this doesn't work well yet with fields in ROW type subform
		this._fields = {}
	},
	
	postCreate: function() {
		var self = this
		
		// Build the form only after loading the definition
		this._getdefinition().then(dojo.hitch(this,"_buildForm"), dojo.hitch(this,"_error"))
		this._curtain = new apstrata.ui.Curtain({node: self.domNode})

		this.inherited(arguments)
	},
	
	//
	// Publich methods
	//
	
	shouldDisplay: function(displayGroup) {
		if (!this._groups) return true
		if (!displayGroup) return true
		
		var found = false
		for (var i=0; i<this._groups.length; i++) {
			if (this._groups[i] == displayGroup) {
				found = true
				break;
			}
		}
		
		return found
	},
	
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
	
	/**
	 * 
	 * 
	 * @param {Object} busy
	 */
	showAsBusy: function(busy) {
		var self = this
		
		if (busy) this._curtain.show(); else this._curtain.hide()
		
//		dojo.query(".dijit", this.domNode).forEach(function(node, index, arr){
//			dijit.byId(dojo.attr(node, "widgetid")).set("disabled", busy?"disabled":"")
//		})
	},
	
	getField: function(name) {
		return this._fields[name]
	},
	
	validate: function() {
		return this.frmMain.validate()
	},

	/**
	 * Vibrate the form, this is useful to indicate a validation error for example
	 *
	 * @param {Node} n optional DomNode to vibrate otherwise the widget domnode 
	 * 
	 * @function
	 */
    vibrate: function (n) {
        var chain = []
        var amplitude = 12
        var duration = 30
		
		if (!n) n = this.domNode

        for (var i=0; i<5; i++) {
            chain.push(
                dojo.fx.slideTo({
                    node: n,
                    left: amplitude,
                    unit: "px",
                    duration: duration
                })
            )
            chain.push(
                dojo.fx.slideTo({
                    node: n,
                    left: -1*amplitude,
                    unit: "px",
                    duration: duration
                })
            )
        }
        chain.push(
            dojo.fx.slideTo({
                node: n,
                left: "0",
                unit: "px",
                duration: duration
            })
        )

        dojo.fx.chain(chain).play()
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
		if (this.options.label) this.label = this.options.label
		this.render()

		// This is important to set the appropriate number of rows in a multivalue field
		//	based on this.value
		this.cardinalityValues = {}
		for (key in this.value) {
			// The starting cardinality depends on how many values were set for each attribute 
			if (dojo.isArray(this.value[key])) this.cardinalityValues[key] = this.value[key].length; 
				// if it's not an array then the cardinaltity value is 1
				else this.cardinalityValues[key] = 1
		}		
		
		// Start building the form
		this._rootFieldSet = new apstrata.ui.forms.FieldSet({
			type: "form", style: "form",
			fieldset: self.definition.fieldset,
			value: self.value,
			formGenerator: self
		}, this.dvFieldset)
		
		this._rootFieldSet.generate()
		
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
					if (self.frmMain.validate()) {
						var values = self.frmMain.get("value")
						// get rid of the undefined values,
						//  TODO: don't know why we're getting undefined values by the name of the FieldSets					
						for (k in values) {
							if (values[k] == undefined) delete values[k]
						}
						self.onAction(action, values, self)
						if (self.options[action] && dojo.isFunction(self.options[action])) self.options[action](values, self)
					}
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