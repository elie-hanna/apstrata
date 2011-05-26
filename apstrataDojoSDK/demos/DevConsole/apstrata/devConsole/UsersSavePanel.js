/*******************************************************************************
 *  Copyright 2009 Apstrata
 *  
 *  This file is part of Apstrata Database Javascript Client.
 *  
 *  Apstrata Database Javascript Client is free software: you can redistribute it
 *  and/or modify it under the terms of the GNU Lesser General Public License as
 *  published by the Free Software Foundation, either version 3 of the License,
 *  or (at your option) any later version.
 *  
 *  Apstrata Database Javascript Client is distributed in the hope that it will be
 *  useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *  
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with Apstrata Database Javascript Client.  If not, see <http://www.gnu.org/licenses/>.
 * *****************************************************************************
 */

dojo.provide("apstrata.devConsole.UsersSavePanel");
dojo.provide("apstrata.devConsole.UsersSaveField");
dojo.provide("apstrata.devConsole.UsersSaveFieldValue");

dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.form.ToggleButton");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.date.locale");
dojo.require("dojox.form.FileInput");

dojo.declare("apstrata.devConsole.UsersSavePanel", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
  widgetsInTemplate: true,
  fieldSerialNumber: 0,
  templatePath: dojo.moduleUrl("apstrata.devConsole", "templates/UsersSavePanel.html"),
  listSchemas: [],
  storeName: null,
  
  constructor: function(attrs) {
    var self = this;
    
    this.userAttributes = {
      user: '',
      password: '',
      password2: '',
      name: '',
      email: '',
      groups: ''
    }     

    this.update = false

    if (attrs.userName) {
      this._userName = attrs.userName
      
      this.update = true
    }
    
    self.storeName = attrs.target;
    self.docKey = attrs.docKey;
    // self.update = (attrs.docKey && attrs.docKey!='') ? true : false;
    self.currentPage = attrs.currentPage;
    self.ftsFields = '';
  },
  
  postCreate: function() {
    var self = this;
    var usersPanel = this

    if (this.update) {
      this.container.client.call({
        action: "ListUsers",
        request: {
          "apsdb.query": 'login="' + usersPanel._userName + '"',
          "apsdb.attributes": "*"
        },
        load: function(operation) {
          usersPanel.userAttributes.user = usersPanel._userName; 
	
          // Fill the user properties and their multiple values.
		  var user = operation.response.result.users[0];
          for (var fieldName in user){ 
            var fieldType = "string";
            var fieldValues = [];
			
			console.log("FieldName: " + fieldName);
            
            for (var i=0; i < user[fieldName].length; i++) {
              fieldValues[i] = user[fieldName][i];
            }
			
			console.log("FieldValues: " + fieldValues);
			
			if (fieldName.indexOf('apsdb.') == 0 || fieldName == '_type') {
                continue;
            }
			
			if (fieldName == "login") {
				usersPanel.userAttributes[fieldName] = fieldValues;
				self.user.value = fieldValues;
				continue;
			}
			
			if (fieldName == "name") {
				usersPanel.userAttributes[fieldName] = fieldValues;
				self.name.value = fieldValues;
				continue;
			}
			
			if (fieldName == "email") {
				usersPanel.userAttributes[fieldName] = fieldValues;
				self.email.value = fieldValues;
				continue;
			}
			
			if (fieldName == "groups") {
				usersPanel.userAttributes[fieldName] = fieldValues;
				self.groups.value = fieldValues;
				continue;
			}

            // Make sure that the field has values before adding it to the fields panel.
            if (fieldValues.length != 0) {
              var field = new apstrata.devConsole.UsersSaveField({fieldName: fieldName, fieldValues: fieldValues, fieldType: fieldType, update: true, documentForm: self});
              self.fieldsList.addChild(field);
            }
          }

          //usersPanel.render();
        },
        error: function(operation) {
        }
      })
    }   
    
    this.inherited(arguments)
  },

  _save: function() {
    var self = this;
    
    if (this.password.value != this.password2.value) {
      alert("passwords don't match")
    }
    
    var userGroups = (self.groups.value).split(',');
    // trim spaces from the groups list
    for (var group in userGroups){
      if (userGroups.hasOwnProperty (group)){ // make sure we're not playing with anything on the prototype, just with attributes of this object
        userGroups [group] = userGroups[group].replace(/^\s+|\s+$/g,""); // trim leading and trailing spaces from the group name
      }     
    }
    
      attrs = {
        action: "SaveUser",
        request: {
          apsdb: {
            update: self.update
          },
          login: self.user.value,
          password: self.password.value,
          name: self.name.value,
          email: self.email.value,
          groups: userGroups,
      
        },
        load: function(operation) {
          self.getParent().reload()
        },
        error: function(operation) {
        }
      }
      
      var fields = self.fieldsList.getChildren();
      for(var fieldsIndex=0; fieldsIndex < fields.length; fieldsIndex++) {
        var field = fields[fieldsIndex];
        
        if (field.fieldValuesList.hasChildren() && field.fieldType.value != 'file') {
          var fieldValues = field.fieldValuesList.getChildren();
          attrs.request[field.fieldName.value] = new Array();
          for(var i=0; i<fieldValues.length; i++) {
            sentVal = fieldValues[i].fieldValue.value;
            if (field.fieldType.value=='date') {
              sentVal = (fieldValues[i].fieldDateValue.value != null && fieldValues[i].fieldDateValue.value != '') ? (dojo.date.locale.format(fieldValues[i].fieldDateValue.value, {datePattern:"yyyy-MM-dd", timePattern: "'T'HH:mm:ssZ"})) : '';
              sentVal = sentVal.replace(' ','');
            }
            
            attrs.request[field.fieldName.value].push(sentVal);
          }
        } else if (field.fieldType.value == 'file') {
          if (this.update) {
            apsdb['multivalueAppend'] = field.fieldName.value;
          }
          attrs['formNode'] = this.saveDocumentForm.domNode;
          attrs['useHttpMethod'] = "POST";
        }
        
        if (field.ftsFields.attr("checked")) {
          apsdb.ftsFields = (apsdb.ftsFields) ? field.fieldName.value + "," + apsdb.ftsFields : field.fieldName.value;
        }
      }
      this.container.client.call(attrs)
  },  
  
  _addFieldLine: function() {
    // Adds the newField node to the document
    var newField = new apstrata.devConsole.UsersSaveField({fieldName:null, fieldValues:null, fieldType:null, documentForm: this});
    this.fieldsList.addChild(newField);
  },
  
  _schemaChanged: function() {
    for (var i=0; i<this.fieldsList.getChildren().length; i++) {
      if (this.fieldsList.getChildren()[i].fieldType.attr("value") == "file") {
        if (this.schemaName.attr("value") == "") {
          this.fieldsList.getChildren()[i].fieldName.attr("disabled", true);
          this.fieldsList.getChildren()[i].fieldName.attr("value", "apsdb_attachments");
        } else {
          this.fieldsList.getChildren()[i].fieldName.attr("disabled", false);
        }
      }
    }
  },
  
  _cancel: function() {
    this.panel.destroy();
  }
})


