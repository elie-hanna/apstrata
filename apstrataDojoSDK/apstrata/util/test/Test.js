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

dojo.provide("apstrata.util.test.Test")

dojo.declare("apstrata.util.test.Test", 
				[],
				{
					constructor: function() {
						this.index = 0
					},
					
					executeNext: function() {
						var self = this
						
						if (self.index > (self.testSequence.length-1)) {
							self.runner.print("<h3 class='success' id='all'>Success</h3>")
						} else {
							var command = this.testSequence[this.index++]
							apstrata.log(self.declaredClass, "Running Command: " + command)
							dojo.hitch(self, command)()
						}
					},

					run: function(runner) {
						this.runner = runner
						this.executeNext()
					}
					
				})
