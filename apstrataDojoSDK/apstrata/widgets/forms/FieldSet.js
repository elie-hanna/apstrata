dojo.provide("apstrata.widgets.forms.FieldSet")

dojo.require("dijit.form.ValidationTextBox")
dojo.require("dijit.form.SimpleTextarea")
dojo.require("dijit.form.ComboBox")
dojo.require("dijit.form.Button")

dojo.require("dojo.store.Memory")
dojo.require("dojo.data.ObjectStore")

dojo.declare("apstrata.widgets.forms.FieldSet", 
[dijit._Widget, dojox.dtl._Templated], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.widgets.forms", "templates/FieldSet.html"),
	
	_fieldSet: [],
	label: "",

	//
	// Constants
	//
	_FORM: "form",
	_SUBFORM: "subform",
	_ROW: "row",
	
	//
	// Private vars
	//
	_rows: 0,

	/**
	 * Instantiates a Collection of single or multi value fields
	 * 
	 * @param {Object} options.fieldset
	 * @param {Object} options.cardinality
	 * @param {Object} options.type
	 * @param {Object} options.style
	 * @param {Object} options.cardinalityValues
	 * 
	 */
	constructor: function(options) {
		this.fieldset = options.fieldset
		this.formGenerator = options.formGenerator
		
		if (options.cardinality) {
			this.cardinality = options.cardinality
			
			if (!options.cardinality.min) this.cardinality.min = 0 // minimum cardinality is 1
			if (options.cardinality.max < options.cardinality.min) this.cardinality.max = this.cardinality.min 
		} else this.cardinality = {min:1, max:1}
		
		this.type = options.type
		if (options.style) this.style = options.style; else this.style = this._FORM
		
		if (options.cardinalityValues) {
			this.cardinalityValues = options.cardinalityValues
		}
		
		for (key in this.formGenerator.cardinalityValues) {
			for (var i=0; i<options.fieldset.length; i++) {
				if (options.fieldset[i].name == key) {
					this.cardinality.value = this.formGenerator.cardinalityValues[key]
					break
				}
			}
		}
	},
	
	postCreate: function(options) {
		var self = this
		
		// If this fieldset is to be represented as a row, let's add a header for labels
		if (this.style == this._ROW) this._addHeaderRow()
		
		// Calculate startRows number of rows depending on min or the amount of values of each multi value field
		var startRows
		if (this.cardinality.value) {
			if (this.cardinality.min<this.cardinality.value) {
				startRows = this.cardinality.value
			} else {
				startRows = this.cardinality.min
			}
		} else startRows = this.cardinality.min

		// Add the rows
		for (var i=0; i<startRows; i++) this._addSet(i)

		// Add the bottom disabled row used as a place holder
		if (this.style == this._ROW) this._addSet(0, true)
	},

	//
	// Private methods
	//
	
	/**
	 * 
	 * @param {boolean} hide   disables the add button
	 */
	_hideAddButton: function(hide) {
		if (hide) this._addButton.set("disabled", "disabled"); else this._addButton.set("disabled", "")
	},
	
	/**
	 * Add the label row for multivalue fields
	 */
	_addHeaderRow: function() {
		// only if there are more than 1 columns
		if (this.fieldset.length>1) {
			var dv = dojo.create("div")
			dojo.addClass(dv, "headerRow")
			dojo.place(dv, this.dvFields)
	
			dojo.forEach(this.fieldset, function(definition) {
				var label = dojo.create("div", {innerHTML: definition.name}) 
				dojo.addClass(label, "label")
				if (definition.cssClass) dojo.addClass(label, definition.cssClass + "-label")
				dojo.place(label, dv)
			})
		}
	},
	
	/**
	 * 
	 * @param {integer} rowNumber	serial number of the row
	 * @param {true} bottomRow		true if this is the placeholder bottom row
	 */
	_addSet: function(rowNumber, bottomRow) {
		var self = this
		
		if (this.type == this._SUBFORM) 
			if (!bottomRow)
			 if (rowNumber>=(this.cardinality.max-1)) this._hideAddButton(true)
		
		var dv
		if (bottomRow) dv = this.dvActions;
		else {
			this._rows++
			var dv = dojo.create("div")
			dojo.addClass(dv, "set")
			dojo.addClass(dv, this.style)
			dojo.place(dv, this.dvFields)
			
			self._animationInProgress = true

			dojo.style(dv, "opacity", "0")
			dojo.animateProperty({
				node: dv, 
				duration: 500,
				properties: {
					opacity: 1			
				},
				onEnd: function() {
					self._animationInProgress = false
				}
			}).play()
		}
		
		dojo.forEach(this.fieldset, function(definition) {
			var field 			

			attr = {
				name: definition.name
			}
			
			if (definition.type == self._SUBFORM) {
				definition.formGenerator = self.formGenerator
				field = new apstrata.widgets.forms.FieldSet(definition)
			} else if (definition.widget) {
				switch (definition.widget) {
					case "dijit.form.ComboBox":
					
						var choices = []
						dojo.forEach(definition.options, function(option) {
							choices.push({name: option, id: option})
						})
						dojo.mixin(attr, {
				            value: choices[0].id,
				            store: new  dojo.data.ObjectStore({objectStore: new dojo.store.Memory({data: choices})}),
				        })			
						
						field = new dijit.form.ComboBox(attr)
						break;
									
					default:
						field = new dijit.form.TextBox(attr)
						break;
				}
				
				//field.set("name", definition.name)
			} else {
				field = new dijit.form.TextBox(attr)
				//field.set("name", definition.name)
			}
			
			// If this is not a tabular format add a label before each field
			if (self.style == self._FORM) {
				var label = dojo.create("div", {innerHTML: definition.name}) 
				dojo.addClass(label, "label")
				dojo.place(label, dv)
			}
			
			if (definition.cssClass) dojo.addClass(field.domNode, definition.cssClass)
			if (bottomRow) field.set("disabled", "disabled")
			
			dojo.place(field.domNode, dv)
		})
		
		if (!bottomRow && (this.type == this._SUBFORM)) {
			if (rowNumber>=this.cardinality.min) {
				var button = new dijit.form.Button({
					label: "-",
					onClick: function() {
						self._remove(dv, self)
					}
				})
				dojo.place(button.domNode, dv)
			}
		}

		if (bottomRow) {
			if (!this.cardinality.max || (this.cardinality.max > this.cardinality.min)) {
				if (this.type == "subform") {
					self._addButton = new dijit.form.Button({
						label: "+",
						onClick: function(){
							self._addSet(self._rows)
						}
					})
					dojo.place(self._addButton.domNode, dv)
				}
			}
		}
	},

	/**
	 * Delete a row
	 * 
	 * @param {DOMNode} dv		containing div
	 * @param {Object} self		FieldSet widget		
	 */
	_remove: function(dv, self) {
		self._animationInProgress = true
		
		self.formGenerator.disableButtons(true)
		
		dojo.animateProperty({
			node: dv, 
			duration: 250,
			properties: {
				opacity: 0
			},
			onEnd: function() {
				self.formGenerator.disableButtons(false)
				dv.parentNode.removeChild(dv)
				self._rows--
				if (self._rows<self.cardinality.max) self._hideAddButton(false)
			}
		}).play()
	}
	
})