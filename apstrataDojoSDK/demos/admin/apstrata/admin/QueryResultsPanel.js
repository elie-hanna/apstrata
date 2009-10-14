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

dojo.provide("apstrata.admin.QueryResultsPanel")


dojo.require('apstrata.apsdb.client.ItemApsdbReadStore')
dojo.require('apstrata.widgets.QueryWidget')


dojo.declare("apstrata.admin.QueryResultsPanel", 
[apstrata.widgets.HStackablePanel], 
{
	constructor: function(attrs) {
		this.attrs = attrs
	},

	postCreate: function() {
		var self = this
		
		dojo.addClass(this.domNode, 'nihilo')
	
		dojo.style(this.domNode, {
			width: "800px",
		})
		var grid = new apstrata.widgets.QueryWidget(this.attrs);
//		dojo.place(grid.domNode, this.dvGrid, "only");

		this.addChild(grid)		
		this.inherited(arguments)
	}
	
})
