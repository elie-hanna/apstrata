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
dojo.provide("apstrata.util.logger.Loggable");

/**
 * This is a convenience class that is extended by any other class that needs to have a convenient logging feature 
 * @class apstrata.util.logger.Logger
 */
dojo.declare("apstrata.util.logger.Loggable",
[],
{
	warn: function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
		apstrata.logger.warn(this, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
	},

	info: function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
		apstrata.logger.info(this, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
	},
	
	debug: function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
		apstrata.logger.debug(this, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
	},
	
	error: function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
		apstrata.logger.error(this, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
	},

	log: function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
		dojo.deprecated("Logger.log is deprecated, use more specific Logger.info, Logger.warn. Logger.debug. Logger.error instead")
		this.debug(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10)
	},
	
	groupMessages: function(title) {
		var className = (this.className)?this.className:this.declaredClass
		apstrata.logger.group(className + ": " + title)
	},
	
	endGroupMessages: function() {
		apstrata.logger.endGroup()
	}
})