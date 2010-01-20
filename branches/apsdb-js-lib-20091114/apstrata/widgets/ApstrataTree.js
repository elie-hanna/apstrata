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
dojo.provide("apstrata.widgets.ApstrataTree")

dojo.require("dijit.Tree");
dojo.require("dijit.tree.ForestStoreModel");

dojo.require("apstrata.apsdb.client.Client")
dojo.require("apstrata.apsdb.client.ItemApsdbWriteStore")
dojo.require("apstrata.apsdb.client.widgets.ConnectionStatus")

dojo.declare("apstrata.widgets.ApstrataTree", 
				[dijit._Widget, dijit._Templated], 
				{
					
					templateString: "<div><div dojoAttachPoint='dvTree'></div></div>",
					store: null,
					query: "",
					rootLabel: "root",
					showRoot: false,
					
					constructor: function(attrs) {
						var self = this
						if (attrs && attrs.store && attrs.query) {
							this.store = attrs.store
							this.query = attrs.query

							if (attrs.rootLabel) self.rootLabel = attrs.rootLabel
							if (attrs.showRoot) self.showRoot = attrs.showRoot

							this.model = new dijit.tree.ForestStoreModel({
							        store: self.store,
							        query: {query: self.query},
							        rootLabel: self.rootLabel,
									rootId: "rootId",
									childrenAttrs: ["children"]
							})
							
						}
					},
					
					postCreate: function() {
						var self = this
						if (this.model) {
						    this.tree = new dijit.Tree({
						        model: self.model,
								showRoot: self.showRoot
						    })
							
							dojo.place(this.tree.domNode, this.dvTree, "first")
						} else {
							this.dvTree.innerHTML = "Please provide a data store!"
						}
					}
				})	
