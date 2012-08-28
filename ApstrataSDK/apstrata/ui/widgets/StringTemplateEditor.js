dojo.provide('apstrata.ui.widgets.StringTemplateEditor');

dojo.require("dojox.dtl._Templated")
dojo.require("dijit.form.TextBox")

dojo.declare("apstrata.ui.widgets.StringTemplateEditor", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templateString: "<div class='TemplateEditor'><div dojoAttachPoint='dvTemplate' class='template'></div><div dojoAttachPoint='dvInputs'></div></div>",
	
	template: "",
	currentValue: "",
	postCreate: function() {
		var self = this

		this.templateArray = this.template.split(/\$\$.*?\$\$/)//the string without the editable areas		
		this.templates = this.template.match(/\$\$.*?\$\$/g);//the default text of the editable areas
		
		this.valuesArray = []
		if(this.templates != null){
			for (var i=0; i<this.templates.length; i++) {
				this.valuesArray.push(this.templates[i].substr(2, this.templates[i].length -4))	// install placeholders
			}
		}

		this.createInputs()
		this.updateText()
	},
	
	createInputs: function() {
		var self = this;
		
		this.inputs = [];
		
		for(var i=0; i<this.valuesArray.length; i++) {
			var inpt = new dijit.form.TextBox({intermediateChanges: true});
				
			this.inputs[i] = inpt;
			this.inputs[i].set('value', this.valuesArray[i]);
			this.inputs[i].set('style', 'display:none');
			dojo.addClass(inpt.domNode, "input-class");
			dojo.attr(inpt.textbox, "data-index", i);

			dojo.place(inpt.domNode, self.dvInputs);
			
			// discover the selected input index
			dojo.connect(inpt, "onKeyPress", function(e) {
				self.targetInputIndex = dojo.attr(e.target, "data-index");
			})

			// on change event update the values array and the text
			dojo.connect(inpt, "onChange", function(v) {
				if (v=="") v = self.targetInputIndex;  // return the placeholder if v is empty
				self.valuesArray[self.targetInputIndex] = v;
				self.updateText();
			})
		}
	},
	
	updateText: function() {
		var self = this
		var i = 0
		
		self.dvTemplate.innerHTML = ""
		self.currentValue = "";
		dojo.forEach(this.templateArray, function(s) {
			self.dvTemplate.innerHTML = self.dvTemplate.innerHTML + s 
			self.currentValue += s;
			if (i<self.valuesArray.length){
				self.currentValue += self.valuesArray[i];
				self.dvTemplate.innerHTML = self.dvTemplate.innerHTML + "<span class='value' onclick='dijit.byId(\""+self.id+"\").show("+i+")'>" + self.valuesArray[i] + "</span>"
			}
			i++
		})
	},
	
	show: function(element){
		for(var i in this.inputs){
			if(i == element){
				this.inputs[i].set('style', 'display:block');
			}else{
				this.inputs[i].set('style', 'display:none');
			}
		}
	},
	
	get: function(name) {
		if (name=="value") {
			return this.currentValue;
		}else{
			return inherited(arguments);
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
