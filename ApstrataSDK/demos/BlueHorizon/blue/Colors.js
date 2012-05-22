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
dojo.provide("apstrata.horizon.blue.Colors")

dojo.require("dojo.store.Memory")

dojo.require("apstrata.horizon.util.TestDataSets")
 
dojo.declare("apstrata.horizon.blue.Colors", 
[apstrata.horizon.List], 
{	
	//
	// widget attributes
	//
	filterable: true,
	sortable: true,
	editable: false,
	
	idProperty: 'number',
	labelProperty: 'name',


	constructor: function(args) {
		var self = this
		var testData = new apstrata.horizon.util.TestDataSets()

		self.items = testData.crayolaColors
		dojo.forEach(self.items, function(item) {
			item.name = "<span style='background:"+ item.code +";'>&nbsp;&nbsp;&nbsp;</span>&nbsp;" + item.name + "&nbsp;" + item.code
		})

		this.store = new dojo.store.Memory({data: testData.crayolaColors})
		
		if (args && args.colorId) this.myColor = this.store.get(args.colorId+"")
	},
	
	postCreate: function() {
		var self = this
		dojo.style(this.domNode, "width", "300px")
		this.inherited(arguments)
	},
	
	startup: function() {
		if (this.myColor) dojo.style(this.domNode, "background", this.myColor.code)
		
		this.inherited(arguments)
	},
		
	onClick: function(index, id, args) {
		var self = this
		this.openPanel(apstrata.horizon.blue.Colors, {colorId: id, selectIds: args.selectIds})
		this.inherited(arguments)
	}
})
