dojo.provide("apstrata.apsdb.SaveDocument");

dojo.require ("dojo.io.script");
dojo.require ("dojox.xml.parser");


dojo.declare("apstrata.apsdb.SaveDocument",
[apstrata.apsdb.Get],
{
    apsdbOperation: "SaveDocument",
    
    constructor: function(auth, store, fields) {
	this.request.apsdb.store = store;

	for (prop in fields) {
	    this.request[prop] = fields[prop];
	}
    },

    execute: function() {
	
	this.inherited(arguments);
    }
});
