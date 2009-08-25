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
dojo.provide("apstrata.util.logger.BasicLogger");

/**
 * This uses firebug to output log messages that provide additional information than plain firebug 'console' methods
 * The class keeps N minutes worth of logs that can be sent to apstrata for diagnostic purposes    
 * @class apstrata.util.logger.BasicLogger
 */
dojo.declare("apstrata.util.logger.BasicLogger",
[],
{
	_blockLevels: [],
	messageBufferRefreshInterval: 3 * (60 * 1000), // in ms
	messages: [], // message buffer 
	
	constructor: function() {
		var self = this
		this.logLevel = this.DEFAULT_LOG_LEVEL;
		this.verbose = true

		if (window.apstrata) {
			if (window.apstrata.logConfig) {
				if (window.apstrata.logConfig.buffer) this.messages = window.apstrata.logConfig.buffer
			}
		}
		
		setInterval(dojo.hitch(this, function() {
			self.log("info", self.declaredClass, ["Clearing last (" + self.messages.length + ") messages from log buffer."])
			self.messages = []
		}), this.messageBufferRefreshInterval)
	},
	
	blockLevels: function(levels) {
		this._blockLevels = levels
	},	

	// TODO: remove this, check if any classes are using it	
	setClassLabel: function(label) {
		this.className = label	
	},
	
	_isObject: function(o) {
	    return !((typeof o == "string") || (typeof o == "number") || (typeof o == "boolean"))
	},

	_getObjectClass: function(o) {
	    if (o.declaredClass != undefined) return "["+o.declaredClass+"]"; else return "[js object]"
	},

	log: function(method, className, args) {
		var block = false
		for (var i=0; i<this._blockLevels.length; i++) {
			if (method == this._blockLevels[i]) {
				block = true
				break;
			}
		}
		
		if (block) return
		
		var time = new Date()
		
		var msg = "[" + method + "|" + time + "|" + className + "]:"

		var messagePrinted = false

		// If the 1st argument is a string and the 2nd an object and no other arguments
		if (!args[3] && !args[4] && !args[5] && !args[6] && !args[7] && !args[8] && !args[9] && !args[10]) {
			if (!this._isObject(args[1]) && this._isObject(args[2])) {

					// console.dir complex object args[2] with args[1] as title
					var o = {}
					o[msg+" "+args[1]+"-->"] = args[2] // This will make 'msg' appear as the title of the object in a console.dir
					console.dir(o)
			
				messagePrinted = true
			}
		}

		if (!messagePrinted) {
			// Else console.dir objects and console.[level] other arguments 
			var bfr = []
			bfr.push(msg)
	
			for (var i=1; i<args.length; i++) {
				if (args[i]) {
					if (this._isObject(args[i])) {
						
						// If I have to output a complex object, display contents of bfr first
						if (bfr.length>1) {
							if (window._firebug) window._firebug.notifyFirebug(bfr, method, "firebugAppendConsole")
							bfr = []
							bfr.push(msg)
						} 
	
						// display complex object args[i]
						var o = {}
						o[msg] = args[i] // This will make 'msg' appear as the title of the object in a console.dir
						console.dir(o)
					} else {
						// put all messages that are not complex objects into bfr
						bfr.push(args[i])
						//window._firebug.notifyFirebug([msg + args[i]], method, "firebugAppendConsole")
					}
				}
			}
	
			if (bfr.length>1) {
				if (window._firebug) window._firebug.notifyFirebug(bfr, method, "firebugAppendConsole")
			} 
		}
		
		

		if (this.messages) this.messages.push({t: time.getTime(), c:className, l:method, a: args});
	},
	
	_className: function(object) {
		if (object.declaredClass) return object.declaredClass;
		else return this.declaredClass
	},
	
	warn: function(object, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
		this.log("warn", this._className(object), arguments)
	},

	info: function(object, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
		this.log("info", this._className(object), arguments)
	},
	
	debug: function(object, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
		this.log("debug", this._className(object), arguments)
	},
	
	error: function(object, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
		this.log("error", this._className(object), arguments)
	},
	
	group: function(title) {
		//console.groupCollapsed(title)
	},
	
	endGroup: function() {
		//console.groupEnd()
	}
})