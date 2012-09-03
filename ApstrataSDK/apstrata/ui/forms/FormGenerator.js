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
dojo.require("dojo.fx");

dojo.require("apstrata.ui.Curtain")
dojo.require("apstrata.ui.forms.FieldSet")

/**
 * Generates a dijit.form.Form automatically based on a definition object
 * 
 * @param {Object} attrs. 
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
	
	method: "GET", //By default form method is GET

	/**
	 * Instantiates a FormGenerator that will generate a dynamic form widget based on options.definition 
	 * 
	 * @param {Object} options.definition 		form Definition object
	 * @param {string} options.definitionPath	URL to the form definition  
	 * @param {Object} options.value			Value object that will be displayed in the form
	 * @param {string} options.displayGroups	Allows fields to be displayed selectively based on the 
	 * 											values provided in this comma separated list
	 * @param {boolean} options.submitOnEnter	set this to true if you need the form to be submitted when
	 * 											pressing "enter". Default is false. Note that you also need
	 * 											add the following to the form definition: 
	 * 											submitAction: "name_of_the_action_in_the_definition_that_submits_the_form" 
	 * @construct
	 */
	constructor: function(options) {
		this.autoWidth = options.autoWidth
		if (options.definition) {
			this.definition = options.definition
		} else {
			this.definitionPath = options.definitionPath 
		}
		
		if(options.method) {
			this.method = options.method;
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

	/**
	 * The form might be read asynchronously sometimes and generated  
	 *  
	 * @param {function} func
	 * 
	 * @function
	 */	
	ready: function(func) {
		if (this._formReady) {
			func()
			return
		}
		if (!this._readyFuncs) this._readyFuncs = []
		this._readyFuncs.push(func)
	},
	
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
	
	disable: function() {
		var self = this
		this._saveDisabledState = []
		this.frmMain.getDescendants().forEach(function(dijit) {
			self._saveDisabledState.push ({
				dijit: dijit,
				state: dijit.get("disabled")
			})
			dijit.set("disabled", "disabled")
		})
	},
	
	enable: function() {
		this._saveDisabledState.forEach(function(item) {
			item.dijit.set("disabled", item.state)
		})
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
	showAsBusy: function(busy, node, message) {
		var self = this
		
		if (busy) {
			var msg = message ? message : "";
			if (node) this._curtain.show(msg, node); else this._curtain.show(msg)
		} else {
			this._curtain.hide()
		}
	},
	
	/**
	 * return the dijit associated with a field
	 * 
	 * @param {string} name field name
	 */
	getField: function(name) {
		return this._fields[name]
	},
	
	/**
	 * Intercepts set method calls for name="value" and sets the form with value
	 * 
	 * @param {string} name
	 * @param {Object} value
	 */
	set: function(name, value) {
		for (k in value) {
			// replace . in keys with !
		}
		
		if (name == "value") {
			this.value = value
			this.render()
			this._buildForm()
		} 
		
		this.inherited(arguments)
	},
	
	/**
	 * Intercepts get method calls for name="value" and returns the form value
	 * 
	 * @param {Object} name
	 */
	get: function(name) {
		if (name=="value") {
			var newValue = {}
			var value = this.frmMain.get("value")
			
			// get rid of the undefined values,
			//  TODO: don't know why we're getting undefined values by the name of the FieldSets					
//			for (k in values) {
//				if (values[k] == undefined) delete values[k]
//			}

			for (k in value) {
				// replace ! in keys with .
				
				//keep values that are empty so that we can delete fields
				// in apstrata, to delete a field, you need to send it with an empty value
				// hence we need to exlude undefined values but keep the empty values
				//if (value[k]) newValue[k.replace("!", ".")] = value[k]
				if (!(typeof(value[k]) === 'undefined')) {
					//somtimes dojo returns the value of the form with apsdb as an object
					//remove this apsdb hierarchy and flatten it because it causes INVALID_PARAMETER error
					//ex: {apsdb: {query:""}} will become {apsdb.query:""}
										
					if (k == "apsdb") {
						for (var j in value[k]) {
							if (!(typeof(value[k][j]) === 'undefined')) {
								var tmpKey = k + "." + j
								newValue[tmpKey.replace(/!/g, ".")] = value[k][j]
							}
						}	
					} else {
						if (typeof(value[k]) === "object" && value[k].getMonth) {
							newValue[k.replace(/!/g, ".")] = dojo.date.locale.format(value[k], {datePattern: "yyyy-MM-dd", selector:"date"});
						}else
							newValue[k.replace(/!/g, ".")] = value[k]
					}
				}
			}
			
			if (newValue.dijit) delete newValue.dijit
						
			return newValue
		} else return this.inherited(arguments)
	},
	
	/**
	 * Causes the validation method of the form to be called
	 */
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
        var amplitude = 16
        var duration = 30
		
		if (!n) n = this.domNode

		var p = dojo.marginBox(n)

        for (var i=0; i<7; i++) {
            chain.push(
                dojo.fx.slideTo({
                    node: n,
					top: p.t,
                    left: p.l + amplitude,
                    unit: "px",
                    duration: duration
                })
            )
            chain.push(
                dojo.fx.slideTo({
                    node: n,
					top: p.t,
                    left: p.l - amplitude,
                    unit: "px",
                    duration: duration
                })
            )
        }
        chain.push(
            dojo.fx.slideTo({
                node: n,
				top: p.t,
                left: p.l,
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
			// The cardinality setting is only needed for fields in a subform
			//  try to determin if the field [key] is in a subform
			var isInSubform = true
			for (var j=0; j<this.definition.fieldset.length; j++) {
				var fieldDef = this.definition.fieldset[j]
				if ((key==fieldDef.name) && (fieldDef.type != "subform")) {
					isInSubform = false
					break
				}
			}
			if (isInSubform) {
				// The starting cardinality depends on how many values were set for each attribute 
				if (dojo.isArray(this.value[key])) this.cardinalityValues[key] = this.value[key].length; 
					// if it's not an array then the cardinaltity value is 1
					else this.cardinalityValues[key] = 1
			}
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
		
		var tmp = {}
		for (k in this.value) {
			tmp[k.replace(/\./g, "!")] = this.value[k]
		}
		
		// Dijit.form.Form will do the heavylifting to set the values on all fields
		if (this.value) this.frmMain.set("value", tmp) 
		
		// 
		if (this.submitOnEnter) {
			var handleSubmitOnEnter = dojo.hitch(this, this._handleSubmitOnEnter);
			dojo.connect(this.frmMain, "onKeyPress", handleSubmitOnEnter);
		};
		
		this._fireReadyEvent()
	},
	
	_handleSubmitOnEnter: function(e) {	
		
		if (e.keyCode == "13") {
			dojo.stopEvent(e);
			if (this.definition.submitAction && this.frmMain.validate()) {								
				var action = this.options[this.definition.submitAction];
				if (action) {
					action(this.get("value"), this);
				}				
			}	
		}		
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
						var values = self.get("value") //.frmMain.get("value")
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
	},

	
	/**
	 * Fires ready events registered with ready(function)
	 */	
	_fireReadyEvent: function() {
		this._formReady = true
		dojo.forEach(this._readyFuncs, function(func) {
			func()
		})
	},
	
	/**
	 * Change the form method and encType to be compliant with file inputs
	 */
	_setFormFileEncType: function() {
		if(this.method == "GET") {
			this.method = "POST";
			this.frmMain.set("method", "POST");
		}
		this.frmMain._setEncTypeAttr("multipart/form-data");
	}
	
})