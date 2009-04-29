dojo.provide("apstrata.apsdb.ListStores");

dojo.declare("apstrata.apsdb.ListStores",
[apstrata.apsdb.Get],
{
    apsdbOperation: "ListStores",
    stores: {},

    handleResult: function() {
	try {
	    this.stores = this.response.result.stores;                                
	} catch (e) {
	}
    }
});
