dojo.provide('apstrata.wiki.widgets.WikiEditor');

dojo.require('dijit.form.CheckBox');
dojo.require('dijit.Editor');
dojo.require('dijit.InlineEditBox');

dojo.declare('apstrata.wiki.widgets.WikiEditor',
	[dijit._Widget, dijit._Templated],
	{
		widgetsInTemplate: true,
		templatePath: dojo.moduleUrl('apstrata.wiki.widgets', 'templates/WikiEditor.html'),
//                templateString: "<div><span class='title' dojoType='dijit.InlineEditBox' dojoAttachPoint='fldTitle'>${page.title}</span><br><input type='button' dojoAttachPoint='btnSave' value='save' /></div>",
                
                                
		// implicit constructor
		constructor: function(store, item) {
                        this.store = store;
                        this.item = item;

                        var pageSchema = {
                                title: '',
                                contents: '',
                                tags: ''
                        }
                        
                        // Copy item contents based on pageSchema into this.page
                        //  For easy access from within the dojo template where we can't
                        //  use functions such store.getValue(...)
                        this.page = {}                        
                        for (prop in pageSchema) {
                                this.page[prop] = this.store.getValue(this.item, prop, pageSchema[prop])
                        }
                        
                        
                        this.breadCrumbs = ['/'];
		},
		
		postCreate: function() {
                        var self = this;
                        dojo.connect(this.btnSave ,'onclick', function() {                                
                                self.store.setValue(self.item, 'title', self.fldTitle.value)
                                self.store.setValue(self.item, 'contents', self.fldContents.getValue(false))
                                self.store.setValue(self.item, 'tags', self.fldTags.value)
console.debug(self.fldContents.getValue(false))                                
                                self.store.save()
                        })
		},

                startup: function() {
                }
	});
