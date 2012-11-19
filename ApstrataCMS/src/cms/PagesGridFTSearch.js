dojo.provide("apstrata.cms.PagesGridFTSearch");

dojo.require("dijit.form.Select");
   
dojo.declare("apstrata.cms.PagesGridFTSearch", 
[apstrata.horizon.GridFTSearch], 
{
	statusChoice: null,
	
	postCreate: function() {
	
		this.statusChoice = new dijit.form.Select({
            name: "statusChoice",
            options: [             
             {
                label: "No",
                value: "",
                selected: true
            },
            {
                label: "Draft",
                value: "Draft"
            },
            {
                label: "Pending Approval",
                value: "Pending Approval"                       
            },
            {
                label: "Published",
                value: "Published"
            }]
        });
        
        dojo.place("<label for=\"statusChoice\">Filter by status</label>", this.frmSearch.domNode);
        dojo.place(this.statusChoice.domNode, this.frmSearch.domNode);
        dojo.connect(this.statusChoice, "onChange", dojo.hitch(this, this._filter));
        this.inherited(arguments);		
	},
	
	_filter: function() {	
			 	
		this.search({"status" : this.statusChoice.get("value")});
	},
	
	/*
	 * Overrides the inherited method (empty).
	 * Notes:
	 * (1) When the search button is clicked on GridFTSearch, it triggers GridFTSearch._search() 
	 * that actually calls GridFTSearch.search() passing it the content of the search textbox (contains fts text).
	 * (2) A Grid instance connect its "filter()" method to the search function of its filter. PagesGrid overrides 
	 * this method.
	 * (3) In addition to fts, we need to filter by status, therefore:
	 * (1) + (2) ==> PagesGridFTSearch.search() is invoked by GridFTSearch._search() passing it the fts text
	 * (3) ==> In PagesGridFTSearch.search(), we need to override the search function to retrieve the status, 
	 * then invoke the inherited search function so the overriden filter() function is called with both fts and status  
	 */
	search: function(attr) {
		
		var status = attr && attr.status ? attr.status : this.statusChoice.get("value");
		var search = attr.search;
		
		// If search() is called from _filter(), then we do not have a prefilled "attr.search"
		// in the below, we try to get this value from the search text box
		if (!search) {
			
			search = this.frmSearch.get('value').search;
			arguments[0]["search"] = search;
		}
		
		arguments[0]["status"] = status; 		
		this.inherited(arguments);
	} 	
})
