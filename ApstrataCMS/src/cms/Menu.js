/*******************************************************************************
 *  Copyright 2009-2012 Apstrata
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
dojo.provide("apstrata.cms.Menu")

dojo.require("dojo.store.Memory")
dojo.require("apstrata.horizon.Menu")
dojo.require("apstrata.ui.forms.FormGenerator")
dojo.require("apstrata.cms.MenuEditor")
dojo.require("apstrata.cms.Dashboard")

dojo.declare("apstrata.cms.Menu", 
[apstrata.horizon.Menu], 
{
	items: [
			{
				id:"dashboard", 
				label: "Dashboard",
				panelClass: "apstrata.cms.Dashboard"
			},
			{
				id:"pages", 
				label: "Pages",
				panelClass: "apstrata.cms.Pages"
			},
			{
				id:"links", 
				label: "Links",
				panelClass: "apstrata.cms.Links"
			},
			{
				id:"menu", 
				label: "Menu Editor", 
				panelClass: "apstrata.horizon.WrapperPanel",
				attrs: {
					cssClass: "MenuEditorContainer",
					widgetClass: "apstrata.cms.MenuEditor",
					attrs: {
					} 
				}
			},
			{
				id:"home", 
				label: "Home page editor",
				panelClass: "apstrata.cms.Home"
			},
			{
				id:"homePageEditor", 
				label: "Home",
				panelClass: "apstrata.cms.HomePageEditor"
			},
			{
				id:"posts", 
				label: "Posts"
			},
			{
				id:"postsCategories", 
				label: "Posts Categories"
			},
			{
				id:"tags", 
				label: "Tags"
			},
			{
				id:"media", 
				label: "Media"
			},
			{
				id:"linksCategories", 
				label: "Links Categories"
			}
	],
	
	
	constructor: function(args) {
		var self = this
		//
		// widget attributes
		//
		this.filterable = false
		this.sortable = false
		this.editable = false
		
		this.store = new dojo.store.Memory({data: self.items})
	}	
})


