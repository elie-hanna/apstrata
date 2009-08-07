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

dojo.provide("apstrata.widgets.ListEditor")

dojo.require("dojo.parser")
dojo.require("dijit.form.Button")

dojo.declare("apstrata.widgets.ListEditor", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	templateString: "<div><span class='label'>${label}</span>&nbsp;<span dojoAttachPoint='dvButtons'></span><br><br><div dojoAttachPoint='dvList'></div></div>",
	list: [],
	actions: [],
	lockedActions: [],
	label: "",
	
	constructor: function(attrs) {
		var self = this
		
		if (attrs) {
			if (attrs.lockedActions) this.lockedActions = attrs.lockedActions
			if (attrs.actions) this.actions = attrs.actions
			if (attrs.list) this.list = attrs.list
			if (attrs.label) this.label = attrs.label
		}
	},
	
	action: function(item, actionName) {
		console.debug(actionName, item)
	},
	
	postCreate: function() {
		this._render()
	},

	setList: function(list) {
		this.list = list
		
		this._render()
	},
	
	_renderEditMode: function() {
		var self = this
		
		if (this._btnEdit) {
			this._btnEdit.destroy()
			dojo.disconnect(this._handle)
		}

		this._btnEdit = new dijit.form.Button({label: "stop edit"})
		dojo.place(this._btnEdit.domNode, self.dvButtons, "only")
		
		dojo.query(".lockedActions").forEach(function(node, index, arr){
			node.innerHTML = self._buildActionString(self.list[index], self.lockedActions) 
		});

		this._handle = dojo.connect(this._btnEdit, "onClick", function() {
			self._renderReadMode()
		})
	},
	
	_renderReadMode: function() {
		var self = this

		if (this._btnEdit) {
			this._btnEdit.destroy()
			dojo.disconnect(this._handle)
		}

		this._btnEdit = new dijit.form.Button({label: "edit"})
		dojo.place(this._btnEdit.domNode, self.dvButtons, "only")

		dojo.query(".lockedActions").forEach(function(node, index, arr){
			node.innerHTML = ""
		});

		this._handle = dojo.connect(this._btnEdit, "onClick", function() {
			self._renderEditMode()
		})
	},
	
	_buildActionString: function(item, actionsList) {
		var self = this

		var actionsStr = ""
		dojo.forEach(actionsList, function(action) {
			actionsStr += "<a class='action' href='#' onclick='dijit.byId(\"" + self.id + "\").action(\"" + item + "\", \"" + action + "\")'>" + action + "</a>&nbsp;"
		})		

		return actionsStr
	},
	
	_render: function() {
		var self = this
		
		var html = ""
		dojo.forEach(self.list, function(item) {
			html += "<span class='lockedActions'></span>&nbsp"
			html += "<span class='value'>" + item + "</span>&nbsp;"
			html += "<span class='actions'>" + self._buildActionString(item, self.actions) + "</span><br>"
		})
		
		this.dvList.innerHTML = html
		
		if (self.list && self.list.length>0) self._renderReadMode()
	}

})