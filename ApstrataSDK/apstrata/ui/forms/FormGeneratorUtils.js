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
dojo.provide("apstrata.ui.forms.FormGeneratorUtils")


/**
 * Infers the a formDefinition from an arbitrary object
 * 
 * @param {Object} object to introspect
 * @param {string} optional form title
 * @param {Object} optional map that provides type definition
 * @param {string} optional comma separated list indicating preferred field order
 */
apstrata.ui.forms.FormGeneratorUtils.getDefinitionFromObject = function(object, options) {
	console.warn ("EXPERIMENTAL: apstrata.ui.forms.FormGeneratorUtils.getDefinitionFromObject --- doesn't always provide an accurate detection of data types.")
	
	var formDefinition = {
		label: options.title?options.title:"Edit object",
		fieldset: []
	}
	
	if (options && options.actions) formDefinition.actions = options.actions
	
	var o = dojo.clone(object)
	
	var tmpFieldset={}

	for (key in o) {
		
		var type = "text"
		
		var v = o[key]
		var evalv = null
		
		// This is needed to infer the type is boolean in case the value is the string literal isn't all lower case "true" or "false"
		try {
			evalv = eval(v)
		} catch(e) {
			try {
				evalv = eval(v.toLowerCase())
			} catch(e) {
			}
		}
		
		if (typeof v == "number") {
			type = "number"
		} else if (typeof v == "boolean") {
			type = "boolean"
		} else if (typeof evalv == "boolean") {
			type = "boolean"
		} else if (((new Date(v))+"") != "Invalid Date") {
			type = "dateTime"
			o[key] = new Date(v)
		}
		
		tmpFieldset[key] = {
			name: key,
			label: key,
			type: type
		}
	}
	
	if (options.order) {
		var order = options.order.split(",")
		
		dojo.forEach(order, function(key) {
			if (tmpFieldset[key]) {
				formDefinition.fieldset.push(tmpFieldset[key])
				delete tmpFieldset[key]
			}
		})
		
		for (k in tmpFieldset) {
			formDefinition.fieldset.push(tmpFieldset[k])
		}
	} else {
		for (k in tmpFieldset) {
			formDefinition.fieldset.push(tmpFieldset[k])
		}
	}
	
	return {
		definition: formDefinition,
		value: o
	}	
} 