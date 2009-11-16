/*******************************************************************************
 *  Copyright 2009 Apstrata
 *  
 *  This file is part of Apstrata Database Javascript Client.
 *  
 *  Apstrata Database Javascript Client is free software: you can redistribute it
 *  and/or modify it under the terms of the GNU Lesser General Public License as
 *  published by the Free Software Foundation, either version 3 of the License,
 *  or (at your option) any later version.
 *  
 *  Apstrata Database Javascript Client is distributed in the hope that it will be
 *  useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *  
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with Apstrata Database Javascript Client.  If not, see <http://www.gnu.org/licenses/>.
 * *****************************************************************************
 */

dojo.provide("apstrata.explorer.Blog")
dojo.provide("apstrata.explorer.BlogPost")
dojo.provide("apstrata.explorer.BlogPosts")
dojo.provide("apstrata.explorer.BlogGallery")

dojo.declare("apstrata.explorer.Blog",
[apstrata.horizon.HStackableList], 
{
	storeName: 'blog',
		
	data: [
		{label: "Posts", iconSrc: "../../apstrata/resources/images/pencil-icons/file.png"},
		{label: "Gallery", iconSrc: "../../apstrata/resources/images/pencil-icons/picture.png"},
		{label: "Favourites", iconSrc: "../../apstrata/resources/images/pencil-icons/star.png"},
		{label: "Tags", iconSrc: "../../apstrata/resources/images/pencil-icons/tag.png"},
		{label: "New Post", iconSrc: "../../apstrata/resources/images/pencil-icons/notepad.png"}
	],
	
	onClick: function(index, label) {
		var self = this
		var w
		
		this.closePanel()
		
		switch (label)
		{
			case 'Posts': this.openPanel(apstrata.explorer.BlogPosts)
				break;
			case 'New Post': this.openPanel(apstrata.explorer.BlogPost)
				break;
			case 'Gallery': this.openPanel(apstrata.explorer.BlogGallery)
				break;
			default:
		}
	}
})

dojo.require("dijit.form.Form")
dojo.require("dijit.form.ValidationTextBox")
dojo.require("dojox.form.FileInput")
dojo.require("dijit.form.Button")

dojo.require("apstrata.widgets.PageNumberSelector")
dojo.require("apstrata.ItemApsdbReadStore")
dojo.require("apstrata.GetFile")

dojo.require("dijit.Editor")
dojo.require("dijit._editor.plugins.FontChoice"); // 'fontName','fontSize','formatBlock'
dojo.require("dijit._editor.plugins.TextColor");


dojo.declare("apstrata.explorer.BlogPost", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.explorer", "templates/BlogPost.html"),

	maximizePanel: true,
	
	constructor: function() {
		
	},
		
	SavePost: function() {
		var self = this

		if (this.blogForm.validate()) {
			
			var readACL
			if (this.chkPrivate.checked) {
				readACL = 'group:blog-users' 
			} else {
				readACL = 'anonymous'
			}
			
			var attrs = {
				action: "SaveDocument",
				request: {
					formType: "blog",
					blogPost: self.edtrPost.getValue(),
					"blogPost.apsdb.fieldType": "text",
					hasImage: (self.upldPhoto.fileInput.value!=""),
					
					"default.readACL": readACL,

					apsdb: {
						store: self.getParent().storeName,
					}
				},
				formNode: self.blogForm.domNode,
				load: function(operation) {
					self.blogForm.reset()
					self.edtrPost.setValue("")
				},
				error: function(operation) {
					self.blogForm.reset()
					self.edtrPost.setValue("")
				}
			}
			
			this.getContainer().client.call(attrs)
		}
	},
	
	destroy: function() {
		this.inherited(arguments)
	}
})

dojo.declare("apstrata.explorer.BlogPosts", 
[dijit._Widget, dojox.dtl._Templated, apstrata.horizon._HStackableMixin], 
{
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("apstrata.explorer", "templates/BlogPosts.html"),
	
	items: [],
	maximizePanel: true,
	query: "formType=\"blog\"",
	
	fetch: function() {
		var self = this
		
		var getFile = new apstrata.GetFile(this.getContainer().client.connection)
		
		var args = {
			onComplete: function(items, request) {
				self.items = []
				dojo.forEach(items, function(item) {
					var o = {
						documentKey: item.documentKey,
						creationTime: item.getValue('apsdb.creationTime'),
						title: item.getValue('title')?item.getValue('title'):"",
						blogPost: item.getValue('blogPost')?item.getValue('blogPost'):"",
						hasImage: item.getValue('hasImage')?item.getValue('hasImage'):false,
					}
					
					if (item.getValue("apsdb_attachments")) {
						var attrs = {
								store: self.getParent().storeName,
								documentKey: item.documentKey,
								fieldName: "apsdb_attachments",
								fileName: item.getValue("apsdb_attachments"),
								setContentDisposition: "false"
							}
						
						o.image = getFile.getUrl(attrs)
					} 

					self.items.push(o)
				})
				
				self.render()
			},
			
			onError: function(errorData, request) {
			},
			
            query: {
				query: self.query,
				sort: "apsdb.creationTime[date]: DESC",
				count: true,
				pageNumber: 1
			}
		}
		
		this.store.fetch(args)
	},

	postCreate: function() {
		var self = this
		
		var args = {client: self.getContainer().client, apsdbStoreName: self.getParent().storeName, fields:"apsdb.documentKey, apsdb.creationTime, formType, title, blogPost, apsdb_attachments, hasImage", label: "title", resultsPerPage: 50}
		this.store = new apstrata.ItemApsdbReadStore(args)

		this.fetch()

		this.inherited(arguments)
	},
	
	render: function() {
		this.inherited(arguments)		
	}
})

dojo.declare("apstrata.explorer.BlogGallery", 
[apstrata.explorer.BlogPosts], 
{
	templatePath: dojo.moduleUrl("apstrata.explorer", "templates/BlogGallery.html"),
	query: "(formType=\"blog\") AND (hasImage=\"true\")"

})

