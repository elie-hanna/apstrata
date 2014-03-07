dojo.provide('apstrata.ui.Utility');

dojo.setObject("dom.globals", {
	"handleResponseCleanup": function(domNode, successClass, failureClass) {
		domNode.innerHTML = "";
		dojo.style(domNode, "display", "none");
		dojo.removeClass(domNode, successClass);
		dojo.removeClass(domNode, failureClass);
	},
	"handleResponseDisplay": function(message, className, displayMode, domNode) {
		if(displayMode == 'inline') {
			domNode.innerHTML = message;
			dojo.style(domNode, "display", "");
			dojo.addClass(domNode, className);
			dojo.window.scrollIntoView(domNode);
		} else {
			//Handle Dialogs
		}
	},
	"showLoading": function(message, loadingClass, displayMode, domNode) {
		if(displayMode == 'inline') {
			domNode.innerHTML = message;
			dojo.style(domNode, "display", "");
			dojo.addClass(domNode, loadingClass);
			dojo.window.scrollIntoView(domNode);
		}
	},
	"hideLoading": function(domNode, loadingClass) {
		domNode.innerHTML = "";
		dojo.style(domNode, "display", "none");
		dojo.removeClass(domNode, loadingClass);
	}
});
