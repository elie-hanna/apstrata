dojo.provide("apstrata.widgets.forms.DataControl")

dojo.require("dijit.form.Button")
dojo.require("dojo.fx")

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
	store: null,
	
	constructor: function(attrs) {
		var self = this
		
		self._actions = {}
		
		if (attrs) {
			if (attrs.store) this.store = attrs.store;
			if (attrs.actions) this.actions = attrs.actions;
			if (attrs.bindForm) this.bind = attrs.bindForm;
			if (attrs.scriptName) this.scriptName = attrs.scriptName;
			if (attrs.additionalData) this.bind = attrs.additionalData;
			if (attrs.additionalFields) this.bind = attrs.additionalFields;
			if (attrs.successMessageDiv) this.successMessageDiv = attrs.successMessageDiv 

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
	
	postCreate: function() {
		var self = this;

		if (this.actions) {
			var actions = self.actions.split(",")
			dojo.forEach(actions, function(action) {

				// create dynamically a new method to signal the firing of the event, if it's not a standard one
				if (!self[action]) self[action] = function() {}

				var label = action

				switch(action) {
					case "submit":
						label = "Submit"
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
						self[action]()
		            }
		        })
				
				self._actions[action] = button
				
				dojo.place(button.domNode, self.domNode)
			})
		}

	},
	
	
	handleResult: function(operation) {
		
	},
	
	handleError: function(operation) {
		var errMsg 
		if (operation.response.metadata.errorDetail=="") {
			errMsg = operation.response.metadata.errorCode
		} else {
			errMsg = operation.response.metadata.errorDetail
		}
		
		var msg = 'Oops, there seems to be a problem:<br><br><b>' + errMsg + '</b>'
		apstrata.alert(msg, self.domNode)
	},
	
	_dimForm: function() {
		var self = this

		dojo.style(self.bindForm.domNode, {opacity: .4})
		dojo.query('.field', self.bindForm.domNode).forEach(
		  function(inputElem){
		    inputElem.disabled = 'disabled';
		  }
		)
		
		

				
/*
				var w = dojo.position(contactUs.domNode)
				console.dir(w)
				dv = dojo.create("div", null, dojo.body())
				dojo.addClass(dv, "dimLayer")


				dojo.style(dv, {
					top: w.y + "px",
					left: w.x + "px",
					width: w.w + "px",
					height: w.h + "px"
				})

 */				
		
	},
	
	_undimForm: function() {
		var self = this

		dojo.style(self.bindForm.domNode, {opacity: 1})
		dojo.query('.field', self.bindForm.domNode).forEach(
		  function(inputElem){
			inputElem.removeAttribute("disabled")
		  }
		)
	},
	
	_getValue: function() {
		var value = {}

		dojo.query("input", this.bindForm.domNode).forEach(function(node) {
			var name = dojo.attr(node, "name")
			var nodeValue = dojo.attr(node, "value")
			var checked = dojo.attr(node, "checked")
			var type = dojo.attr(node, "type")
			
			if (type == 'text') {
				value[name] = nodeValue 
			} else if (type == 'checkbox') {
				if (checked) {
					if (!value[name]) value[name] = []
					value[name].push(nodeValue)
				}
			} else if (type == 'radio') {
				if (checked) value[name] = nodeValue
			}
		})

		dojo.query("select", this.bindForm.domNode).forEach(function(node) {
			value[dojo.attr(node, "name")] = dojo.attr(node, "value")			
		})

		dojo.query("textarea", this.bindForm.domNode).forEach(function(node) {
			value[dojo.attr(node, "name")] = dojo.attr(node, "value")
		})
		
		return value
	},
	
	_invalid: function() {
		
	},
	
	_disableInputs: function(disabled) {
		
		for (key in this._actions) {
			this._actions[key].setAttribute("disabled", disabled)
		}
	},

	submit: function() {
		var self = this

		if (!this.bindForm.isValid()) {
			var backgroundColor = dojo.style("contactUs", "backgroundColor")

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

		dojo.mixin(request, this.bindForm.getValues())
//		dojo.mixin(request, this._getValue())
		
		self._dimForm()

		if (self.scriptName) {
			request.apsdb = {
				scriptName: self.scriptName
			}
			
			var attrs = {
				action: "RunScript",
				request: request,
				load: function(operation) {
					self._undimForm()
					if (self.successMessageDiv) self.bindForm.domNode.innerHTML = dojo.byId(self.successMessageDiv).innerHTML;
					else self.bindForm.domNode.innerHTML = "<h1>Successful submission</h1>"
				},
				error: function(operation) {
					self._undimForm()
				}
			}
		} else {
			request.apsdb = {
				store: self.store
			}
			
			var attrs = {
				action: "SaveDocument",
				request: request,
				load: function(operation) {
					self._undimForm()
					if (self.successMessageDiv) self.bindForm.domNode.innerHTML = dojo.byId(self.successMessageDiv).innerHTML;
					else self.bindForm.domNode.innerHTML = "<h1>Successful submission</h1>"
				},
				error: function(operation) {
					self._undimForm()
				}
			}
		}


		this.client.call(attrs)
	},
	
	reset: function() {
		if (this.bindForm) this.bindForm.reset()
	}
})
