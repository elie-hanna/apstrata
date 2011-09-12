dojo.provide('apstrata.widgets.presentation.Presentation');

dojo.require('dojox.dtl._Templated');
dojo.require('dijit.form.Button');
dojo.require('dojo.fx.easing');

dojo.require('apstrata.widgets.Alert');

dojo.require('apstrata.apsdb.client.Connection');

dojo.declare("apstrata.widgets.presentation.Presentation", 
	[dijit._Widget, dojox.dtl._Templated], 
	{
	    templatePath: dojo.moduleUrl("apstrata.widgets.presentation","templates/presentation.html"),
		widgetsInTemplate: true,
		slides: '',
		viewport: '',
		summaryUrl: '',
		title: '',
		connection: null,
		
		constructor: function(attrs) {
			if (attrs && attrs.slides) this.slides = attrs.slides;
			
			this._slideBuffer = {}
			this._index = 0
			this.totalSlides = this.slides.length
			this.currentSlideIndex =  1

			// Insert loading animation for summary
			this.summaryText = "<br><br><br><div style='text-align: center; width:100%;'><img src='../../apstrata/resources/images/apstrata-clouds.gif'></div><br><br><br>"
			
			apstrata.presentation = this
		},
		
		postCreate: function() {
			var self = this

			// AJAX Load the summary text, based on summaryUrl
			dojo.xhrGet({
				url: self.summaryUrl,
				handleAs: 'text',
				
				load: function(template) {
					// the next this.render() will render the summary in place
					self.summaryText = template

					// Parse URL to display the requested page
					self._parseUrl()
				},
				
				error: function() {
					// not found
					// the next this.render() will render the summary in place
					self.summaryText = ''

					// Parse URL to display the requested page
					self._parseUrl()
				}
			})
		},
		
		/*
		 * Look at the page URL and parse the # to display appropriate slide or slide/dialog
		 */
		_parseUrl: function() {
			var page = ((window.location + "").split("#"))
			
			if (!page[1]) 
				this.jump(0)
			else {
				this.jump(parseInt(page[1]))
				
				/* This doesn't work like that need for the slide to load first
				 * It allows hyperlinks to open subslides directly
				if (page[2]) {
					var sub = page[2].split('sub:')
					console.debug(sub[1])
					if (sub[1]) this.showSubSlide(sub[1])
				}
				*/
			}
		},
		
		//
		// Navigation functions
		//
		
		/*
		 * Jump to first slide
		 */
		first: function() {
			this.jump(0)
		},
		
		/*
		 * Jump to last slide
		 */
		last: function() {
			this.jump(this.slides.length-1)
		},

		/*
		 * Move to previous slide
		 */
		previous: function() {
			if (this._index>0) {
				this._index--
				this.jump(this._index)
			}
			console.debug('previous slide')			
		},
		
		/*
		 * Move to next slide
		 */
		next: function() {
			if (this._index<(this.slides.length-1)) {
				this._index++
				this.jump(this._index)
			}
			console.debug('next slide')
		},
		
		
		/*
		 * Jump to given slide
		 */
		jump: function(/* integer */ index) {
			var self = this
			
			// just in case one of the dialogs is open
			this.hideSourceCodeViewer()
			this.hideSubSlide()

			// Set the template variables
			this._index = index
			this.currentSlideIndex = index + 1

			// Reset the URL to an appropriate format
			var url = ((window.location + "").split("#"))[0]
			window.location = url + "#" + this._index

			// Render will make sure the template variables are displayed into the presentation template
			this.render()

			// Find out if the slide has been loaded previously and display it
			if (this._slideBuffer[this._index]) {
				this.currentSlide = this._slideBuffer[this._index]
				
				this._displaySlide()
			} else {
				// Otherwise load it from the remote location
				this._loadSlide(
					this.slides[this._index], 
					function() {
						self._displaySlide()
					}, function() {
						self._displayErrorSlide()
					})
			}

		},
		
		/*
		 * Displays an animation in the viewport before loading a remote slide
		 */
		_displayWaitingAnimation: function() {
			this.dvViewport.innerHTML = "<div style='text-align: center;width:100%;height:100%'><img style='position: relative; top: 245px;' src='"+this._apstrataRoot+"/themes/apstrata/images/loading-circle-big.gif'></div>"
		},
		
		/*
		 * If a slide loading error occurs, displays the Cat error slide
		 */
		_displayErrorSlide: function() {
			this.dvViewport.innerHTML = "<div style='text-align: center;width:100%;height:100%'><div style='position: relative; top: 235px;text-align: center;'><img width='120' src='"+this._apstrataRoot+"/themes/apstrata/images/cat-chasing-tale.gif'><br><span style='font-size: 1.6em;'>ca't find slide " + this.currentSlideIndex + "!</span></div></div>"

			// the slide couldn't load
			this._errorLoading = true 
			
			// Set a timeout afterwhich the dialog defined in _catAlert() loads
			setTimeout(dojo.hitch(this, "_catAlert"), 5000)
		},
		
		/*
		 * Insert the loaded slide properly into the DOM, fix the anchors URL to link properly to the subslides
		 *  if linked directly.
		 */
		_displaySlide: function() {
			var self = this
			
			// Reset the error indicator because the current slide we're trying 
			// to display has already been loaded for this function to be called
			this._errorLoading = false 

			dojo.place(this.currentSlide.domNode, this.viewport, "only")
			
			// Prepend each <a with the actual #[pageNumber] this slide appears on 
			//  so the final URL points to the proper page and dialog
			
			// Get all the links on slide
			var links = dojo.query('a', 'viewport')
			
			dojo.forEach(links, function(link) {
				var sub = link.href.split("#sub:") 
				
				// If the proper dialog linking syntax is found, prepend with the page #
				if (sub[1]) {
					link.href = "#" + self._index + "#sub:" + sub[1]
					
					// attach the proper event to open the dialog when this link is clicked
					dojo.connect(link, 'onclick', function() {
						self.showSubSlide(sub[1])
					})
				}
			})
		},

		/*
		 * Loads the slide template from disk and creates dynamically a widget to represent the slide  
		 * 
		 */
		_loadSlide: function(url, success, failure) {
			var self = this

				this._displayWaitingAnimation()
				
				var args = {
					url: url,
					handleAs: 'text',
					
					load: function(template) {
						// On succesful load of a slide DTL template, create a new widget and set the template
						//  as its template, provide some other context informatino such as curePage id & total pages

						dojo.declare("_CurrentSlide", 
							[dijit._Widget, dojox.dtl._Templated], 
							{
								templateString: template,
								widgetsInTemplate: true,
								curPage: self._index,
								pages: self.slides.length,
								
								// This is an interesting technique to get some code to execute automatically
								// at the top of the script in the slide
								// script: "connection = apstrata.presentation.connection",
								// {{ scriptHeader|safe }} will be substituted by any code in script before the script is
								// executed
								
								constructor: function() {
								}
							})
							
						self.currentSlide = new _CurrentSlide()
						self._slideBuffer[self._index] = self.currentSlide

						// Separating the <script from the rest of <html code
						//  for the 'view source' dialog
						var part1 = template.split('<script>')
						var html = ''
						var script = ''
			
						if (part1[1]) {
						    var html1 = part1[0]
						
						    var part2 = part1[1].split('</script>')
						    
						    if (part2[1]) {
						        html = html1 + part2[1]
						        script = part2[0]
						    } else {
								html = template
							}
						} else {
						    html = template
						}

						self.currentSlide.templateHTML = dojo.trim(html)
						self.currentSlide.templateScript = dojo.trim(script)

						success()
					},
					
					error: function() {
						failure()
					}
				}
				
				dojo.xhrGet(args)
		},
		
		//
		// Dialog management functions
		//
		
		
		/*
		 * Display the cat slide 
		 */
		_catAlert: function() {
			if (this._errorLoading) {
				var msg = "<span style='font-size: 4em;font-weight:bold;color: #0066AA'>The cat is cute,<br> but if you keep looking at it, you'll get sick!<br><br></span>"
				msg += "<span style='font-size: 3em;font-weight:bold;color: #ff6600'>Sorry for the glitch, check out the next or the previous slides!</span>"
				
				dojo.byId('messageViewerContents').innerHTML = msg
				this.showDialog('messageViewer')
			}
		},
		
		_escapeHTML: function (/* string */ str) {                                        
	        return str.replace(/&/g,'&amp;').replace(/>/g,'&gt;').replace(/</g,'&lt;').replace(/"/g,'&quot;').replace('\n', '<br>').replace('\r', '<br>')
	    },
		
		/*
		 * Display a tabbed dialog based on the layout of an existing div
		 */
		showDialog: function(/* string */ id) {
			var dialog = dojo.byId(id) 
			dojo.style(dialog, {
				visibility: "visible",
				left: "-1000px",
				height: "50px",
				"zIndex": 99999
			})

			// Setup the basic animation for hiding/showing the Panel
			var _animation = {
				node: dialog,
				easing: dojo.fx.easing.bounceOut,
				duration: 600,
				onEnd: function() {
				}
			}

			// The animation coordinates top/left have already been calculated during resize
			_animation.properties = {
				left: 65,
				height: 500
			}
			
			dojo.animateProperty(_animation).play()
		},
		
		/*
		 * Hide tabbed dialog
		 */
		hideDialog: function(/* string */ id) {
			var dialog = dojo.byId(id) 

			// Setup the basic animation for hiding/showing the Panel
			var _animation = {
				node: dialog,
				easing: dojo.fx.easing.backIn,
				duration: 500,
				onEnd: function() {
					dojo.style(dialog, {
						visibility: "hidden"
					})
				}
			}

			// The animation coordinates top/left have already been calculated during resize
			_animation.properties = {
				left: -1000
			}
			
			dojo.animateProperty(_animation).play()
		},
		
		/*
		 * Shows the 'view source' dialog
		 */
		showSourceCodeViewer: function() {
			this.showDialog('sourceViewer')
			
			// If the slide has a <script tag, show that first
			if (this.currentSlide.templateScript!='') this.viewScript();
			else this.viewHTML();
		},
		
		/*
		 * Hide the 'view source' dialog
		 */
		hideSourceCodeViewer: function() {
			this.hideDialog('sourceViewer')
		},

		/*
		 * Displays the javascript of a particular slide in the dialog
		 */
		viewScript: function() {
			dojo.byId('txtSourceCode').value = this.currentSlide.templateScript
		},
		
		/*
		 * Displays the HTML of a particular slide in the dialog
		 */
		viewHTML: function() {
			dojo.byId('txtSourceCode').value = this.currentSlide.templateHTML
		},

		/*
		 * Shows a subslide based on the content of a hidden <div in the document
		 */
		showSubSlide: function(/* string */ id) {
			// Allow only displaying one sub slide at a time
			if (this._subSlideOn) return
			this._subSlideOn = true

			dojo.byId('messageViewerContents').innerHTML = dojo.byId(id).innerHTML
			
			this.showDialog('messageViewer')
		},
		
		/*
		 * Hide sub slide
		 */
		hideSubSlide: function() {
			this._subSlideOn = false
			this.hideDialog('messageViewer')			
		}
	})

