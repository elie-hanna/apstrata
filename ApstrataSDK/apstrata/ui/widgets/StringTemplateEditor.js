dojo.provide('apstrata.ui.widgets.StringTemplateEditor');

dojo.require("dojox.dtl._Templated")
dojo.require("dijit.form.TextBox")

dojo.declare("apstrata.ui.widgets.StringTemplateEditor", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templateString: "<div class='TemplateEditor'><div dojoAttachPoint='dvTemplate' class='template'></div><div dojoAttachPoint='dvInputs'></div></div>",
	
	template: "",
	
	postCreate: function() {
		var self = this

		this.templateArray = this.template.split("$")		
		
		this.valuesArray = []
		for (var i=0; i<this.templateArray.length-1; i++) {
			self.valuesArray.push("["+i+"]")	// install placeholders
		}

		this.createInputs()
		this.updateText()
	},
	
	createInputs: function() {
		var self = this
		
		this.inputs = []
		
		for(var i=0; i<this.valuesArray.length; i++) {
			var inpt = new dijit.form.TextBox({intermediateChanges: true})
				
			this.inputs[i] = inpt
			
			dojo.attr(inpt.textbox, "data-index", i)

			dojo.create("span", {innerHTML: i, "class":"inputLabel"}, self.dvInputs)
			dojo.place(inpt.domNode, self.dvInputs)

			dojo.create("br", null, self.dvInputs)
			
			// discover the selected input index
			dojo.connect(inpt, "onKeyPress", function(e) {
				self.targetInputIndex = dojo.attr(e.originalTarget, "data-index")
			})

			// on change event update the values array and the text
			dojo.connect(inpt, "onChange", function(v) {
				if (v=="") v = "["+self.targetInputIndex+"]"  // return the placeholder if v is empty
				self.valuesArray[self.targetInputIndex] = v
				self.updateText()
			})
		}
	},
	
	updateText: function() {
		var self = this
		var i = 0
		
		self.dvTemplate.innerHTML = ""
		dojo.forEach(this.templateArray, function(s) {
			self.dvTemplate.innerHTML = self.dvTemplate.innerHTML + s 
			if (i<self.valuesArray.length) self.dvTemplate.innerHTML = self.dvTemplate.innerHTML + "<span class='value'>" + self.valuesArray[i] + "</span>"
			i++
		})
	},
	
	get: function(name) {
		if (name=="value") {
			var v = []
			dojo.forEach(this.inputs, function(inpt) {
				v.push(dojo.attr(inpt, "value"))
			})
			
			return(v)
		}
	},
	
	set: function(name, v) {
		var self = this
		
		if (name=="value") {
			if (dojo.isArray(v)) {
				var i = 0
				dojo.forEach(this.inputs, function(inpt){
					if (i < v.length) {
						inpt.set("value", v[i])
						self.valuesArray[i] = v[i]
					}
					i++
				})
			}
		}
		
		this.updateText()
	}

})
