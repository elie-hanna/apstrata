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
dojo.provide("apstrata.ui.forms.FieldSet")

dojo.require("dijit.form.ValidationTextBox")
dojo.require("dijit.form.SimpleTextarea")
dojo.require("dijit.form.CheckBox")
dojo.require("dijit.form.DateTextBox")
dojo.require("dijit.form.ComboBox")
dojo.require("dijit.form.FilteringSelect")

dojo.require("dijit.form.Button")

dojo.require("dojo.store.Memory")
dojo.require("dojo.data.ObjectStore")

dojo.declare("apstrata.ui.forms.FieldSet", 
[dijit._Widget, dojox.dtl._Templated], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.ui.forms", "templates/FieldSet.html"),
	
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
		this._fields = {}
		
		if (options.cardinality) {
			this.cardinality = options.cardinality
			
			if (!options.cardinality.min) this.cardinality.min = 0 // minimum cardinality is 1
			if (options.cardinality.max < options.cardinality.min) this.cardinality.max = this.cardinality.min 
		} else this.cardinality = {min:1, max:2}
		
		this.name = options.name
		
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
	
	postCreate: function() {
		var self = this
		
		// add class dynamically based on the fieldset name
		dojo.addClass(this.domNode, this.name)
		this.inherited(arguments)
	},

	generate: function(autoWidth) {
		this._disableAnimation = true
		this._width = dojo.marginBox(this.domNode).w
		if (!autoWidth) autoWidth="100%"
		
		// If this fieldset is to be represented as a row, let's add a header for labels
		if (this.style == this._ROW) this._addHeaderRow(autoWidth)
		
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
		for (var i=0; i<startRows; i++) this._addSet(i, false, autoWidth)

		// Add the bottom disabled row used as a place holder
		if (this.style == this._ROW) this._addSet(0, true, autoWidth)
		this._disableAnimation = false
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
	_addHeaderRow: function(autoWidth) {
		var self = this
		
		// only if there are more than 1 columns
		if (this.fieldset.length>1) {
			var dv = dojo.create("div")
			dojo.addClass(dv, "headerRow")
			dojo.place(dv, this.dvFields)
	
			dojo.forEach(this.fieldset, function(definition) {
				var label = dojo.create("div", {innerHTML: definition.label?definition.label:definition.name}) 
				dojo.addClass(label, "label")
				if (definition.cssClass) dojo.addClass(label, definition.cssClass + "-label")
				if (self.formGenerator.autoWidth) dojo.style(label, "width", autoWidth)
				dojo.place(label, dv)
			})
		}
	},
	
	/**
	 * 
	 * @param {integer} rowNumber	serial number of the row
	 * @param {true} bottomRow		true if this is the placeholder bottom row
	 */
	_addSet: function(rowNumber, bottomRow, autoWidth) {
		var self = this
		var dv, dvFields, dvActions
		
		if (this.type == this._SUBFORM) 
			if (!bottomRow)
			 if (rowNumber>=(this.cardinality.max-1)) this._hideAddButton(true)
		
		if (bottomRow) {
			dv = this.dvActions
		} else {
			this._rows++
			dv = dojo.create("div")
			dojo.place(dv, this.dvFields)
		}		
		
		dojo.addClass(dv, "set")
		dojo.addClass(dv, this.style)
		
		if (!bottomRow) {
			self._animationInProgress = true
			
			if (!this._disableAnimation) {
				dojo.style(dv, "opacity", "0")
				dojo.animateProperty({
					node: dv,
					duration: 500,
					properties: {
						opacity: 1
					},
					onEnd: function(){
						self._animationInProgress = false
					}
				}).play()
			}
		}

		
		dojo.forEach(self.fieldset, function(definition) {
			var field
			if (self.formGenerator.shouldDisplay(definition.displayGroup)) {
				field = self._addField(dv, definition) 	
				if (bottomRow) field.set("disabled", "disabled")
			}
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
							self._addSet(self._rows, false, autoWidth)
						}
					})
					dojo.place(self._addButton.domNode, dv)
				}
			}
		}
	},

	_addField: function(dv, definition) {
		var self = this
		var attr = {}
		var label
				
		var labelCss = ""
		
		if (definition.type == self._SUBFORM) {
			labelCss = "setLabel"
		} else {
			labelCss = "label"
		}
				
		// If this is not a tabular format add a label before each field
		if ((self.style == self._FORM) && (definition.type != "hidden")) {
			if (definition.label != undefined) { // if definition has a label
				if (definition.label!="") { // and it's not empty
					// show label
					label = dojo.create("div", {innerHTML: definition.label + (definition.required?"*":"")}) 
					dojo.addClass(label, labelCss)
				}
			} else {
				// if label hasn't been set show name as label
				label = dojo.create("div", {innerHTML: definition.name + (definition.required?"*":"")}) 
				dojo.addClass(label, labelCss)
			}
		}


		// places the label before the dijit in the dom
		var inlineLabel = true
		
		if (definition.type == self._SUBFORM) {
			definition.formGenerator = self.formGenerator
			var fieldset = new apstrata.ui.forms.FieldSet(definition)
			if (definition.cssClass) dojo.addClass(fieldset.domNode, definition.cssClass)

			if (label) dojo.place(label, dv)
			dojo.place(fieldset.domNode, dv)
			this._fields[definition.name] = fieldset
			
			fieldset.generate()
			return fieldset
			//if (bottomRow) fieldset.set("disabled", "disabled")

		} else {
			var field

			// copy attributes from definition into attr
			for (k in definition) {
				if ((k!="name") || (k!="type") || (k!="widget")) {
					attr[k] = definition[k]
				}
			}

			if (definition.widget) {
				switch (definition.widget) {
					case "apstrata.ui.forms.FormGenerator.ComboBox":
						if (definition["formGenerator-options"]) {
							var choices = []
							dojo.forEach(definition["formGenerator-options"], function(option) {
								// check if choices contains object in the form {name, id}
								if (option.id) {
									choices.push(option)
								}else {
									choices.push({name: option, id: option});
								}
							})
							dojo.mixin(attr, {
					            value: choices[0].id,
					            store: new  dojo.data.ObjectStore({objectStore: new dojo.store.Memory({data: choices})}),
					        })			
						}				
						
						break;
										
					case "dijit.form.FilteringSelect":
					case "dijit.form.ComboBox": 
	
						if (definition["formGenerator-options"]) {
							var choices = []
							dojo.forEach(definition["formGenerator-options"], function(option) {
								// check if choices contains object in the form {name, id}
								if (option.id) {
									choices.push(option)
								}else {
									choices.push({name: option, id: option});
								}
							})
							dojo.mixin(attr, {
					            value: choices[0].id,
					            store: new  dojo.data.ObjectStore({objectStore: new dojo.store.Memory({data: choices})}),
					        })			
						}				
						
						break;
				}

				field = new dojo.getObject(definition.widget)(attr)
			} else {
				var defaultWidget = dijit.form.ValidationTextBox
			
				if (definition.type == "hidden") attr.type="hidden"
				if (definition.type == "password") attr.type="password"
				if (definition.required) attr.required="true"
				
				if (definition.type == "boolean") {
					defaultWidget = dijit.form.CheckBox
					inlineLabel = false
				}
				if (definition.type == "dateTime") defaultWidget = dijit.form.DateTextBox
				
				if (definition.attrs) dojo.mixin(attr, definition.attrs)
			
				if (attr.name) attr.name = attr.name.replace(/\./g, "!")

			
				field = new defaultWidget(attr)
				
				// specific handling for checboxes
				if (definition.type == "boolean" && definition.required) {
					
					// We define a validate function that will be call upon form submission					
					field.validate = function(value, constraints) {
						
						// If the field is not checked and it 
						if (!field.get("checked")) {
							
							// Get the initial color of the label appended to the checkbox							
							var initialLabelColor = dojo.style(field.domNode.nextElementSibling, "color");
							
							// Modify the color of the label to red
							dojo.style(field.domNode.nextElementSibling, {"color": "red"});
							
							// Create an ad-hoc tooltip to display before the checkbox 
							var tooltip = new dijit.Tooltip({connectId: field.domNode, position:"before", label:"This field is required"});
							
							// Connect to the onchange event so we can revert the color of the label back to it's original value	
							dojo.connect(field, "onChange", function() {
								dojo.style(field.domNode.nextElementSibling, {"color": initialLabelColor});
							})													
						};
						
						return field.get("checked");
					}
					
					field.isValid = function() {
						return field.validate();
					}
				}
				
				
				this._fields[definition.name] = field
				
				// This is useful for multi value fields
				if (this.formGenerator._fields[definition.name]) {
					// If the map already has an array
					if (dojo.isArray(this.formGenerator._fields[definition.name])) {
						// just add this new field to it
						this.formGenerator._fields[definition.name].push(field)
					} else {
						// We've added this field name before, so let's make it an array
						var f = this.formGenerator._fields[definition.name]
						
						// Create an array and push the 2 fields in it
						this.formGenerator._fields[definition.name] = [f, field]
					}
				}
				this.formGenerator._fields[definition.name] = field
			}

			
			if (inlineLabel) {
				if (label) dojo.place(label, dv)
	
				dojo.place(field.domNode, dv)
				
				// if a custom class has been set in the field definition
				if (definition.cssClass) {
					// add it to the label with the suffix -label
					dojo.addClass(label, definition.cssClass+"-label")
					// add it to the field
					dojo.addClass(field.domNode, definition.cssClass)
				}
			} else {
				var div = dojo.create("div")
				dojo.addClass(div, "inlineLabel")
				dojo.place(div, dv)
				
				dojo.place(field.domNode, div)
				if (definition.cssClass) dojo.addClass(field.domNode, definition.cssClass)
				
				if (label) dojo.place(label, div)
				dojo.style(label, "display", "inline-block")
			}
			
			// Hide hidden fields
			if (definition.type=="hidden") dojo.style(field.domNode, "display", "none")
			
			if (label) dojo.addClass(label, definition.name+"-label")
			dojo.addClass(field.domNode, definition.name)
						
			return field
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
	},
	
	//
	// Public methods
	//
	getFieldByName: function(name) {
		return this._fields(name)
	}
	
})