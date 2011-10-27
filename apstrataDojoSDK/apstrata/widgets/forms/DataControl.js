dojo.provide('apstrata.widgets.forms.DataControl');

dojo.require('dijit.form.Button');
dojo.require('dojo.fx');

dojo.require('apstrata.widgets.EmbeddedAlert');
dojo.require('apstrata.widgets.Curtain');

dojo.declare("apstrata.widgets.forms.DataControl", 
[dijit._Widget, dijit._Templated], 
{
	templateString: "<div></div>",
	actions: '',
	bindForm: null,
	connection: null,
	additionalData: null,
	scriptName: null,
	additionalFields: null,
	successMessageDiv: null,
	errorMessageDiv: null,
	store: null,
	customValidateForm: null,
	submitLabel: null,
	
	constructor: function(attrs) {
		var self = this
		
		self._actions = {}
		if (attrs) {
			if (attrs.store) this.store = attrs.store;
			if (attrs.actions) this.actions = attrs.actions;
			if (attrs.bindForm) this.bindForm = attrs.bindForm;
			if (attrs.scriptName) this.scriptName = attrs.scriptName;
			if (attrs.additionalData) this.additionalData = attrs.additionalData;
			if (attrs.additionalFields) this.additionalFields = attrs.additionalFields;
			
			if (attrs.successMessageDiv) {
				this.successMessageDiv = attrs.successMessageDiv 
				this.successMessageHTML = self._getDivInnerHTML(attrs.successMessageDiv)
			}
			
			if (attrs.errorMessageDiv) {
				this.errorMessageDiv = attrs.errorMessageDiv 
				this.errorMessageHTML = self._getDivInnerHTML(attrs.errorMessageDiv)
			}
			
			if (attrs.customValidateForm) this.customValidateForm = attrs.customValidateForm;
			if (attrs.submitLabel) this.submitLabel = attrs.submitLabel;

			if (attrs.connection) {
				this.connection = attrs.connection

				this.client = new apstrata.Client({
					connection: attrs.connection,
					handleResult: function(operation) {
						self.handleResult(operation)
					},
					handleError: function(operation) {
						self.handleError(operation)
					}
				})
			}
		}
	},
	
	_getDivInnerHTML: function(node) {
		if (dojo.isString(node)) {
			return dojo.byId(node).innerHTML
		} else {
			return node.innerHTML
		}
	},
		
	handleResult: function(operation) {},
	handleError: function(operation) {},

	postCreate: function() {
		var self = this;

		this._curtain = new apstrata.widgets.Curtain({container: self.bindForm.domNode})

		if (this.actions) {
			var actions = self.actions.split(",")
			dojo.forEach(actions, function(action) {

				// create dynamically a new method to signal the firing of the event, if it's not a standard one
				if (!self[action]) self[action] = function() {}

				var label = action

				switch(action) {
					case "submit":
						if(self.submitLabel) label = self.submitLabel;
						else label = "Submit";
						break;
					case "reset":
						label = "Reset"
						break;
					default:
				}

		        var button = new dijit.form.Button({
		            label: label,
		            onClick: function() {
						
						// fire corresponding event
						self["_"+action]()
		            }
		        })
				
				self._actions[action] = button
				
				dojo.place(button.domNode, self.domNode)
			})
		}
	},
	
	
	_dimForm: function() {
		var self = this
		this._curtain.show()
		//dojo.style(this.bindForm.domNode, {opacity: .4})
	},
	
	_undimForm: function() {
		this._curtain.hide()
		//dojo.style(this.bindForm.domNode, {opacity: 1})
	},
	
	_disableInputs: function(disable) {
		dojo.query("input, button, textarea, select", this.bindForm.domNode).attr("disabled", disable);
	},
	
	showMessage: function(html) {
		var self = this
		new apstrata.widgets.EmbeddedAlert({container: self.bindForm.domNode, 
											width: 270, height: 170, 
											content: html, 
											actions: "close",
											onClose: function() {
												self._undimForm()
											}})
	},

	_flashNotValid: function() {
		var self = this
		var backgroundColor = dojo.style(self.bindForm.domNode, "backgroundColor")

		self._disableInputs(true)
		
		var alert = dojo.animateProperty({
			node: self.bindForm.domNode, 
			duration: 100,
			properties: {
				backgroundColor: { start: backgroundColor, end: "#AA1111" }
			}
		})
		 
		var revert = dojo.animateProperty({
			node: self.bindForm.domNode, 
			duration: 300,
			properties: {
				backgroundColor:   { start: "red", end: backgroundColor }
			}
		}) 
		
		dojo.fx.chain([alert, revert, alert, revert]).play()
		
		setTimeout(dojo.hitch(self, "_disableInputs", false), 1000)
	},

	_submit: function() {
		var self = this

		if (this.customValidateForm && this.customValidateForm(this.bindForm) == false) {
			this._flashNotValid()
			return			
		}
		
		if (!this.bindForm.isValid()) {
			this._flashNotValid()
			return
		} 
		
		if (!(this.bindForm && this.client)) return; 
		var request = {}
		
		var additionalFields = {}
		
		if (this.actions) {
			if (self.additionalFields) {
				var fields = self.additionalFields.split(",")
				dojo.forEach(fields, function(field) {
					additionalFields[field] = dojo.attr(dojo.byId(field), "value")
				})
			}
		}
		
		dojo.mixin(request, additionalFields)
		dojo.mixin(request, this.additionalData)

		self._dimForm()

		if (self.scriptName) {
			request.apsdb = {
				scriptName: self.scriptName
			}
			
			var attrs = {
				action: "RunScript",
				request: request,
				formNode: self.bindForm.domNode,
				useHttpMethod: "POST",
				load: function(operation) {
					if (operation.response.result.status == "success") {
						self._undimForm()
						
						if (self.successMessageHTML) self.bindForm.domNode.innerHTML = self.successMessageHTML;
						else self.bindForm.domNode.innerHTML = "<h1>Successful submission</h1>"
					} else {
						self.showMessage(self.errorMessageHTML)					
					}
				},
				error: function(operation) {
					self.showMessage(self.errorMessageHTML)					
				}
			}
		} else {
			request.apsdb = {
				store: self.store
			}
			
			var attrs = {
				action: "SaveDocument",
				request: request,
				formNode: self.bindForm.domNode,
				load: function(operation) {
					self._undimForm()
					if (self.successMessageHTML) self.bindForm.domNode.innerHTML = self.successMessageHTML;
					else self.bindForm.domNode.innerHTML = "<h1>Successful submission</h1>"
				},
				error: function(operation) {
					self.showMessage(self.errorMessageHTML)
				}
			}
		}
		this.client.call(attrs)
	},
	
	_reset: function() {
		if (this.bindForm) this.bindForm.reset()
	}
})
