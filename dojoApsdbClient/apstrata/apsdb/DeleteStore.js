dojo.provide("apstrata.apsdb.DeleteStore");

dojo.declare("apstrata.apsdb.DeleteStore",
[apstrata.apsdb.Get],
{
    apsdbOperation: "DeleteStore",
    execute: function(name) {
	this.request.apsdb.store = name;
	this.inherited(arguments);
    }
});
