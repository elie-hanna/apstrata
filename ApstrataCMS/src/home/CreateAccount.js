dojo.provide("apstrata.home.CreateAccount")

dojo.require("dijit.form.ComboBox");

dojo.require("apstrata.ui.forms.FormGenerator")

/**
 * 
 * @param {Object} attrs
 */
dojo.declare("apstrata.home.CreateAccount", 
[apstrata.horizon.Panel], 
{

	constructor: function(options) {
		var self = this;

		/*this.store = new apstrata.AdminStore({
			connection: self.container.connection
		})*/
				
		self.options = options;
	},

	/**
	 * Provides rendering of code viewer
	 * @function
	 */
	postCreate: function(){
		var self = this

		//dojo.addClass(this.domNode, "AdminForm")
		//dojo.addClass(this.domNode, this.options.cssClass)
	
		this._xhrLoad = dojo.xhrGet({
			url: this.options.definitionPath.uri,
			handleAs: "text",
			timeout: 5000
		})
		
		this._xhrLoad.then(function(definition) {
			var newDefinition = dojo.fromJson(definition)
			
			self._form = new apstrata.ui.forms.FormGenerator(
				dojo.mixin(self.options, 
					{
						definition: newDefinition, 
						displayGroups: self.options.displayGroup, 
						label: self.options.label,
						save: self._save		
					})
			)
			dojo.place(self._form.domNode, self.dvContent)
			self.reload()
		})
		
		this.inherited(arguments)		
	},
	
	reload: function() {
		
	},
	
	_onButtonClick: function(event){
		alert("clicked");
	},
	
	_save: function(values, formGenerator){
		alert("saved");
	}
	
})