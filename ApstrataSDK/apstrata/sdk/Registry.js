dojo.provide("apstrata.sdk.Registry")

apstrata.registry = {
    get: function() {
        var object = dojo.getObject("apstrata.apConfig", true)
        for (var i=0; i<arguments.length; i++) {
            if (object) object = object[arguments[i]]

            if (!object) break

        }
		return (object?dojo.clone(object):null)
    },
	
	set: function() {
		
	}
}
	

