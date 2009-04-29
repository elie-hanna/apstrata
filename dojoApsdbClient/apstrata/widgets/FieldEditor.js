dojo.provide("apstrata.widgets.FieldEditor");

dojo.require("dijit._Templated");
dojo.require("dijit.layout.ContentPane"); 
dojo.require("dijit.form.Button"); 
dojo.require("dijit.form.ValidationTextBox"); 
dojo.require("dijit.form.ComboBox"); 
dojo.require("dijit.form.CheckBox"); 

dojo.declare("apstrata.widgets.FieldEditor",
	[dijit._Widget, dijit._Templated],
	{
		rowName: "r1",
		templateString: null,
		templatePath: dojo.moduleUrl("apstrata.widgets", "templates/FieldEditor.html"),
		postCreate: function(){
			this.connect(this.fieldType,"onchange","onChange");
			this.connect(this.removeIcon, "onclick", "removeField");
		},
		
		startup: function(){
			this.inherited(arguments);
		},
		 
		onChange: function() {
			if (this.fieldType.value=='List') {
				this.listOptions.style.display = "";
			} else {
				this.listOptions.style.display = "none";
			}
		},
		 
		removeField: function() {
			console.log("remove:" + this.id);
			this.destroy();
		}
	});
