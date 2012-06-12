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
dojo.provide("apstrata.cms.CMS")

dojo.require("apstrata.horizon.Container")
dojo.require("apstrata.cms.Menu")

dojo.declare("apstrata.cms.CMS", 
[apstrata.horizon.Container], 
{

	constructor: function(attrs) {
		dojo.mixin(this, attrs)
	},
	
	onCredentials: function(credentials) {
		this.connection = new apstrata.sdk.Connection({credentials: credentials})
	},

	startup: function() {
		this.addMainPanel(apstrata.cms.Menu)
		this.inherited(arguments)
	}
})

dojo.setObject("apstrata.cms.toPhp", function(o) {
	var s = "array("
	for (var k in o) {

		if (dojo.isArray(o[k])) {
			var s2 = "array("
			if (o[k].length==0) {
				s2 += "),"				
			} else {
				dojo.forEach(o[k], function(i) {
					s2 += apstrata.cms.toPhp(i) + ","
				})
				
				s2 = s2.substring(0, s2.length-1) +"),"
			}
			s += '"'+k+'"' + "=>" + s2
		} else if (dojo.isObject(o[k])) {
			s += '"'+k+'"' + "=>" + apstrata.cms.toPhp(o[k])+','
		} else {
			s += '"'+k+'"' + "=>" + '"'+o[k]+'",'
		}
	}
	return s.substring(0, s.length-1) +")"
})