dojo.declare("apstrata.devConsole.UsersSaveField", [dijit._Widget, dijit._Templated], 
{
  widgetsInTemplate: true,
  templateString: null,
  templatePath: dojo.moduleUrl("apstrata.devConsole", "templates/UsersSaveField.html"),
  
  /**
   * Constructor of the Document Fields widget.
   */
  constructor: function(attrs) {
    this.fldName = attrs.fieldName;
    this.fldValues = attrs.fieldValues; 
    this.fldType = attrs.fieldType;
    this.update = attrs.update;
    this.documentForm = attrs.documentForm;
  },
  
  postCreate: function() {
    this.fieldName.attr("value", this.fldName);
    // this.fieldType.attr("value", this.fldType);
    // SaveUser doesn't support typed fields for now...so we made the type string and disabled
    this.fieldType.attr("value", "string");
    this.fieldType.attr("disabled",true);
    
    this.ftsFields.attr("disabled", true);
    if (this.update) {
      this.fieldName.attr("disabled",true);
      // this.fieldType.attr("disabled",true);
    }
    if(this.fldValues) {
      for(var i=0; i<this.fldValues.length; i++) {
        this.fieldValuesList.addChild(new apstrata.devConsole.UsersSaveFieldValue({fieldValue: this.fldValues[i], referencedField: this}));
      } 
    } else {
      this._addFieldValue();
    }
  },
  
  _typeChanged: function() {
    var selectedType = this.fieldType.attr("value");
    if (selectedType == 'file' && this.documentForm.schemaName == '') {
      this.fieldName.attr("value", "apsdb_attachments");
      this.fieldName.attr("disabled",true);
    } else {
      this.fieldName.attr("disabled",false);
    }
    
    if (this.fieldValuesList.hasChildren()) {
      for(var i=0; i<this.fieldValuesList.getChildren().length; i++) {
        this.fieldValuesList.getChildren()[i]._typeChanged();
      }
    }
  },
  
  
  _fieldNameChanged: function() {
    var selectedType = this.fieldType.attr("value");
    if (selectedType == 'file' && this.fieldName.attr("value") != this.fldName) {
      for(var i=0; i<this.fieldValuesList.getChildren().length; i++) {
        this.fieldValuesList.getChildren()[i].apsdb_attachments.domNode.getElementsByTagName("input")[0].setAttribute("name", this.fieldName.attr("value"));
      }     
    }
  },  
  
  _addFieldValue: function() {
    // Adds the newField node to the document
    var newFieldValue = new apstrata.devConsole.UsersSaveFieldValue({fieldValue:null, referencedField: this});
    this.fieldValuesList.addChild(newFieldValue);   
  },  
  
  _removeFieldLine: function() {
    // Remove the field container.
    this.destroy();
    return; 
  } 
})

