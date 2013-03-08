dojo.provide("apstrata.sdk.ObjectStoreAdaptor");

dojo.require("dojo.data.ObjectStore");


dojo.declare("apstrata.sdk.ObjectStoreAdaptor", 
[dojo.data.ObjectStore], 
{
	onSet: function(item, attribute, old, value) {
		var object = item
		object[attribute] = value
		this.objectStore.put(object)
	}
})
