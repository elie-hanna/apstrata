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
dojo.provide("apstrata.horizon.PanelIcons")

dojo.declare("apstrata.horizon.PanelIcons", 
[dijit._Widget, dojox.dtl._Templated], 
{
	widgetsInTemplate: true,
	templateString: "<div style='position: absolute;top:3px;left:3px;' ><img dojoAttachPoint='img' dojoAttachEvent='onclick: click' src='{{ _horizonRoot }}/resources/images/pencil-icons/round-maximize.png' style='width: 16px;'></div>",
	
	maximized: false,
	
	click: function() {
		var self = this

		if (this.maximized) {
			this.maximized = false
			this.restore()

			this.img.setAttribute("src", self._horizonRoot + "/resources/images/pencil-icons/round-maximize.png")
		} else {
			this.maximized = true
			this.maximize()

			this.img.setAttribute("src", self._horizonRoot + "/resources/images/pencil-icons/round-minimize.png")
		}
	},
	
	maximize: function() {},
	restore: function() {}
	
	
})


