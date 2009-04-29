dojo.provide("apstrata.apsdb.DeleteDocument");

dojo.declare("apstrata.apsdb.DeleteDocument",
[apstrata.apsdb.Get],
{
    apsdbOperation: "DeleteDocument",

    execute: function(store, documentKey) {
	this.request.apsdb.store = store;
	this.request.apsdb.documentKey = documentKey;
	
	this.inherited(arguments);
    }
});

