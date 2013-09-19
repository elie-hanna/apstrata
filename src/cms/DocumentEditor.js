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
dojo.provide("apstrata.cms.DocumentEditor")

dojo.require("dojo.store.Memory")
dojo.require("apstrata.horizon.WrapperPanel")
dojo.require("apstrata.ui.forms.FormGenerator")
dojo.require("apstrata.sdk.ObjectStore")


dojo.declare("apstrata.cms.DocumentEditor", 
[apstrata.horizon.WrapperPanel], 
{

	cssClass: "",
	definition: {},
	value: "",
	storeName: "",
	docKey: "",
		
	constructor: function(options) {
		var self = this

		dojo.mixin(this, options)

		this.widgetClass = "apstrata.ui.forms.FormGenerator"
	},
	
	postCreate: function() {
		var self = this

		this.store = new apstrata.sdk.ObjectStore({
					connection: self.container.connection,
					store: self.storeName,
					queryFields: "*"
//					queryExpression: "documentType =\"mainMenu\"" 
				}) 
		
		this.attrs = {
			definition: self.definition,
			save: function(v) {
				console.dir(v)
			}
		}
		
		this.inherited(arguments)
	},
	
//	save: function(v) 
	
	onAnimationEnd: function() {
		var self = this
		
		this.store.get(this.docKey).then(
			function(doc) {			
				self._docExists = true
				self.getWidget().set("value", doc)
			},
			function(doc) {
				self._docExists = false
			}
		)
		this.inherited(arguments)
	}

})