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
dojo.provide('apstrata.widgets.DomUtils');

dojo.declare("apstrata.widgets.DomUtils", [], {})

apstrata.setPosition = function(n, t, l) {
	dojo.style(n, {
		top: t+"px", 
		left: l+"px"
	})
}

apstrata.animatePosition = function(n, t, l, duration) {
	var _duration = (duration)?duration:200

	dojo.animateProperty({
		node:n,
		duration: _duration,
		properties: {
			top: t, 
			left: l
		}
	}).play();
}

apstrata.setSize = function(n, w, h) {
	dojo.style(n, {
		height: h+"px", 
		width: w+"px"
	})
}

apstrata.removeNode = function(node) {
	if ((node) && (node.parentNode)) {
		node.parentNode.removeChild(node)
		node = undefined
	}
}

apstrata.showNode = function(node, duration, onEnd) {
	var _duration = (duration)?duration:100
	
    dojo.style(node, "opacity", "0");

    var fadeArgs = {
        node: node,
		duration: _duration,
		onEnd: onEnd
    };
    dojo.fadeIn(fadeArgs).play();
}

apstrata.hideNode = function(node, duration, onEnd) {
	var _duration = (duration)?duration:100

    var fadeArgs = {
        node: node,
		duration: _duration,
		onEnd: onEnd
    };
    dojo.fadeOut(fadeArgs).play();
}
