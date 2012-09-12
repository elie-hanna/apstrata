dojo.provide("apstrata.ui.forms.MultipleFileField")

dojo.require("dojox.dtl._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("apstrata.ui.forms.FileField");
dojo.require("apstrata.sdk.TokenConnection");


dojo.declare("apstrata.ui.forms.MultipleFileField", 
[dijit._Widget, dojox.dtl._Templated], 
{
	templatePath: dojo.moduleUrl("apstrata.ui.forms", "templates/MultipleFileField.html"),
	
	/*
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
	 */	
	constructor: function(attr) {
		
		dojo.mixin(this, attr);
		if (this.displayImage) {
			this.dimensions = this.dimensions ? this.dimensions : {w:100, h:100};
		};		
		
		this.fileFields = new Array();
		
		if (this.formGenerator) {
			
			// Register to the ready event in the formGenerator so we can retrive the apsdb.documentKey value later on,
			// as well as the names of the attached files (contained in the value of the current field).
			// We need to hitch to this as _getReady will be called from the FormGenerator
			this.formGenerator.ready(dojo.hitch(this, this._getReady));
						
			dojo.connect(this.formGenerator, this.formGenerator.save, function() {
				alert("wazzup");
			});			
		};									
	},

	postCreate: function() {			
		
		var addFileBtn = new dijit.form.Button({label: "+"});
		dojo.place(addFileBtn.domNode, this.dvNodes);
		dojo.connect(addFileBtn, "onClick", this, "addFileField");
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
			dojo.place("<div style='margin-top:10px;margin-bottom:10px'></div>", this.files);			
		}
				
		dojo.place(fileField.domNode, this.files);		
	},
	
	/*
	 * Removes the specified element from the array of fileFields, if found,
	 * and removes the corresponding node from the html if destroy == true
	 * Doesn't remove the last field.
	 */
	removeFileField: function(fileField, destroy) {
		
		if (this.fileFields.length > 1) {
			
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
			dojo.place(multivalueAppendWidget.domNode, this.dvNodes); 
		}
		
		if (!this._gotValue) {	
			
			// Retrieve the names of the attached files and rebuild the dom sub-tree of the widget
		    var fileNames = this.formGenerator.getField(this.name).get("value");
			if (typeof(fileNames) == "string") {

				self.addFileField(fileNames);
			}else {
				
				dojo.forEach(fileNames, function(value, index) {				
					self.addFileField(value);
				});
			}
			
			this.startup();
		}
	}	
	
})


