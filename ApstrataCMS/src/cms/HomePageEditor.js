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
dojo.provide("apstrata.cms.HomePageEditor")

dojo.require("dojo.store.Memory")
dojo.require("apstrata.horizon.WrapperPanel")
dojo.require("apstrata.ui.forms.FormGenerator")
dojo.require("apstrata.sdk.ObjectStore")

dojo.require("dijit.Editor")
dojo.require("dijit._editor.plugins.FontChoice");  // 'fontName','fontSize','formatBlock'
dojo.require("dijit._editor.plugins.TextColor");
dojo.require("dijit._editor.plugins.LinkDialog");
dojo.require("dojox.form.ListInput")


dojo.declare("apstrata.cms.HomePageEditor", 
[apstrata.horizon.WrapperPanel], 
{
	maximized: true,
	maximizable: true,
	
	key: "home",
	
	constructor: function() {
		var self = this

		this.cssClass = "homePageEditor"
		this.widgetClass = "apstrata.ui.forms.FormGenerator"
		this.attrs = {
			definition: {
				label: "Menu",
				fieldset: [
					{name: "slogan1", label: "Slogan 1", type: "string", style: "width: 100%;"},
					{name: "text1", label: "Slide 1: text", type: "string", widget: "dijit.Editor", height: "200px", plugins: ['bold','italic','|','createLink','foreColor','hiliteColor',{name:'dijit._editor.plugins.FontChoice', command:'fontName', generic:true},'fontSize','formatBlock','insertImage','insertHorizontalRule']},

					{name: "slogan1", label: "Slogan 2", type: "string", style: "width: 100%;"},
					{name: "text2", label: "Slide 2: text", type: "string", widget: "dijit.Editor", height: "200px", plugins: ['bold','italic','|','createLink','foreColor','hiliteColor',{name:'dijit._editor.plugins.FontChoice', command:'fontName', generic:true},'fontSize','formatBlock','insertImage','insertHorizontalRule']},

					{name: "slogan2", label: "Slogan 3", type: "string", style: "width: 100%;"},
					{name: "text2", label: "Slide 3: text", type: "string", widget: "dijit.Editor", height: "200px", plugins: ['bold','italic','|','createLink','foreColor','hiliteColor',{name:'dijit._editor.plugins.FontChoice', command:'fontName', generic:true},'fontSize','formatBlock','insertImage','insertHorizontalRule']},

					{name: "template", type:"hidden", value: "home"},
					{name: "documentType", type: "hidden", value: "homePage"}
				],
				actions: ['save']
			},
			
			save: function(v) {
				v ["apsdb.documentKey"] = self.key
				if (self._HomePageExists) self.store.put(v);
					else self.store.add(v)
			}
		}

		this.store = new apstrata.sdk.ObjectStore({
					connection: self.container.connection,
					store: "apstrata",
					queryFields: "*",
					queryExpression: "documentType =\"homePage\"" 
				}) 

	},
	
	postcreate: function() {
		
		this.inherited(arguments)
	},
	
	onAnimationEnd: function() {
		var self = this
		
		this.store.get(self.key).then(
			function(doc) {
				self._HomePageExists = true
				if (!dojo.isArray(doc.group)) doc.group = [doc.group]
				self.getWidget().set("value", doc)
			},
			function(doc) {
				self._HomePageExists = false
			}
		)
		this.inherited(arguments)
	}
	
})