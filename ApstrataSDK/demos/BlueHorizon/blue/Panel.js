/*******************************************************************************
 *  Copyright 2009-2011 Apstrata
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
dojo.provide("apstrata.horizon.blue.Panel")

dojo.require("apstrata.horizon.Panel")

dojo.declare("apstrata.horizon.blue.Panel", 
[apstrata.horizon.Panel], 
{
	widgetsInTemplate: true,
	contentTemplateString: "<div><h2>The panel</h2><button dojoAttachEvent='onclick: showContent'>regen</button><div dojoAttachPoint='dvColors'></div></div>",
	bindEvents: ["showContent"],
	
	maximizable: true,
	content: "",
	
	postCreate: function() {
		dojo.style(this.domNode, "width", "400px")
		
		
		this.inherited(arguments)
	},
	
	showContent: function() {
		var tmp = '<br>'
		var blueHue
		for (var i = 0; i < 400; i++) {

			blueHue = Math.floor(Math.random()*150, 0) + 105
			tmp += "<span style='opacity: .9;margin-top: 12px; -o-border-radius: 5px;-moz-border-radius: 5px;-webkit-border-radius: 5px;border-radius: 5px;padding: 5px; color: rgb(10, " + blueHue + ", 10); background: rgb(10, 10," + blueHue + ")'>"
			tmp += (blueHue+" ") + "</span>"
		}
		this.dvColors.innerHTML = tmp
		
		this.showAsBusy(false)
	},
	
	onAnimationEnd: function() {
		this.showAsBusy(true, "generating a lot of random numbers<br><b>take a deep breath</b>")
		
		setTimeout(dojo.hitch(this, "showContent"), 1000)
		
		this.inherited(arguments)
	}
	
})


