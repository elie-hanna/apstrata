dojo.provide("apstrata.widgets.PropertyEditor");

dojo.require("dijit._Templated");
/*
dojo.require("dijit.layout.ContentPane"); 
dojo.require("dijit.form.Button"); 
dojo.require("dijit.form.ValidationTextBox"); 
dojo.require("dijit.form.ComboBox"); 
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.FilteringSelect");
*/

dojo.declare("apstrata.widgets.PropertyEditor",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: false,
		label: "Property Name",
		valueType: 1,
		listOptions: "",
		value: "",
		templatePath: dojo.moduleUrl("apstrata.widgets", "templates/PropertyEditor.html"),
		postCreate: function(){
//			this.connect(this.removeIcon, "onclick", "removeField");
		},
		
		startup: function(){
			this.inherited(arguments);
			var newField;
			
			switch(this.valueType)
			{	
				case 1:
					// newField = new dijit.form.ValidationTextBox();
					newField = "<input type='text' dojoAttachPoint='fieldValue' class='propertyValue' value='"+this.value+"'/>"
					break;
				case 2:
					// newField = new dijit.form.CheckBox(); 
					newField = "<input type='checkbox' dojoAttachPoint='fieldValue' class='propertyValue' />"
					break;
				case 3:
//					console.dir(this);
					var optionsTags = "";
					
					dojo.forEach(eval(this.listOptions),
						function(option) {
							optionsTags = optionsTags + "<option value='"+option[0]+"'>" + option[1] + "</option>";
						});

					newField = "<select dojoAttachPoint='fieldValue'>"+optionsTags+"</select>";
					break;
			}
			this.valueContainer.innerHTML = newField;
			this.labelContainer.innerHTML = this.label;
		},
		
		postMixInProperties: function() {
			this.inherited(arguments);
		}
	});
