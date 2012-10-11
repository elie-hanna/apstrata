dojo.provide("apstrata.ui.forms.Textarea");

dojo.require("dijit.form.ValidationTextBox"); 
dojo.require("dijit.form.SimpleTextarea");

dojo.declare("apstrata.ui.forms.Textarea", 
[dijit._Widget, dojox.dtl._Templated, dijit.form.ValidationTextBox, dijit.form.SimpleTextarea],
{
	regExp: "[\\s\\S]*",
	counter: false,
	showMaxLength: true,
	
	// maybe add those of the simpletextarea: dijitTextArea (and those of the textarea -> resizable)
	//baseClass: "dijitTextBox dijitValidationTextBox",
	templateString: dojo.cache("apstrata.ui.forms", "templates/Textarea.html"),


	postCreate: function(){
		this.inherited(arguments);
		if(this.counter){
			this.counterDiv.style.display = "inline";
				
			if(this.showMaxLength) {
				var divMax = document.createElement('div');
				textMax = document.createTextNode(this.maxLength);
				divMax.appendChild(textMax);
				this.maxLengthDiv.appendChild(divMax);
			}
			var div = document.createElement('div');
			if (!this.currentLength.hasChildNodes()){
				currValue = this.textbox.value;
				if(this.helpTextVisible){
					text = document.createTextNode("0");
				}else{ 
					text = document.createTextNode(this.textbox.value.length);
				}
				div.appendChild(text);
				this.currentLength.appendChild(div);
			}
		}
	},
	
	_onInput: function(e){
		this.inherited(arguments);
		this.calculateCounter();
	},
	
	_setValueAttr: function(value){
		this.inherited(arguments);
		this.calculateCounter();
	},
	
	calculateCounter: function(){
		if (this.counter){
			while(this.currentLength.hasChildNodes()){
				if(this.currentLength.lastChild != null){
					this.currentLength.removeChild(this.currentLength.lastChild)
				}
			}
			var textBox = this.textbox.value.replace(/\r/g,'');
			
			var div = document.createElement('div');
			var text = document.createTextNode(textBox.length);
			div.appendChild(text);
			this.currentLength.appendChild(div);
		}
	}
	
})
		