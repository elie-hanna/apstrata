dojo.provide("apstrata.widgets.forms.FieldSet")

dojo.require("dijit.form.ValidationTextBox")
dojo.require("dijit.form.SimpleTextarea")
dojo.require("dijit.form.ComboBox")
dojo.require("dijit.form.Button")

dojo.declare("apstrata.widgets.forms.FieldSet", 
[dijit._Widget, dojox.dtl._Templated], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.widgets.forms", "templates/FieldSet.html"),
	
	_fieldSet: [],
	label: "",
	
	constructor: function(options) {
		this.fieldset = options.fieldset
		this._type = options.type
	},
	
	postCreate: function(options) {
		var self = this
		
		dojo.forEach(this.fieldset, function(definition) {
			var field 			
			
			attr = {
				name: definition.name
			}

			if (definition.type) {
				switch (definition.type) {
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
						
					case "subform":
						field = new apstrata.widgets.forms.FieldSet(definition)
					
						break;
									
					default:
						field = new dijit.form.TextBox(attr)
						break;
				}
			} else {
				field = new dijit.form.TextBox(attr)
			}
			
			dojo.place(dojo.create("div", {innerHTML: definition.name}), self.domNode)
			dojo.place(field.domNode, self.domNode)
		})
		
		if (this._type == "subform") {
			var button = new dijit.form.Button({label: "+"})
			dojo.place(button.domNode, self.domNode)
		}
	}
	
})