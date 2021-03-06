dojo.provide("apstrata.ui.forms.FileField")

dojo.require("dojox.dtl._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dojox.form.FileInput");
dojo.require("apstrata.sdk.TokenConnection");


dojo.declare("apstrata.ui.forms.FileField", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templatePath: dojo.moduleUrl("apstrata.ui.forms", "templates/FileField.html"),
	widgetsInTemplate: true,
	
	displayImage: false,
	
	value: "",
	
	missingMessage: "This field is required (remove it with \"-\" if you need to leave it empty)",
	
	invalidMessage: "Invalid value",
	
	browseLabel: null,
	
	isValid : true,

	regExp: null,
	/*
	 * This creates an instance of a FileField. A FielField can be used to upload a file to an apstrata document
	 * or to dislay a file (as a link or an image if it is an image) if it is already attached to a document. 
	 * @param formGenerator: this has to be set by the FieldSet instance, not the definition. Will be used to retrieve the field
	 * containing the value of "apsdb.documentKey"
	 * @param attr.name: string, the name of the field
	 * @param attr.store: string, the name of the store from where to retrieve the attached file if already attached
	 * @param attr.displayImage: boolean, (optional) if true and if mode is "rw", will display the image file in the form. 
	 * Otherwise, will display a link to the file
	 * @param attr.dimension: object (w, h), (optional) if specified and if displayImage is true, used to determine the dimensions used to display the image
	 * @param attr.connection: (optional) apstrata.sdk.Connection/TokenConnection object 
	 * @param attr.value: (optional) if set to the name of a file, indicates that a file is attached to the document (and will be displayed as an image or link)
	 * If not specified, the FileField instance will retrieve it from the form generator once it is ready, if it exists
	 * @param attr.readonly: (optional) set to true if you want to prevent to modify/remove the attached file (if it exists)
	 * @param attr.group: (optional) the MultipleFileField instance that contains this FileField
	 * @param attr.showFieldName: (optional) in certain cases, you need to allow the end user to choose the name of the field 
	 * that will be used to attach the file. In that case, you need to pass this parameter and set its value to 'true'. When the
	 * constructor is called by a MultipleFileField instance, the latter instance will take care of passing this attribute or not.
	 * Note that your document needs to be based on a schema for this to work. The FileField will not verify the existance of a schema.
	 * @param attr.showRemoveFieldBtn: (optional boolean) In some cases, you still want to be able to remove the file field or the widget without it being part of a MultipleFileField. 
	 * This parameter is ignored in case the file field is part of a MultipleFileField
	 */	
	constructor: function(attr) {
		
		dojo.mixin(this, attr);
		if (this.displayImage) {
			this.dimensions = this.dimensions ? this.dimensions : {w:100, h:100};
		};				
	},

	postCreate: function() {
		
		var self = this;		
		dojo.addClass(this.dvNode, "field");
		
		if (this.formGenerator) {
			
			// Register to the ready event in the formGenerator so we can retrive the apsdb.documentKey value later on,
			// as well as the value of the attached file (the name of the image file)
			// We need to hitch to this as _getReady will be called from the FormGenerator
			this.formGenerator.ready(dojo.hitch(this, this._getReady));
		};		
				
		this.inherited(arguments);
	},	
	
	getAttachedFileWidget: function() {
		return this.attachedFile;
	},
	
	//Validate attachment in case widget is focused
	onFocus: function() {
		if(dojo.isFunction(this.validate)) {
			this.validate(this.value);
		}
		if(this.isValid) {
			this.hideStateError();
		} else {
			this.displayStateError();
		}
	},
	
	//Close tooltip when user moves out of FileField.js
	onBlur: function() {
		if(this.tooltip) {
			this.tooltip.close();
		}
		if(!this.isValid) {
			this.displayStateError();
		} else {
			this.hideStateError();
		}
	},
	
	displayStateError: function() {
		dojo.style(this.errorState, "display", "")
	},
	
	hideStateError: function() {
		dojo.style(this.errorState, "display", "none")
	},
	
	/*
	 * This function is called upon validation
	 */
	focus: function() {
		dijit.focus(this.domNode);
	},	
	
	set:function(name, value) {
		
		if (name == "disabled") {
			this.disabled = "disabled";			
		}
		
		this.inherited(arguments);
	},
	
	/*
	 * If the user clicks on "-" : hide the image (or the link to the file) and the "-" button
	 * and show the 'browse file' input (FileInput), depending on the value of the showBrowse parameter.
	 * Additionnally, add an invisible text input of which name = myFieldName.apsdb.delete and value = the file to remove 
	 */	
	toggleRemoveAndUploadFile: function(self, showFile, showBrowse) {
		
		var displayMode = showFile ? "inline" : "none";
		
		//Remove the class set when displaying attached file or its link
		dojo.removeClass(this.domNode, "attached-file");
		
		if (self.displayImage) {
			dojo.style(self.fileImage, "display", displayMode);
		}else {
			dojo.style(self.fileLink, "display", displayMode);			
		}
		
		if (!showFile && self.value) {
			
			// we need to inform apstrata about the name of the file that needs to be removed.
			// so we add it inside an invisible text input
			var fileToRemove = dojo.place("<input name='" + this.name + ".apsdb.delete' type='text' value='" + self.value + "'/>", self.domNode.parentNode);
			dojo.style(fileToRemove, "display", "none");
		}
		
		dojo.style(self.removeFileDiv, "display", displayMode);
		dojo.destroy(this.removeFile.domNode);
		
		if (showBrowse) {
		
			// show the browse file element 
			self._addAttachmentNode();	
		}else {						
			
			// hide the browse file element
			self._removeAttachmentNode();		
		}
	},
	
	
	/*
	 * Add FileInput field and corresponding logic to the form
	 * in order to provide the ability to upload a file
	 */
	_addAttachmentNode: function() {				
		
		var self = this;
		var fiedName = "";
		
		if(typeof this.name === "undefined" || this.name==null ){
			fiedName = "apsdb_attachments";
		} else{
			fiedName = this.name;
		}
		
		var params = {
				name: fiedName, 
			    required: true 
		};
		
		if(this.browseLabel) {
			params.label = this.browseLabel;
		}
		this.attachedFile = new dojox.form.FileInput(params);
		
		// do not allow direct manual editing of the fake file input field 
		this.attachedFile.inputNode.readOnly = true;
		
		this.attachedFile._matchValue = function(){
			// summary: set the content of the upper input based on the semi-hidden file input
			var tmpValue = self.attachedFile.fileInput.value;
			if(tmpValue.lastIndexOf('\\') != -1) {
				self.attachedFile.inputNode.value = tmpValue.substring(tmpValue.lastIndexOf('\\') + 1, tmpValue.length);
			} else {
				self.attachedFile.inputNode.value = tmpValue;
			}

			if(self.attachedFile.inputNode.value){
				self.attachedFile.cancelNode.style.visibility = "visible";
				dojo.fadeIn({ node: self.attachedFile.cancelNode, duration:275 }).play();
			}
			self.validate();
		}
		
		//  Overriding the the reset button of the fileInput widget, to have validate
		//  run at the end of it. We don't connect to it  since the connect event will run
		// before the input is emptied by the reset
		this.attachedFile.reset = function() {
			// summary: on click of cancel button, since we can't clear the input because of
			// 	security reasons, we destroy it, and add a new one in it's place.
			self.attachedFile.disconnect(self.attachedFile._listener);
			self.attachedFile.disconnect(self.attachedFile._keyListener);
			if(self.attachedFile.fileInput){
				self.attachedFile.domNode.removeChild(self.attachedFile.fileInput);
			}
			dojo.fadeOut({ node: self.attachedFile.cancelNode, duration:275 }).play();

			// should we use cloneNode()? can we?
			self.attachedFile.fileInput = document.createElement('input');
			// dojo.attr(this.fileInput,{
			//	"type":"file", "id":this.id, "name": this.name
			//});
			self.attachedFile.fileInput.setAttribute("type","file");
			self.attachedFile.fileInput.setAttribute("id", self.attachedFile.id);
			self.attachedFile.fileInput.setAttribute("name", self.attachedFile.name);
			dojo.addClass(self.attachedFile.fileInput,"dijitFileInputReal");
			self.attachedFile.domNode.appendChild(self.attachedFile.fileInput);

			self.attachedFile._keyListener = self.attachedFile.connect(self.attachedFile.fileInput, "onkeyup", "_matchValue");
			self.attachedFile._listener = self.attachedFile.connect(self.attachedFile.fileInput, "onchange", "_matchValue");
			self.attachedFile.inputNode.value = "";
			self.validate();
		};
	
		// Add a custom validator to make this field required (otherwise, submitting an empty input
		// will be interpreted by apstrata as an instruction to remove all attached files
		this.validate = function(value, constraints) {
			self.isValid = true;	
			if(self.tooltip) { //Close tooltip if opened
				  self.tooltip.close();
			}
			self.hideStateError();
			if (self.attachedFile) {	
				var isValid = dojo.isIE ? self.attachedFile.fileInput.value && self.attachedFile.fileInput.value.length > 0 : self.attachedFile.fileInput.files.length > 0;
				if (!isValid) {
					// Create an ad-hoc tooltip  
					self.tooltip = new dijit.Tooltip({connectId: self.focusNode, position:"before", label: self.missingMessage});
					self.tooltip.open(self.domNode);
					self.displayStateError();
					self.isValid = false;
				} else { //Check if file name matches the regexp in case defined
					if(this.regExp) {
					   isValid = new RegExp(this.regExp, "i").test(self.attachedFile.fileInput.value);
					   if (!isValid) {
						   // Create an ad-hoc tooltip  
						   self.tooltip = new dijit.Tooltip({connectId: self.focusNode, position:"left", label: self.invalidMessage});
						   self.tooltip.open(self.domNode);
						   self.displayStateError();
						   self.isValid = false;
					   }
					}
				}
				return isValid;
			}
			
			return true;
		}
				
		//Startup the fileInput widget to set the listeners and display cancel button
		this.attachedFile.startup();
		
		// Add the FileInput to the dom	
		dojo.place(this.attachedFile.domNode, this.dvNode, "last");		
		
		// If the form definition is asking to give the user the possibility to choose the name of the file attachment field,
		// we need to make the corresponding input field visible on the form. We also connect to changes on that field in order
		// to update the name of the fileInput field. 
		// Note that this will work only if the concerned document has a schema. The FiledField instance is not responsible for
		// verifying the availability of a schema.
		if (this.showFieldName) {
			
			dojo.style(this.filefieldLabel, "display", "inline");
			dojo.style(this.filefieldName, "display", "inline");
			
			// set the initial value of the fieldName to the one that is currently associated to the fileInput
			this.filefieldName.value = this.attachedFile.fileInput.name;
			
			// connect to any changes on the fieldName so they are reflected on the fileInput
			dojo.connect(this.filefieldName, "onchange", function() {
				self.attachedFile.fileInput.name = self.filefieldName.value; 
			})
		}		
			
		if(this.group || (this.showRemoveFieldBtn && this.showRemoveFieldBtn == true)) { //If instance created by a MultipleFileField or it is explicitly specified, show the '-' button
			this._displayRemoveButton();
		}	
				
		// When clicking the "-" button, remove the
		// element that is used to select a file 
		dojo.connect(this.removeFile, "onClick", function(event){
			if (self.group) {
				var event = {action: "remove", target: self};
				self.group.handleChildEvent(event);
			}
			self._removeAttachmentNode();								
		});
	},
	
	/*
	 * Removes the nodes (FileInput) that allows to upload a file as well as the adjacent "-" button
	 */
	_removeAttachmentNode: function() {
				
		var self = this;
		if (this.tooltip) {
			this.tooltip.close();
		}
		
		if (!this.group) {				
							
			if (this.removeFile) {
				this.removeFile.destroy();
				delete this.removeFile;
			}
			
			if (this.attachedFile) {
				this.attachedFile.destroyRecursive();
				delete this.attachedFile;
			}
		
			dojo.empty(this.dvNode);
				
			dojo.style(this.showNode.domNode, "display", "inline");
			if (!this.showNodeConnector) {	
					
				this.showNodeConnector = dojo.connect(this.showNode, "onClick", function() {
					
					self._displayAttachedFile();
					dojo.style(self.showNode.domNode, "display", "none");
					//self.startup();
				})
			}
		}else {
			
			dojo.destroy(this.domNode);
		}	
	},
		
	/*
	 * If the call requested to display the attached file as an image, the function will retrieve the url 
	 * of the file and pass it to the src attribute of the img element (see template).
	 * Otherwise, the function will retrieve the url of the file and pass it to the href attribute of the
	 * link element (see template).
	 * This function will be called by _getReady() that is a listener on the formGenerator ready() function. 
	 * When this event is triggered, we are sure that this.value will contain the value retrieved from
	 * the document (if any) for that field (i.e. the name of the image file)
	 */
	_displayAttachedFile: function(isUser) {
		
		var self = this;
		if (this.value) {
			
			this._gotValue = true;
			
			dojo.addClass(this.domNode, "attached-file");
			
			if (this.showFieldName) {
				dojo.style(this.filefieldLabel, "display", "inline");
				dojo.style(this.filefieldName, "display", "inline");				
				this.filefieldName.value = this.name;
			}
			
			
			if (this.displayImage) {
				
				this.fileImage.width = this.dimensions.w;
				this.fileImage.height = this.dimensions.h;
				this.fileImage.src= this._getFilesUrls(isUser);
				dojo.style(this.fileImage, "display", "");
			}else {
				
				this.fileLink.href= this._getFilesUrls(isUser);
				this.fileLink.innerHTML = this.value;
				dojo.style(this.fileLink, "display", "");
			}
			
			if (!this.readonly) {				
				
				this._displayRemoveButton();
				
				// When clicking the "-" button:
				// - if the current instance was created by a MultipleFileField, delegate the handling
				// of the event to this latter.
				// - otherwise remove the element that is used to select a file 
				dojo.connect(this.removeFile, "onClick", function(event){
					if (self.group) {
						
						var event = {action: "remove", target: self};
						self.group.handleChildEvent(event);
					}else {
						
						self.toggleRemoveAndUploadFile(self, false, true);
					}					
				});
			}			
			
		}else {				
				this._addAttachmentNode();
		}
		
		if (this.disabled) {			
			if (this.attachedFile) {
				this.attachedFile.set("disabled", "disabled");
				this.attachedFile.fileInput.disabled = true;
			}
		}				
	},
	
	/*
	 * Add a "-" button next to the file on next to the input (browse file). 
	 */
	_displayRemoveButton: function() {
		
		this.removeFile = new dijit.form.Button( { label: '-'});
		dojo.place(this.removeFile.domNode, this.removeFileDiv, "last");
		dojo.style(this.removeFileDiv, "display", "inline");				
	},
	
	
	setName: function(aName) {
		this.name = aName;
		this.filefieldName.value = aName;
		this.attachedFile.fileInput.name = aName;
	},
	
	
	
	/*
	 * This function retrieves the url of the the file that is attached
	 * to the current field so it can be used to build a link or display an image
	 * in the current form
	 */
	_getFilesUrls: function(isUser) {				
			
		var params = {
			"apsdb.fileName" : this.value,
			"apsdb.fieldName" : this.name,
		};
		
		if (isUser && isUser == true) {
			if (apstrata.apConfig && apstrata.apConfig["signatureLegacyMode"] && apstrata.apConfig["signatureLegacyMode"] == "off") {
				params["apsdb.id"] = this.docKey;
			} else {
				params.login = this.docKey;
			}
			
		} else {
			params["apsdb.documentKey"] = this.docKey;
			params["apsdb.store"] = this.store;
		}
		
		var connection = this.connection;		
		if (!connection) {
			
			// try to get the current connection from the container of the formGenerator, otherwise. create a new connection
			connection = this.formGenerator.container.connection ? this.formGenerator.container.connection : new apstrata.sdk.Connection();
		}
		
		var url = connection.sign("GetFile", dojo.objectToQuery(params)).url;
		return url;	
	},	
		
	/*
	 * This function retrieves the value of the "aspdb.documentKey" field in the form generator
	 * (only if no docKey was specified initially in the definition). It also tries to display
	 * the image again in case the name of the file was not initially retrieved from the 
	 * value attribute in the form definition
	 */
	_getReady: function() {
		
		if (!this.docKey) { 
			
			var docKeyField = this.formGenerator.getField("apsdb.documentKey");
			if (!docKeyField) {
				//in case it is a user document
				docKeyField = this.formGenerator.getField("login");
				if (!docKeyField) {
					//in case it is a device document
					docKeyField = this.formGenerator.getField("id");
				}
			}
			this.docKey = docKeyField.get("value");
			
		};
		
		if (!this._gotValue) {		
			this._displayAttachedFile();
			this.startup();
		}
	},
	
	/*
	 * Tear Down Behavior of file field widget
	 */
	uninitialize: function(){
		if(this.tooltip) this.tooltip.close();
		return false;
	},
})