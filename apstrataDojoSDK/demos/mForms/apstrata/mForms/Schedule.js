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

dojo.provide("apstrata.mForms.Schedule")
dojo.provide("apstrata.mForms.ScheduleForm")

dojo.require("dijit.form.ValidationTextBox")
dojo.require("dijit.form.Button")
dojo.require("dojox.widget.Calendar")
dojo.require("dijit.form.TimeTextBox")
dojo.require("dijit.form.DateTextBox")
dojo.require("dijit.form.SimpleTextarea")
dojo.require('dijit.form.FilteringSelect')

dojo.require('dijit.Editor')
dojo.require("dojo.data.ItemFileReadStore")
dojo.require("dijit.form.ComboBox")


dojo.declare("apstrata.mForms.ScheduleForm", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.mForms", "templates/ScheduleForm.html"),
	maximizePanel: true,
	
	storeName: "DefaultStore",
	
	constructor: function() {
	},
	
	refreshTargetsList: function() {
		var self = this
		
		this.getContainer().client.call({
			action: "Query",
			request: {
				apsdb: {
					store: self.storeName,
					query: "formType=\"targetGroup\"",
					queryFields: "apsdb.documentKey,targetName,description,members"
				}
			},
			load: function(operation){
				// Rearrange the result to suite the template
				
				var data = {label: "targetName", identifier: "documentKey"}
				data.items = []
				
				dojo.forEach(operation.response.result.documents, function(document){
					data.items.push({
						documentKey: document.fields[0].values[0],
						targetName: document.fields[1].values[0]
					})
				})

console.dir(data)
		        var targetsStore = new dojo.data.ItemFileReadStore({
					data: data
//		            url: "http://docs.dojocampus.org/moin_static163/js/dojo/trunk/dijit/tests/_data/states.json"
		        });
console.dir(targetsStore)
		        var filteringSelect = new dijit.form.ComboBox({
		            name: "target",
		            value: "",
		            store: targetsStore,
		            searchAttr: "targetName"
		        },
		        self.dvSelectTarget);
				
			},
			error: function(operation){
			}
		});
	},
	
	postCreate: function() {
		this.refreshTargetsList()
		this.inherited(arguments)
	},
	
	save: function() {
		
	}
})
