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
	bindFormData: null,
	connection: null,
	additionalData: null,
	scriptName: null,
	additionalFields: null,
	successMessageDiv: null,
	errorMessageDiv: null,
	store: null,
	customValidateForm: null,
	submitLabel: null,
	resetLabel: null,
	submitCallBack: null,
	errorCallBack: null,
	onErrorDoBlink: true,
	curtainContainer: null,
	containingPanel: null,
	
	constructor: function(attrs) {
		var self = this
		
		self._actions = {}
		if (attrs) {
			if (attrs.store) this.store = attrs.store;
			if (attrs.actions) this.actions = attrs.actions;
			if (attrs.bindForm) this.bindForm = attrs.bindForm;
			if (attrs.bindFormData) this.bindFormData = attrs.bindFormData;
			if (attrs.scriptName) this.scriptName = attrs.scriptName;
			if (attrs.additionalData) this.additionalData = attrs.additionalData;
			if (attrs.additionalFields) this.additionalFields = attrs.additionalFields;
			if (attrs.curtainContainer) this.curtainContainer = attrs.curtainContainer;
			if (attrs.containingPanel) this.containingPanel = attrs.containingPanel;
			
			if (attrs.successMessageDiv) {
				this.successMessageDiv = attrs.successMessageDiv 
				this.successMessageHTML = self._getDivInnerHTML(attrs.successMessageDiv)
			}
			
			if (attrs.errorMessageDiv) {
				this.errorMessageDiv = attrs.errorMessageDiv 
				this.errorMessageHTML = self._getDivInnerHTML(attrs.errorMessageDiv)
			}
			
			if (attrs.customValidateForm) this.customValidateForm = attrs.customValidateForm;
			if (attrs.submitCallBack) this.submitCallBack = attrs.submitCallBack;
			if (attrs.errorCallBack) this.errorCallBack = attrs.errorCallBack;
			if (attrs.submitLabel) this.submitLabel = attrs.submitLabel;
			if (attrs.resetLabel) this.resetLabel = attrs.resetLabel;
			if (attrs.onErrorDoBlink) this.onErrorDoBlink = attrs.onErrorDoBlink;

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

		// Set the containing node of the posting curtain to the one in the settings or the form if it is not set.
		var curtainContainer = null;
		if (self.curtainContainer) {
			curtainContainer = self.curtainContainer.domNode;
		} else {
			curtainContainer = self.bindForm.domNode;
		}
		this._curtain = new apstrata.widgets.Curtain({container: curtainContainer});

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
						if(self.resetLabel) label = self.resetLabel;
						else label = "Reset";
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
		
		if (this.bindFormData) {
			var prop = null
			for (prop in this.bindFormData) {
				if (prop in this.bindForm.domNode) {
					var field = this.bindForm.domNode[prop];
					if (field.length > 1) {
						// FIXME This does not work because Dojo does not take the value of the
						// radio/checkbox field even if it is set to "checked". We need to set the
						// value of the Dojo widget instead of the domNode field itself.
						for (var i=0; i<field.length; i++) {
							if (field[i].type == 'radio' || field[i].type == 'checkbox') {
								if (field[i].value == this.bindFormData[prop]) {
									field[i].checked = "checked";
								}
							}
						}
					} else {
						field.value = this.bindFormData[prop];
					}
				}
			}
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
		var self = this;
		if (!self.onErrorDoBlink) return; 
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
						else self.bindForm.domNode.innerHTML = "<h1>Successful submission</h1>";
						if (self.submitCallBack) self.submitCallBack(self.bindForm, self.bindFormData, operation);
					} else {
						if (self.errorCallBack) self.errorCallBack(self.bindForm, self.bindFormData, operation);
						else self.showMessage(self.errorMessageHTML);
						if (self.submitCallBack) self.submitCallBack(self.bindForm, self.bindFormData, operation);						
					}
				},
				error: function(operation) {
					if (self.errorCallBack) self.errorCallBack(self.bindForm, self.bindFormData, operation);
					else self.showMessage(self.errorMessageHTML);
					if (self.submitCallBack) self.submitCallBack(self.bindForm, self.bindFormData, operation);					
				}
			}
		} else {
			request.apsdb = {
				store: self.store
			}
			
			var attrs = {
				action: "SaveDocument",
				useHttpMethod: "POST",
				request: request,
				formNode: self.bindForm.domNode,
				load: function(operation) {
					self._undimForm()
					if (self.successMessageHTML) self.bindForm.domNode.innerHTML = self.successMessageHTML;
					else self.bindForm.domNode.innerHTML = "<h1>Successful submission</h1>";
					if (self.submitCallBack) self.submitCallBack(self.bindForm, self.bindFormData, operation);
				},
				error: function(operation) {
					if (self.errorCallBack) self.errorCallBack(self.bindForm, self.bindFormData, operation);
					else self.showMessage(self.errorMessageHTML);
					if (self.submitCallBack) self.submitCallBack(self.bindForm, self.bindFormData, operation);					
				}
			}
		}
		this.client.call(attrs)
	},
	
	_reset: function() {
		if (this.bindForm) this.bindForm.reset()
	}
})

