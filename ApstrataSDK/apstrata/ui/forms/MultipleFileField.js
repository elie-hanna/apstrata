dojo.provide("apstrata.ui.forms.MultipleFileField")

dojo.require("dojox.dtl._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("apstrata.ui.forms.FileField");
dojo.require("apstrata.sdk.TokenConnection");
dojo.require("dijit.form.Button");

dojo.declare("apstrata.ui.forms.MultipleFileField", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templatePath: dojo.moduleUrl("apstrata.ui.forms", "templates/MultipleFileField.html"),
	x : "toShow",

	min: 0,
	
	max: 10,
	
	_addFileBtn: null,
	_addFileBtnConn: null,
	
	/* This creates an instance of a MultipleFileField. A MultipleFielField can be used to upload many files to an apstrata document
	 * or to download files from a document (diplayed as links or images). MultipleFileField uses the FileField class.
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
	 * @param attr.readonly: (optional) set to true if you want to prevent to modify the attached file (if it exists).
	 * @param attr.showFieldName: (optional) in certain cases, you need to allow the end user to choose the name of the field 
	 * that will be used to attach the files. In that case, you need to pass this parameter and set its value to 'true'. 
	 * Note that your document needs to be based on a schema for this to work. The MultipleFileField will not verify the existance of a schema.
	 */	
	constructor: function(attr) {
		var self = this;
		
		dojo.mixin(this, attr);
		if (this.displayImage) {
			this.dimensions = this.dimensions ? this.dimensions : {w:100, h:100};
		};		
		
		if (this.formGenerator) {
			if (!this.formGenerator.isFormReady()) {	
				// Register to the ready event in the formGenerator so we can retrive the apsdb.documentKey value later on,
				// as well as the names of the attached files (contained in the value of the current field).
				// We need to hitch to this as _getReady will be called from the FormGenerator
				this.formGenerator.ready(dojo.hitch(this, this._getReady));
			}			
		};				
		
		
		this.fileFields = new Array();
								
	},

	postCreate: function() {
		var self = this;		

		// If the form definition is asking to give the user the possibility to choose the name of the file attachment field,
		// we need to make the corresponding input field visible on the form. We also connect to changes on that field in order
		// to update the name of the fileInput field. 
		// Note that this will work only if the concerned document has a schema. The FiledField instance is not responsible for
		// verifying the availability of a schema.
		if (this.showFieldName) {
			
			dojo.style(this.filefieldLabel, "display", "inline");
			dojo.style(this.filefieldName, "display", "inline");
			
			// set the initial value of the fieldName to the one that is currently associated to the fileInput
			this.filefieldName.value = this.name;
			
			// connect to any changes on the fieldName so they are reflected on the fileInput
			dojo.connect(this.filefieldName, "onchange", function() {
				self.name = self.filefieldName.value; 
				for (var i = 0; i < self.fileFields.length; i++) {
					var setNameFunc = dojo.hitch(self.fileFields[i], self.fileFields[i].setName);
					setNameFunc(self.name);
				}
			})
		}		
		
		if (!this._addFieldButtonDisplayed && this.fileFields.length < this.max) {
			this._addFileBtn = new dijit.form.Button({"label": "+"});
			dojo.place(this._addFileBtn.domNode, this.dvNodes);
			dojo.addClass(this._addFileBtn.domNode, "addFileDiv");
			this._addFileBtnConn =dojo.connect(this._addFileBtn, "onClick", this, "addFileField");
			this._addFieldButtonDisplayed = true;
		}
		
		if(this.min >=1 && this.fileFields.length == 0) {
			this.addFileField("");
		}
		
	},	
	
	/*
	 * Add FileInput field to the widget's node and at the end of the 
	 * fileFields array and display a file input to the screen (only
	 * if none is already displayed). 
	 * @param: valueParam can be the name of the file or a mouse event
	 * in case the function was called further to a click on "Add file"
	 */
	addFileField: function(valueParam) {				
		
		var self = this;
		var fileField = new apstrata.ui.forms.FileField(
				{
					formGenerator: this.formGenerator,
					name: this.name,
					store: this.store,
					dockey: this.dockey,
					displayImage: this.displayImage,
					dimensions: this.dimensions,
					connection: this.connection,
					readonly: this.readonly,
					
					// If the function was called further to a mouse click, don't use valueParam
					value: valueParam.target ? "" : valueParam,		
					group: self			
				}
			);		
		
		this.fileFields.push(fileField);  
		if (valueParam.target) {
			var newField = dojo.place("<div style='margin-top:10px;margin-bottom:10px'></div>", this.files);			
		}
		
		var newField = dojo.place(fileField.domNode, this.files);	
		this.showHideAddButton();
		return fileField;	
	},
	
	/*
	 * Removes the specified element from the array of fileFields, if found,
	 * and removes the corresponding node from the html if destroy == true
	 * Doesn't remove the last field.
	 */
	removeFileField: function(fileField, destroy) {
		
		if (this.fileFields.length >= 1) {
			
			var found = false;
			for (var index = 0; index < this.fileFields.length && !found; index++) {
				
				found = (this.fileFields[index] ==  fileField);
				if (found) {
					
					if (destroy) {	
						dojo.destroy(this.fileFields[index].domNode);			
					}
					
					this.fileFields.splice(index, 1);	
				}
			}
		}
		
		this.showHideAddButton();
	},
	
	/*
	 * Show/hide the add button based on the min and max values and the already fileFields length
	 * If the already displayed fileFields are >= to max hide the button
	 * otherwise display the add file field Button
	 */
	showHideAddButton: function() {
		if(this.fileFields.length >= this.max) {
			dojo.style(this._addFileBtn.domNode, "display", "none");
			dojo.disconnect(this._addFileBtnConn);
			this._addFieldButtonDisplayed = false;
		} else {
			if(this._addFieldButtonDisplayed == false) {
				dojo.style(this._addFileBtn.domNode, "display", "");
				this._addFileBtnConn = dojo.connect(this._addFileBtn, "onClick", this, "addFileField");
				this._addFieldButtonDisplayed = true;
			}
		}
	},
	
	/*
	 * Instances of FileField that were created by the current instance can notify 
	 * this latter using handleChildEvent. FileField instances can thus delegate the control
	 * to the MultipleFileField, which will decide how to handle the event, notably for deciding
	 * on the layout.
	 * @param: event, the event that took place.
	 * event.action = the trigger {"remove", ...}
	 * event.target = the concerned FileField instance
	 */
	handleChildEvent: function(event) {
		
		if (event.action == "remove") {
					
			// if the file field instance (event.target) is the last one, remove the layout of the file
			// (link or image)and replace it with an input of type file (browse for file to attach) 
			if (this.fileFields.length == 1) {				
				event.target.toggleRemoveAndUploadFile(event.target, false, true);	
			}else {
				
				// if this file field is not the last one, just remove the layout of the file (link or image)
				event.target.toggleRemoveAndUploadFile(event.target, false, false);	
			}
			
			this.removeFileField(event.target);
		}
	},
	
	/*
	 * This function retrieves the value of the "aspdb.documentKey" field in the form generator
	 * (only if no docKey was specified initially in the definition). 
	 * The value should normally be an array containing the names of the files attached to the
	 * document. The function then loops over this array and creates an instance of FileField for
	 * every file name by calling addFileField(fileName).
	 * Note that in order to avoid removing the files that were not modified or explicitely removed,
	 * we need to specify that the current field (apsdb_attachments or the attachment field) is
	 * a multivalueAppend field. This allows us to add new files without uploading again the other
	 * files.  
	 */
	_getReady: function() {	
					
		var self = this;
		if (!this.docKey) { 
			
			var docKeyField = this.formGenerator.getField("apsdb.documentKey");
			if (docKeyField) {
				this.docKey = docKeyField.get("value");
				if (!this.docKey) {
					this.docKey = docKeyField.get("value");
				}
			}
		};		
		
		if (this.docKey) {	
			
			// Retrieve the names of the attached files and rebuild the dom sub-tree of the widget
			if (this.formGenerator.value) {
				
				if (!this.connection) {					
					this.connection = this.formGenerator.container.connection;
				}
				
				var fileNames = this.formGenerator.value[this.name];
				
				if (typeof(fileNames) == "string") {
	
					this.addFileField(fileNames);
				}else {
					
					dojo.forEach(fileNames, function(value, index) {				
						self.addFileField(value);
					});
				}
			}	
			
			if (!this._multivalueAppendNodeAdded) {
			
				// This section will either add the current field name to the list of fields
				// that are "apsdb.multivalueAppend" if a widget with that name already exists in the
				// form, or create a new field with that name ("apsdb.multivalueAppend") and set
				// its value to the name of the current field
				
				var multivalueAppendNode = dijit.byId("multivalueAppend");
				if (multivalueAppendNode) {
					
					var currentValue = multivalueAppendNode.get("value");
					currentValue = currentValue + "," + this.name;
					multivalueAppendNode.set("value", currentValue);
				}else {
					
					var multivalueAppendWidget = new dijit.form.TextBox( {name:"apsdb.multivalueAppend"});
					multivalueAppendWidget.set("value", this.name);
					dojo.style(multivalueAppendWidget.domNode, "display", "none");
					var newAppend = dojo.place(multivalueAppendWidget.domNode, this.dvNodes); 
				}
				
				this._multivalueAppendNodeAdded = true;			
			}			
		}		
	},
	
})


