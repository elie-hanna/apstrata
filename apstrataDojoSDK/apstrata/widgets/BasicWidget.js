dojo.provide("apstrata.widgets.BasicWidget")

dojo.require("dijit._Templated")
dojo.require("dijit._Widget")

dojo.declare("apstrata.widgets.BasicWidget", 
[dijit._Widget, dijit._Templated], 
{
	templateString: "<div><a href='#' dojoAttachEvent='onclick: click'>Hi</div>",
	
	click: function() {
		alert('click')
	}
})
