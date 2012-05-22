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
dojo.provide("apstrata.horizon.blue.TestPanel")

dojo.require("apstrata.horizon.Panel")

dojo.declare("apstrata.horizon.blue.TestPanel", 
[apstrata.horizon.Panel], 
{
	width: 200,
	templateString: "<div class='panel' style='width: {{ width }}px'><button dojoAttachEvent='onclick: click'>open</button></div>",
	
	click: function() {
		this.openPanel(apstrata.horizon.blue.TestPanel)
	},
	
	postCreate: function() {
		var self = this
			console.debug(self.id)
			console.dir(dojo.position(self.domNode))


		setTimeout(function() {
			
		}, 1)
		this.inherited(arguments)
	}

	
})


