dojo.provide("apstrata.apsdb.client.widgets.ConnectionError");

dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");

dojo.declare("apstrata.apsdb.client.widgets.ConnectionError",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl("apstrata.apsdb.client.widgets", "templates/ConnectionError.html"),
		
		constructor: function(/* apstrata.apsdb.client.client.apsdb.Connection */ connection) {
			this.connection = connection
		},
		
		postCreate: function() {
			var self = this;
			
			dojo.connect(self.connection.activity, "timeout", function(url) {
				self.dlgError.show();
				self.spnErrorUrl.innerHTML = "apstrata request:<br />"+url
			})

			dojo.connect(self.btnCommErrorClose, "onClick", function() {
				self.dlgError.hide()
			});
			
			dojo.connect(self.btnCommErrorRetry, "onClick", function() {
				self.retry();
			})
			
			dojo.connect(self.connection, "registerRetryOperation", function(retryOperation) {
console.dir(retryOperation)
				self.retryOperation = retryOperation;
			})
		},

		hide: function() {
			this.dlgError.hide();
console.dir(this.retryOperation)
			if (this.retryOperation != undefined) {
				this.retryOperation.timeoutHandler();	
			}
		},
		
		retry: function() {
console.dir(this.retryOperation)
			if (this.retryOperation != undefined) {
				this.retryOperation.execute();	
			}
		}
	});
