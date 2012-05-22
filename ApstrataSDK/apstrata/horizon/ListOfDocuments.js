/*******************************************************************************
 *  Copyright 2009-2012 Apstrata
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
dojo.provide("apstrata.horizon.ListOfDocuments")

dojo.require("dojo.store.Memory")
dojo.require("apstrata.horizon.NewList")
dojo.require("apstrata.horizon.WrapperPanel")
dojo.require("apstrata.ui.forms.FormGenerator")

dojo.declare("apstrata.horizon.ListOfDocuments", 
[apstrata.horizon.NewList], 
{
		
	constructor: function() {
		var self = this

		//
		// widget attributes
		//
		this.filterable = true
		this.sortable = true
		this.editable = true
		this.maximizable = false
		this.maximized = true
		
		// css classes
		this.listCssClass = ""
		this.formCssClass = ""
		
		this.forms = {}
	},
		
	postCreate: function() {
		dojo.addClass(this.domNode, this.listCssClass)
		dojo.style(this.domNode, "width", "250px")
		this.inherited(arguments)	
	},
	
	openForm: function(formDef, value) {
		var self = this	

		this.openPanel(apstrata.horizon.WrapperPanel, {
			widgetClass: "apstrata.ui.forms.FormGenerator",
			maximizable: true,
			cssClass: self.formCssClass,
			attrs: {
				definition: formDef,
				save: function(v) {
					console.dir(v)
				},
				value: value
			}
		})
	},
	
	//
	//
	//
	set: function(label, label2, value) {
		if (label=="formDefinition") {
			this.forms[label2] = value
		} else {
			this.inherited(arguments)
		}
	},
	
	get: function(label, label2) {
		if (label=="formDefinition") {
			return this.forms[label2]
		} else {
			this.inherited(arguments)
		}
	},
	
	//
	// onClick
	//
	onClick: function(id) {
		this.openForm(this.get("formDefinition", "all"), this.store.get(id)) 
	}
	
})
