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
	
	displayImage: false,
	
	value: "",

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
	
	/*
	 * This function is called upon validation
	 */
	focus: function() {
		
		this.domNode.focus();
	},
	
	/*
	 * If the user clicks on "-" : hide the image (or the link to the file) and the "-" button
	 * and show the 'browse file' input (FileInput), depending on the value of the showBrowse parameter.
	 * Additionnally, add an invisible text input of which name = myFieldName.apsdb.delete and value = the file to remove 
	 */	
	toggleRemoveAndUploadFile: function(self, showFile, showBrowse) {
		
		var displayMode = showFile ? "inline" : "none";
		
		if (self.displayImage) {
			dojo.style(self.fileImage, "display", displayMode);
		}else {
			dojo.style(self.fileLink, "display", displayMode);			
		}
		
		if (!showFile) {
			
			// we need to inform apstrata about the name of the file that needs to be removed.
			// so we add it inside an invisible text input
			var fileToRemove = dojo.place("<input name='" + this.name + ".apsdb.delete' type='text' value='" + self.value + "'/>", self.dvNode);
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
		this.attachedFile = new dojox.form.FileInput({name: this.name ? this.name : "apsdb_attachments" });
		
		// Add a custom validator to make this field required (otherwise, submitting an empty input
		// will be interpreted by apstrata as an instruction to remove all attached files
		this.validate = function(value, constraints) {
						
			if (self.attachedFile) {				
				var isValid = self.attachedFile.fileInput.files.length > 0;
				if (!isValid) {
										
					// Create an ad-hoc tooltip  
					var tooltip = new dijit.Tooltip({connectId: self.domNode, position:"before", label:"This field is required"});
				}
				
				return isValid;
			}
			
			return true;
		}		
			
		// Make the cancel button visible once a file is selected		
		dojo.connect(this.attachedFile.fileInput, "onchange", function() {			
				self.attachedFile.inputNode.value = self.attachedFile.fileInput.value;
				self.attachedFile.cancelNode.style.visibility = 'visible';			
		});	
			
		dojo.place(this.attachedFile.domNode, this.dvNode, "last");		
		
		if(this.group) { //If instance created by a MultipleFileField, show the '-' button
			this._displayRemoveButton();
		}	
		// When clicking the "-" button, remove the
		// element that is used to select a file 
		dojo.connect(this.removeFile, "onClick", function(event){
			
			self._removeAttachmentNode();								
		});
	},
	
	/*
	 * Removes the nodes (FileInput) that allows to upload a file as well as the adjacent "-" button
	 */
	_removeAttachmentNode: function() {
		
		dojo.destroy(this.domNode);	
	},
		
	/*
	 * If the call requested to display the attached file as an image, the function will retrieve the url 
	 * of the file and pass it to the src attribute of the img element (see template).
	 * Otherwise, the function will retrieve the url of the file and pass it to the href attribute of the
	 * link element (see template).
	 * This function will be called by _getReady() that is a listener on the formGenerator ready() function. 
	 * When this eventis triggered, we are sure that this.value will contain the value retrieved from
	 * the document (if any) for that field (i.e. the name of the image file)
	 */
	_displayAttachedFile: function() {
		
		var self = this;
		if (this.value) {
			
			this._gotValue = true;
			if (this.displayImage) {
				
				this.fileImage.width = this.dimensions.w;
				this.fileImage.height = this.dimensions.h;
				this.fileImage.src= this._getFilesUrls();
			}else {
				
				this.fileLink.href= this._getFilesUrls();
				this.fileLink.innerHTML = this.value;
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
	},
	
	/*
	 * Add a "-" button next to the file on next to the input (browse file). 
	 */
	_displayRemoveButton: function() {
		
		this.removeFile = new dijit.form.Button( { label: '-'});
		dojo.place(this.removeFile.domNode, this.removeFileDiv, "last");
		dojo.style(this.removeFileDiv, "display", "inline");				
	},
	
	
	
	/*
	 * This function retrieves the url of the the file that is attached
	 * to the current field so it can be used to build a link or display an image
	 * in the current form
	 */
	_getFilesUrls: function() {				
			
		var params = {
			"apsdb.documentKey" : this.docKey,
			"apsdb.fileName" : this.value,
			"apsdb.fieldName" : this.name,
			"apsdb.store" : this.store
		};
		
		var connection = this.connection;		
		if (!connection) {
			connection = new apstrata.sdk.Connection();
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
			if (docKeyField) {
				this.docKey = docKeyField.get("value");
				if (!this.docKey) {
					this.docKey = docKeyField.get("value");
				}
			}
		};
		
		if (!this._gotValue) {		
			this._displayAttachedFile();
			this.startup();
		}
	}	
})


