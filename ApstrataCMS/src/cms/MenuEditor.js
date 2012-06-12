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
dojo.provide("apstrata.cms.MenuEditor")

dojo.require("dojo.store.Memory")
dojo.require("dijit._Templated")

dojo.require("dojo.dnd.Source")
dojo.require("dojo.data.ItemFileWriteStore")
dojo.require("dijit.Tree")
dojo.require("dijit.tree.TreeStoreModel")
dojo.require("dijit.tree.dndSource")
dojo.require("dijit.form.Button")
dojo.require("apstrata.sdk.ObjectStore")


dojo.declare("apstrata.cms.HierachicalDnDList", 
[dijit._Widget, dijit._Templated], 
{
	templatePath: dojo.moduleUrl("apstrata.cms","templates/HierachicalDnDList.html"),
	
	constructor: function(options) {
		this.acceptItems = true
		this.copyOnly = false
		this.isFlat = false
		
		dojo.mixin(this, options)
	},
	
	postCreate: function() {
		this.refresh()
		this.inherited(arguments)
	},
	
	refresh: function() {
		var self = this
		
		self.dndList = new dojo.dnd.Source(self.dvList, {copyOnly: self.copyOnly})
		self.dndList.checkAcceptance = function() {
			return self.acceptItems
		}
		dojo.connect(self.dndList, "onMouseUp", function(e) {
			if (self.isFlat) return
			var s = dojo.attr(e.originalTarget, "data-id")
			if (s) {
				self._selected = s
				dojo.style(self.dvIndent, "display", "block")
				var t = dojo.marginBox(e.originalTarget)
				var cb = dojo.marginBox(self.dvIndent)
				var me = dojo.position(self.domNode, true)

				dojo.style(self.dvIndent, {
					top: (t.t-4)+"px",
					left: (me.w-cb.w-10)+"px"
				})
			} 
		})
		
		dojo.connect(self.dndList, "onDraggingOut", function(e) {
			self._selected = null
			dojo.style(self.dvIndent, "display", "none")
		})
						
		if (!this.store) return
		var query = function(o) {return true}
		var queryOptions = {}
		
		dojo.addClass(self.dvList, "busy")
		
		dojo.when(
			this.store.query(
				query,
				queryOptions
			),
			function(result) {
				dojo.removeClass(self.dvList, "busy")
				var pages = []				
				dojo.forEach(result, function(page) {
					pages.push({
						id: page.key,
						data: "<div data-id='" + page.key + "'>" + page.title + "</div>"
					})
				})

				self.dndList.insertNodes(false, pages)
			}
		)
	},
	
	get: function(v) {
		if (v == "value") {
			var list = []
//console.dir(this.dndList.getAllNodes())
			this.dndList.getAllNodes().forEach(function(node){
				
				var level = dojo.attr(node.childNodes[0], "data-level")
				var title = node.childNodes[0].innerHTML
				
				list.push({
					id: dojo.attr(node.childNodes[0], "data-id"),
					title: title,
					level: level?parseInt(level):0
				})
			})
			return list
		}
		
		return this.inherited(arguments)
	},
	
	demote: function() {
		var self = this

		if (!self._selected) return

		var q = dojo.query('div[data-id="' + self._selected + '"]', self.domNode)
		var n = q[0]
		
		var level = dojo.attr(n, "data-level")
		if (!level) {
			level = 0
		} else {
			if (level>0) level--
		} 
		dojo.attr(n, "data-level", level)
		
		dojo.style(n, "marginLeft", level*10+"px")
	},
	
	promote: function() {
		var self = this

		if (!self._selected) return

		var q = dojo.query('div[data-id="' + self._selected + '"]', self.domNode)
		var n = q[0]

		var level = dojo.attr(n, "data-level")
		if (!level) {
			level = 1
		} else {
			if (level<3) level++
		} 
		dojo.attr(n, "data-level", level)
		
		dojo.style(n, "marginLeft", level*10+"px")
	}
})

dojo.declare("apstrata.cms.MenuEditor", 
[dijit._Widget, dijit._Templated], 
{
	templatePath: dojo.moduleUrl("apstrata.cms","templates/MenuEditor.html"),
	
	constructor: function(attrs) {
		this.container = attrs.container
	},
	
	postCreate: function() {
		var self = this

		this.store = new apstrata.sdk.ObjectStore({
					connection: self.container.connection,
					store: "apstrata",
					queryFields: "*",
					queryExpression: "documentType =\"page\"" 
				}) 

		var source = apstrata.cms.HierachicalDnDList({store: self.store, isFlat: true, acceptItems: false, copyOnly: true})
		dojo.place(source.domNode, this.dvSource)

		//
		// Add trash bin
		//
		var trash = new dojo.dnd.Source(self.dvTrashBin, {copyOnly: true})
		dojo.connect(trash, "onDrop", function(source, nodes, copy, target) {
			dojo.forEach(nodes, function(n) {
				dojo.fadeOut({
				    node: n,
					onEnd: function() {
						dojo.style(n, "display", "none")
					}
				}).play();
			})
		})

		var menu, leftFooter, rightFooter

		function getMenuStore(menu) {
			var o = dojo.fromJson(menu)

			var m=[]
			dojo.forEach(o, function(item) {
				m.push({
					key: item.id,
					title: item.title,
					level: item.level
				})
			})
			
			return new dojo.store.Memory({data: m})
		}

		this.store.get("menu").then(function(doc) {
			menu = apstrata.cms.HierachicalDnDList({store: getMenuStore(doc.menu), isFlat: false})
			dojo.place(menu.domNode, self.dvMenu)

			leftFooter = apstrata.cms.HierachicalDnDList({store: getMenuStore(doc.leftFooter), isFlat: false})
			dojo.place(leftFooter.domNode, self.dvFooterL)
	
			rightFooter = apstrata.cms.HierachicalDnDList({store: getMenuStore(doc.rightFooter), isFlat: false})
			dojo.place(rightFooter.domNode, self.dvFooterR)
		})		

		var button = new dijit.form.Button({label: "save", onClick: function() {
			console.dir(menu.get("value"))
	
			var o = {
				"apsdb.documentKey": "menu",
				menu: dojo.toJson(menu.get("value")),
				leftFooter: dojo.toJson(leftFooter.get("value")),
				rightFooter: dojo.toJson(rightFooter.get("value")),
				menuPhp: apstrata.cms.toPhp(menu.get("value")),
				leftFooterPhp: apstrata.cms.toPhp(leftFooter.get("value")),
				rightFooterPhp: apstrata.cms.toPhp(rightFooter.get("value"))
			}
			
			dojo.when(
				self.store.get("menu"),
				function() {
					self.store.put(o)
				},
				function() {
					self.store.add(o)
				}
			)
		}})
		dojo.place(button.domNode, this.dvActions, "last")
		
		this.inherited(arguments)
	}
	
})