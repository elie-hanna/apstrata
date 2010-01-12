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

dojo.provide('apstrata.util.DocumentUtils')
 
dojo.declare('apstrata.util.DocumentUtils', [], {
	getProperty: function(doc, name, index) {
		var found = false
		var value 
		
		if (!index) index = 0
	
		dojo.forEach(doc.fields, function(f) {
			if (found) return
			if (f["@name"] == name) {
				found = true
				
				if (index<f.values.length) value = f.values[index]
			}
		})
		
		return value
	},

	copyToObject: function(o, doc) {
		for (key in o) {
			o[key] = this.getProperty(doc, key)
		}
		
		return o
	}
})

apstrata.documentUtils = new apstrata.util.DocumentUtils()


