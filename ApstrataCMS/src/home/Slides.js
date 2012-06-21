dojo.provide("apstrata.home.Slides")

dojo.require("dojox.dtl._Templated")
dojo.require("dojo.store.Memory")
dojo.require("dojo.fx")

dojo.declare("apstrata.home.Slides", 
[dijit._Widget, dojox.dtl._Templated], 
{

	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.home", "templates/Slides.html"),
	
	slides1: [
		{title: "Content and Media", text: "Content and Media are at the heart of a mobile & web applications. Apstrata provides a full fledged Content and Rich Media management system available through its comprehensive APIs. The features include: typed fields, validation, field-level security, powerful SQL like query capability, full-text indexing and search, rich media handling and cache control."},
		{title: "simple API calls", text: "We provide a number of standard scripts that enable SSO and posting messages or content to social networks such as Facebook and Twitter. The scripts can be customized to accomodate other needed functionality."},
		{title: "Most mobile applications", text: "Most mobile applications require also the presence of a web application counterpart. The apstrata APIs are usable directly from within HTML 5 and javascript applications. We provide plenty of sample applications and code to get you started in the development of your mobile or web solution based on apstrata."}
	],
	
	slides: null,
	i: 0,
	
	actions: null,
	
	constructor: function() {
		this.actions =  [
		         		{url: apstrata.registry.get("apstrata.cms", "urlPrefix") + "dashboard", label: "login"},
		        		{url: apstrata.registry.get("apstrata.cms", "urlPrefix") + "register", label: "register"}
		        	];
	},

	postCreate: function() {
		this._initSlideContent()	
		this.inherited(arguments)	
	},
	
	_initSlideContent: function() {
		var self = this

		var fadeInArgs = {
			node: self.dvSlide
		}
		
		var fadeOutArgs = {
			node: self.dvSlide,
			onEnd: function() {
				self.dvSlogan.innerHTML = self.slides[self.i].slogan
				self.dvText.innerHTML = self.slides[self.i].text
				dojo.fadeIn(fadeInArgs).play()
			}
		}
		
		dojo.fadeOut(fadeOutArgs).play()

		
		for (var i=0; i<self.slides.length; i++) {
			dojo.removeClass(self['dvSelector'+i], "selectedSelector")
		}
		
		dojo.addClass(self['dvSelector'+self.i], "selectedSelector")
	},


	_changeSlide: function(e) {
		this.i = dojo.attr(e.currentTarget, "data-index")
		this._initSlideContent()
	},

	_previous: function() {
		var self = this

		self.i--
		if (self.i<0) self.i = self.slides.length-1
		self._initSlideContent()
	},
	
	_next: function() {
		var self = this

		self.i++
		self.i = self.i % self.slides.length
		self._initSlideContent()
	}
})
