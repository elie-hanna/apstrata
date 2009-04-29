dojo.provide("apstrata.apsdb.CreateStore");

dojo.declare("apstrata.apsdb.CreateStore",
[apstrata.apsdb.Get],
{
    apsdbOperation: "CreateStore",
		    
    execute: function(name) {
	this.request.apsdb.store = name;

	this.inherited(arguments);
    }
});

