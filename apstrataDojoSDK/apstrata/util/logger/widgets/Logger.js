dojo.provide("apstrata.dojo.widgets.util.Logger");

dojo.require("apstrata.dojo.client.util.Logger")

dojo.declare("apstrata.dojo.widgets.util.Logger",
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl("apstrata.dojo.widgets.util", "templates/Logger.html"),
		
		constructor: function(/* apstrata.dojo.client.apsdb.Connection */ connection) {
			var self = this
			
			this.logger = new apstrata.dojo.client.util.Logger();
			var os = ""
			dojo.connect(APSTRATA_CORE.logConfig.buffer, "push", function(o) {
				if (typeof o.o == "string") os = o.o;
				var d = new Date()
				d.setTime(o.t)
				self.msg("["+d+"|"+o.c+"|"+o.l+"]:"+o.m+":"+os)
//				{t: time, c:this.className, l:level, m:msg, o:(o!=undefined)?o:""}
			})
		},
		
		msg: function(text) {
			this.fldMessage.textContent = this.fldMessage.textContent + "\n" + text
			this.fldMessage.setSelectionRange(this.fldMessage.textContent.length-1, this.fldMessage.textContent.length-1); 
			this.fldMessage.scrollTop = this.fldMessage.scrollHeight
			
			this.divMessages.innerHTML = this.divMessages.innerHTML+"<div style='color: red'>" + text + "</div>"
		}
		
	});
