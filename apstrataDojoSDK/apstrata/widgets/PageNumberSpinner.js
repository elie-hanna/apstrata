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

dojo.provide('apstrata.widgets.PageNumberSpinner');

dojo.require('dijit.form.Button');
dojo.require('dijit.form.NumberTextBox');


dojo.declare("apstrata.widgets.PageNumberSpinner", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	templateString: "<div><button dojoType='dijit.form.Button' dojoAttachPoint='btnPrevious'><span style='font-size:x-small'>&lt;</span></button>" + "<input type='text' dojoType='dijit.form.NumberTextBox' dojoAttachPoint='fldValue' maxLength='3' constraints='{places:0,min:0,max:120}' style='width:3em;height:1.8em;'></input>" + "<button dojoType='dijit.form.Button' dojoAttachPoint='btnNext'><span style='font-size:x-small'>&gt;</span></button></div>",
	min: 0,
	max: 10,
	value: 0,
	
	constructor: function(attrs){
		if (attrs.min) this.min = attrs.min
		if (attrs.max) this.max = attrs.max
		if (attrs.value) this.value = attrs.value
	},
	
	postCreate: function() {
		var self = this
		
		self.fldValue.setValue(self.value)
		self.fldValue.constraints.min = self.min
		self.fldValue.constraints.max = self.max
		
		dojo.connect(this.btnPrevious, "onClick", function() {
			if (self.fldValue.getValue() > self.min) self.fldValue.setValue(self.fldValue.getValue()-1)
		})
		
		dojo.connect(this.btnNext, "onClick", function() {
			if (self.fldValue.getValue() < self.max) self.fldValue.setValue(self.fldValue.getValue()+1)
		})
		
		dojo.connect(this.fldValue, "onChange", function() {
			self.value = self.fldValue.getValue()
			self.onChange(self.value)
		})
	},
	
	onChange: function(value) {}
})