dojo.declare("apstrata.devConsole.UsersSaveFieldValue", [dijit._Widget, dijit._Templated], 
{
  widgetsInTemplate: true,
  templateString: "<div dojoAttachPoint=\"valuesDiv\">"+
          "<button dojoAttachEvent='onClick: _removeFieldValue' dojoType='dijit.form.Button'>-</button>"+
                  "<div dojoAttachPoint=\"fileTypeInput\" style=\"display:none;\"><input dojoAttachEvent='onClick: _fileChanged' dojoAttachPoint=\"apsdb_attachments\" style=\"width:144px\" dojoType=\"dojox.form.FileInput\" class=\"rounded-xsml dijitInlineTable\" /></div>"+
                  "<div dojoAttachPoint=\"otherTypeInput\" style=\"display:none;\"><input dojoAttachPoint=\"fieldValue\" type=\"text\" dojoType=\"dijit.form.ValidationTextBox\" required=\"false\" class=\"rounded-xsml\"/></div>"+
                "<div dojoAttachPoint=\"dateTypeInput\" style=\"display:none;\"><input dojoAttachPoint=\"fieldDateValue\" constraints=\"{datePattern:'dd/MM/yyyy HH:mm:ss'}\" type=\"text\" dojoType=\"dijit.form.DateTextBox\" required=\"false\" class=\"rounded-xsml\"/></div>"+
                "</div>",
  
  /**
   * Constructor of the Document Field value widget.
   */
  constructor: function(attrs) {
    this.referencedField = attrs.referencedField;
    this.fldValue = attrs.fieldValue;
  },
  
  _fileChanged: function() {
      this.apsdb_attachments.domNode.getElementsByTagName("input")[0].setAttribute("name", this.referencedField.fieldName.attr("value"));
  },
  
  postCreate: function() {
    var self = this;
    this.apsdb_attachments.domNode.getElementsByTagName("input")[0].setAttribute("name", "");
    
	
    if (this.fldValue!=null && this.fldValue!='') {
      if (this.referencedField.fieldType.attr("value")=='date') {
        this.fieldDateValue.attr("value", this._parseDate(this.fldValue));
      } else if (this.referencedField.fieldType.attr("value")=='file') {
        this.apsdb_attachments.attr("value", this.fldValue);
      } else {
		//console.log("********** FieldValue: " + this.fldValue);
        this.fieldValue.attr("value", this.fldValue);
      }
    }
    
    this._typeChanged();
  },  
  
  _typeChanged: function() {
    dojo.style(this.dateTypeInput, "display", "none");
    dojo.style(this.fileTypeInput, "display", "none");
    dojo.style(this.otherTypeInput, "display", "none");
    if (this.referencedField.fieldType.attr("value") == "file") {
      dojo.style(this.fileTypeInput, "display", "inline");
    } else if (this.referencedField.fieldType.attr("value") == "date") {
      dojo.style(this.dateTypeInput, "display", "inline");
      if(this.fieldDateValue.attr("value")==null) {
        this.fieldDateValue.attr("value", new Date());
      }
    } else {
	  //console.log("*********** Inline");
      dojo.style(this.otherTypeInput, "display", "inline");
    }
  },
  
  _removeFieldValue: function() {
    // Remove the field value container.
    this.destroy();
    return;     
  },
  
  _parseDate: function(value) {
    var dateVal = dojo.date.locale.parse(value.split('T')[0], {datePattern:'yyyy-MM-dd', selector: 'date'});
    var timeVal = dojo.date.locale.parse(value.substring(value.indexOf('T')), {timePattern: "'T'HH:mm:ssZ", selector: 'time'});
    dateVal.setUTCHours(timeVal.getUTCHours());
    dateVal.setUTCMinutes(timeVal.getUTCMinutes());
    dateVal.setUTCSeconds(timeVal.getUTCSeconds());
      return dateVal;
  }
})
