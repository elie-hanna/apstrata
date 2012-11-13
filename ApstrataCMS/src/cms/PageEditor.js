dojo.provide("apstrata.cms.PageEditor");

dojo.require("dojox.dtl._Templated");
dojo.require("apstrata.horizon.util._Templated");
dojo.require("apstrata.horizon.Panel");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");

/**
 * This class provides an editor to create/update page documents
 * The content of the document is displayed/edited in three distinct tabs.
 * @param params.attrs.doc (optional) the page document to load into the page editor instance 
 * @param params.attrs.store (optional) the store where to update, defaults to "apstrata"
 * @param params.attrs.connection (option) the connection to use to Apstrata account. Defaults to this.container.connection
 */
dojo.declare("apstrata.cms.PageEditor", 
[apstrata.horizon.Panel], 
{
	templatePath: dojo.moduleUrl("apstrata.cms", "templates/PageEditor.html"),
	widgetsInTemplate: true,
	_store: "apstrata",
	_connection: null,
	
	// the mode is in "edit" mode (true) if the consructor receives a value. It is "new" mode (false) otherwise
	_mode: true,

	// the form generator that will handle the data retrieved from the page
	_formGenerator: null,
	
	// the form definition of the page document
	_pageFormDefinition: null,
	
 	constructor: function(params) {
		
		var value = params && params.attrs.doc ? params.attrs.doc : null;
		this._mode = value ? true : false;
		this._store = params && params.attrs.store ? params.attrs.store : this._store;
		this._specifyFormDefinition();
		this._formGenerator = new apstrata.ui.forms.FormGenerator(
			{
				definition: this._pageFormDefinition,
				
				// change the below to new (or anthing else) when you need to create a new document
				// set it to "edit" when you need to retrieve an existing document into the form
				//displayGroups: value ? "edit" : "new",	
				value: value,
				save: dojo.hitch(this, this.save),
				submitOnEnter: true
			}
		);		
							
		this.inherited(arguments);
	},
	
	/*
	 * Saves the form content into a corresponding document in the Apstrata store
	 */
	save: function(value) {
		
		var self = this;
		this._handleFormEditorBug();
			
		var params = {											
				"apsdb.update": this._mode,
				"apsdb.store": this._store,
				"apsdb.schema": "cms_page",
				"section1.apsdb.fieldType": "text",
				"section2.apsdb.fieldType": "text"				
		};	
		 
		params["description"] = this._formGenerator.getField("description").value;
		params["category"] = this._formGenerator.getField("category").value;
				
		var client = new apstrata.sdk.Client(this._connection);
		client.call("SaveDocument", params, this._formGenerator.frmMain.domNode, {method:"post"}).then( 
		
			function(response){
												
				self._alert("Page successfully updated");
			},
			
			function(response) {
				
				var errorMsg= response.metadata.errorDetail ? response.metadata.errorDetail : response.metadata.errorCode;
				self._alert(errorMsg ? errorMsg : "An error has occured", "errorIcon");
			}
		)		
	},
	
	postCreate: function() {
						
		this.inherited(arguments);
	},
	
	startup: function() {
		
		dojo.style(this.domNode, "height", "100%");				
		this._arrangeLayout();		
		this.inherited(arguments);
	},
	
	/*
	 * Splits the different groups of the form built by the form generator into
	 * the different tabs of the tabbed layout container.
	 */
	_arrangeLayout: function() {
		
		var self = this;
		
		dojo.place(this._formGenerator.domNode, this.editorial.domNode);
				
		// Query for the node having a "setLabel" class. They are located right before the
		// group fieldsets
		var groups = dojo.query(".setLabel");
		if (groups) {
							
			// move the "code" group to the code div
			var codeGroup = groups[1].nextSibling;
			dojo.destroy(groups[1]);
			dojo.place(codeGroup, this.code.domNode);				
			
			// move the "metadata" group to the metadata div
			var metadataGroup= groups[2].nextSibling;
			dojo.destroy(groups[2]);
			dojo.place(metadataGroup, this.metadata.domNode);											 			
		}	
	},
	
	_specifyFormDefinition: function() {
		
		if (!this._cnnection) {
			this._connection = new apstrata.sdk.Connection(this.container.connection);
		}
				
		this._pageFormDefinition =  {
			fieldset: [
				
				// definition of the "editorial" tab
				{name: "editorial",  type: "subform", 
					
					fieldset: [						
						{name: "apsdb.documentKey", label: "Page ID", required: true, type: "string"},
						{name: "title", type: "string", required: true},
						{name: "section1", label: "Body: first section", type: "string", widget: "dijit.Editor", height: "200px", plugins: ['bold','italic','|','createLink','foreColor','hiliteColor',{name:'dijit._editor.plugins.FontChoice', command:'fontName', generic:true},'fontSize','formatBlock','insertImage','insertHorizontalRule']},
						{name: "section2", label: "Body: second section", type: "string", widget: "dijit.Editor", height: "200px", plugins: ['bold','italic','|','createLink','foreColor','hiliteColor',{name:'dijit._editor.plugins.FontChoice', command:'fontName', generic:true},'fontSize','formatBlock','insertImage','insertHorizontalRule']},
						{name: "template", label:"Template", type: "string", widget: "dijit.form.ComboBox", "formGenerator-options": ["Wide", "Two columns"]},
						{name: "tags", label:"tags", type: "string", widget: "dojox.form.ListInput"},
						{name: "attachments", label: "Attachments", type: "multiplefiles", connection: this._connection, displayImage:false, value:""},
						{name: "smallIcon", label:"Small icon", type: "file", displayImage:true, connection: this._connection, store: this._store, value:"", showRemoveFieldBtn: true},
						{name: "regularIcon", label:"Regular Icon", type: "file", displayImage:true, connection: this._connection, store: this._store, value:"",showRemoveFieldBtn: true},
						{name: "documentType", type: "hidden", value: "page"}
						//{name: "parent", label:"Parent", type: "string", widget: "dojox.form.ListInput"},
					]
				},
	
				// definition of the "JS/CSS" tab
				{name: "Code",  type: "subform",
					fieldset: [
						{name: "javascript", label: "JavaScript", type: "string", widget: "dijit.Editor", height: "200px", plugins: ['bold','italic','|','createLink','foreColor','hiliteColor',{name:'dijit._editor.plugins.FontChoice', command:'fontName', generic:true},'fontSize','formatBlock','insertImage','insertHorizontalRule']},
						{name: "css", label: "CSS", type: "string", widget: "dijit.Editor", height: "200px", plugins: ['bold','italic','|','createLink','foreColor','hiliteColor',{name:'dijit._editor.plugins.FontChoice', command:'fontName', generic:true},'fontSize','formatBlock','insertImage','insertHorizontalRule']},			
					]				
				},
		
				// definition of the "metadata" tab
				{name: "Metadata",  type: "subform",
					fieldset: [
						{name: "description", label: "Description", type: "string"},
						{name: "category", label: "Category", type: "string", type: "string", value: "Editor", widget: "dijit.form.ComboBox", "formGenerator-options": ["Editorial", "Product", "Blog"]},
						{name: "keywords", label: "Keywords", type: "string"},
						{name: "pageStatus", label: "Status", type: "string", type: "string", value: "Draft", widget: "dijit.form.ComboBox", "formGenerator-options": ["Published", "Draft", "Pending Approval"]},
						{name: "document.readACL", label: "Read permissions", type: "string"},
						{name: "publishedDate", label: "Published date", type: "date"}
					]
				},
			],
			
			actions: ['save']
		}
	},
	
	/*
	 * This section is required due to a dojo bug in the FormGenerator: when submitting the form node,
	 * the value of dijit.Editors is not sent along the other data. This section is a quick workaround
	 * but should be removed when the bug is fixed
	 */	
	_handleFormEditorBug: function() {
				
		dojo.require("dijit.form.Textarea");
		if (!this._section1TextArea) {				
			this._section1TextArea = new dijit.form.Textarea({name:"section1", style:"display:none"});
			dojo.place(this._section1TextArea.domNode, this._formGenerator.frmMain.domNode);
		}
		
		this._section1TextArea.set("value", this._formGenerator.getField("section1").value);		
		
		if (!this._section2TextArea) {
			this._section2TextArea = new dijit.form.Textarea({name:"section2", style:"display:none"});
			dojo.place(this._section2TextArea.domNode, this._formGenerator.frmMain.domNode);
		}
		
		this._section2TextArea.set("value", this._formGenerator.getField("section2").value);		
	},
	
	/*
	 * Displays an alert message
	 */
	_alert: function(message, iconClass){
		
		var self = this;
		new apstrata.horizon.PanelAlert({
			panel: self,
			width: 320,
			height: 140,
			iconClass: iconClass,
			message: message,
			actions: ['OK'],
			actionHandler: function(action){
				self.closePanel();
			}
		});
	}
})
