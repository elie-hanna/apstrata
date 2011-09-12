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

dojo.provide('apstrata.widgets.PageNumberSelector');

        dojo.require('dojo.parser');
		dojo.require('dijit.form.Button');


		dojo.declare("apstrata.widgets.PageNumberSelector", [dijit._Widget, dijit._Templated], {
			templateString: "<div></div>",
			min: 1,
			max: 10,
			value: 1,
			bigStep: 5,
			visibleRange: 10,
			
			constructor: function(attrs) {
				this.enableScroll = true
				this._MOVE_LEFT = 10
				this._MOVE_RIGHT = 11
				this._SCROLL_LEFT = 20
				this._SCROLL_RIGHT = 21
				
				this._center= 0

				if (attrs.min) this.min = attrs.min
				if (attrs.max) this.max = attrs.max
				if (attrs.value) this.value = attrs.value
				if (attrs.bigStep) this.bigStep = attrs.bigStep
				if (attrs.visibleRange) this.visibleRange = attrs.visibleRange
				
				this.enableScroll = (this.visibleRange <= this.max-this.min)
				
				//if (this.visibleRange > this.max-this.min) this.visibleRange = this.max - this.min + 1
			},
			
			setValue: function(v) {
				if (v < this.min) this.value = this.min
				if (v > this.max) this.value = this.max

				this._center = v
				this._init(0, v)				
				this.renderPageList()
				this.onChange(v)
			},
			
			_newButton: function(label, style, callback) {
				b = new dijit.form.Button({label: label, style: style})
				dojo.place(b.domNode, this.domNode, "last")
				dojo.connect(b, "onClick", callback)				
			},
			
			_init: function(move, value) {
				var self = this
				
				if (move) switch(move) {
					case self._MOVE_LEFT:
						self._center--
						break;

					case self._MOVE_RIGHT:
						self._center++
						break;

					case self._SCROLL_LEFT:
						self._center -= self.bigStep
						break;

					case self._SCROLL_RIGHT:
						self._center += self.bigStep
						break;
				}
				
				var _minCenter =  self.min + Math.floor(self.visibleRange / 2)
				var _maxCenter =  self.max - Math.floor(self.visibleRange / 2)
				
				if (self._center < _minCenter) self._center = _minCenter
				if (self._center > _maxCenter) self._center = _maxCenter
				
				if (value) {
					self.value = value
				}
			},
			
			renderPageList: function() {
				var self = this

				var min = this.min
				var max = this.max
				
				var b
				this.domNode.innerHTML = ""
				
				if (this.enableScroll) {
					min = this._center - Math.floor(self.visibleRange / 2)
					max = this._center + Math.floor(self.visibleRange / 2) 
				} 
								
				if (this.enableScroll) {
					this._newButton("<<", "", function() {
						if (min>self.min) {
							self._init(self._SCROLL_LEFT)
							self.renderPageList()
						} 
					})
	
					this._newButton("<", "", function() {
						if (min>self.min) {
							self._init(self._MOVE_LEFT)
							self.renderPageList()
						}
					})
				}

				for (var i=min; i<=max; i++) {
					var style = ""
					
					if (i == self.value) style += "color: red;"
					
					this._newButton(i, style, function() {
						self.setValue(this.label)
					})
				}

				if (this.enableScroll) {
					this._newButton(">", "", function(){
						if (max <= self.max) {
							self._init(self._MOVE_RIGHT)
							self.renderPageList()
						}
					})
					
					this._newButton(">>", "", function(){
						if (max <= self.max) {
							self._init(self._SCROLL_RIGHT)
							self.renderPageList()
						}
					})
				}
			},
			
			postCreate: function() {
				var self = this
				this._init()				
				this.renderPageList()
			},
			
			onChange: function(value) {}
		})
