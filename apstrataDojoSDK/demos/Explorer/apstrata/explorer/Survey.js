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

dojo.provide("apstrata.explorer.Survey")

dojo.declare("apstrata.explorer.Survey",
[apstrata.widgets.layout.HStackableList], 
{
	data: [
		{label: "create", iconSrc: "../../apstrata/resources/images/pencil-icons/notepad.png"},
		{label: "view results", iconSrc: "../../apstrata/resources/images/pencil-icons/statistic.png"},	
		{label: "search", iconSrc: "../../apstrata/resources/images/pencil-icons/search.png"},	
	],
	
	onClick: function(index, label) {
		var self = this
		var w
		
		this.closePanel()
		
//		if (label=='create') this.openPanel(apstrata.explorer.BlogPosts)
	}
})
