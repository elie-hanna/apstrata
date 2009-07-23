/*******************************************************************************
 *  Copyright 2009 apstrata
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *
 *  You may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0.html
 *  This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 *  CONDITIONS OF ANY KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations under the License.
 * *****************************************************************************
 */
dojo.provide("apstrata.util.logger.Logger");

dojo.declare("apstrata.util.logger._Logger",
[],
{
	DEBUG: 3,
	INFO: 4,
	CONFIG: 5,
	WARNING: 6,
	ERROR: 7,
	LEVELS: ['Level 0', 'Level 1', 'Level 2', 'Debug', 'Info', 'Config', 'Warning', 'Error'],
	DEFAULT_LOG_LEVEL: 4,
	verbose: true,
	
	constructor: function() {
		this.messages = new Array();
		this.logLevel = this.DEFAULT_LOG_LEVEL;
		this.verbose = true

		if (window.apstrata === undefined) {
		} else {
			if (window.apstrata.logConfig === undefined) {
			} else {
				if (window.apstrata.logConfig.buffer!=undefined) this.messages = window.apstrata.logConfig.buffer
				if (window.apstrata.logConfig.level!=undefined) this.logLevel = window.apstrata.logConfig.level
				if (window.apstrata.logConfig.verbose!=undefined) this.verbose = window.apstrata.logConfig.verbose				
			}
		}
	},
	
	setClassLabel: function(label) {
		this.className = label	
	},
	
	_console: function(msg, o) {
	    if (this.verbose) {
		console.debug(msg)
		
		if (o!=undefined) {
			console.debug("start object:"+this._getObjectClass(o)+" ->");
			console.dir(o);
			console.debug("<- end object:"+ this._getObjectClass(o));                            							
		}
	    }
	},

	_logLevelMsgObject:  function(level, msg, o) {
		if (level<=this.logLevel) return
		
		var levelStr = ((level>=0) && (level<(this.LEVELS.length)))?this.LEVELS[level]:"Level " + level+""
		var time = new Date()
	    
		this.messages.push({t: time.getTime(), c:this.className, l:level, m:msg, o:(o!=undefined)?o:""});

		if (o==undefined) {
			this._console("["+ time + "|" + this.className+ "|" + levelStr + "]:" + msg);
		} else {
			if (this._isObject(o)) {
				this._console("["+ time + "|" + this.className + "|" + levelStr + "]:" + msg, o);
				
			} else {
				this._console("["+ time + "|" + this.className + "|" + levelStr + "]:" + msg + ":" + o);
			}		
		}
	},		

	_logMsg: function(msg) {
	    this._logLevelMsgObject(this.INFO, msg)
	},
	
	_getObjectClass: function(o) {
	    if (o.declaredClass != undefined) return "["+o.declaredClass+"]"; else return "[object]"
	},
	
	_logObject: function(o) {
		this._logLevelMsgObject(this.INFO, this._getObjectClass(o), o)			
	},

	_logMsgObject: function(msg, o) {
		this._logLevelMsgObject(this.INFO, msg, o)
	},
			
	_logLevelObject: function(level, o) {
		this._logLevelMsgObject(level, "", o)
	},
	
	_errorParams: function() {
		throw new Error(this.declaredClass+":logger:"+" wrong parameter types")
	},
	
	_isObject: function(o) {
	    return !((typeof o == "string") || (typeof o == "number") || (typeof o == "boolean"))
	},
	
	setLoggingLevel: function(level) {
	    this.logLevel = level
	}
});

dojo.declare("apstrata.util.logger.Logger",
[],
{
	constructor: function(className) {
	    this._LOGGER = new apstrata.util.logger._Logger()
	    if (className == undefined) this._LOGGER.className = this.declaredClass;
	    else this._LOGGER.className = className
	},   

	log: function(attr1, attr2, attr3) {
		if (attr2 == undefined) {
		    // 1 attribute sent
		    //  either string or object
		    if (this._LOGGER._isObject(attr1)) this._LOGGER._logObject(attr1); else this._LOGGER._logMsg(attr1); 
		} else if (attr3 == undefined) {
		    // 2 attribute2 sent
		    
		    //  either level, string 
		    //  or level, object 
		    if (typeof attr1 == "number") {
			if (this._LOGGER._isObject(attr2)) this._LOGGER._logLevelObject(attr1, attr2); else this._LOGGER._logLevelMsgObject(attr1, attr2)
		    }  else {
		    //  or string, object 
			this._LOGGER._logMsgObject(attr1, attr2)
		    }
		} else {
		    // 3 attributes
		    this._LOGGER._logLevelMsgObject(attr1, attr2, attr3)                            
		}
	}

})


