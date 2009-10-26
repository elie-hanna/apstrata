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

dojo.provide("apstrata.admin.StoreOperations")

dojo.declare("apstrata.admin.StoreOperations", 
[apstrata.widgets.HStackableList], 
{
	data: [
		{label: "Query", iconSrc: "../../apstrata/resources/images/pencil-icons/search.png"},
		{label: "Saved Query", iconSrc: "../../apstrata/resources/images/pencil-icons/savedQuery.png"}
	],
	
	constructor: function(attrs) {
		if (attrs) this.target = attrs.target
	},
	
	postCreate: function() {
		var self = this
		
		dojo.publish("/apstrata/documentation/topic", [{
			topic: "apstrata Query APIs",
			id: "QueryAPI"
		}])

		dojo.connect(self, 'onClick', function(index, label) {
			if (label == self._lastLabel) return
			self._lastLabel = label
			
			if (self.openWidget) {
				self.openWidget.destroy()
				delete self.openWidget
			}

			if(label == 'Query') {
				self.openWidget = new apstrata.admin.QueryPanel({parentList: self, container: self.container, target: self.target}) // apstrata.admin.widgets.Query
				self.container.addChild(self.openWidget)
			} 
		})

		this.inherited(arguments)
	},
	
	destroy: function() {
		if (this.openWidget) this.openWidget.destroy()
		this.inherited(arguments)
	}
})

