dojo.provide("apstrata.cms.PagesGridFTSearch");

dojo.require("dijit.form.Select");
dojo.require("dijit.form.DateTextBox");

/**
 * This class extends the GridFTSearch class, upon which it adds supplementary filtering and search capabilities:
 * - filtering by status
 * - filtering by date (from / to)
 * The class handles the layout of the filters.
 */   
dojo.declare("apstrata.cms.PagesGridFTSearch", 
[apstrata.horizon.GridFTSearch], 
{
	statusChoice: null,
	fromDate: null,
	toDate: null,
	
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
         
        var newDiv = dojo.place("<div>", this.frmSearch.domNode); 
        
		// Add filter by status field
		dojo.place("<label for=\"statusChoice\">&nbsp;&nbsp;&nbsp;&nbsp;Filter by status</label>", newDiv);
        dojo.place(this.statusChoice.domNode, newDiv);
        dojo.connect(this.statusChoice, "onChange", dojo.hitch(this, this._filter));
        
        // Add filter from date field
        dojo.place("<label for=\"fromDate\">From date</label>", newDiv);
        this.fromDate = new dijit.form.DateTextBox({name:"fromDate"});
        dojo.place(this.fromDate.domNode, newDiv);
        dojo.connect(this.fromDate, "onChange", dojo.hitch(this, this._filterFromDate));
        
        // Add filter to date field
        dojo.place("<label for=\"toDate\">To date</label>", newDiv);
        this.toDate = new dijit.form.DateTextBox({name:"toDate"});
        dojo.place(this.toDate.domNode, newDiv);
        dojo.connect(this.toDate, "onChange", dojo.hitch(this, this._filterToDate));
             
	},
		
	_filter: function() {	
			 	
		this.search({"status": this.statusChoice.get("value")});
	},
	
	_filterFromDate: function() {
		
		this.search({"fromDate": this.fromDate.get("value")});
	},
	
	_filterToDate: function() {
		
		this.search({"toDate": this.toDate.get("value")});
	},
	
	/**
	 * Overrides the inherited method (initially empty).
	 * Notes:
	 * (1) When the search button is clicked on GridFTSearch, it triggers GridFTSearch._search() 
	 * that actually calls GridFTSearch.search() passing it the content of the search textbox (contains fts text).
	 * (2) A Grid instance connect its "filter()" method to the search function of its filter. PagesGrid overrides 
	 * this method.
	 * (3) In addition to fts, we need to filter by status, from date and to date, therefore:
	 * (1) + (2) ==> PagesGridFTSearch.search() is invoked by GridFTSearch._search() passing it the fts text
	 * (3) ==> In PagesGridFTSearch.search(), we need to override the search function to retrieve the status, from and to date
	 * then invoke the inherited search function so the overriden filter() function is called with fts and additional filters
	 * (status, fromDate, toDate)
	 * @param attr.status: the selected status to filter on. If undefined, will use this.statusChoice.value
	 * @param attr.fromDate: the value selected for the fromDate filter. If undefined, will use this.fromDate.value
	 * @param attr.toDate: the value selected for the toDate filter. If undefined, will use this.toDate.value  
	 */
	search: function(attr) {
		
		var status = attr && attr.status ? attr.status : this.statusChoice.get("value");
		var fromDate = attr && attr.fromDate ? attr.fromDate: this.fromDate.get("value");
		var toDate = attr && attr.toDate ? attr.toDate: this.toDate.get("value");
		if (fromDate) {
			
			fromDate = dojo.date.locale.format(fromDate, {datePattern: "yyyy-MM-dd", selector: "date"});
			arguments[0]["fromDate"] = fromDate;
		};
		
		if (toDate) {
			
			toDate = dojo.date.locale.format(toDate, {datePattern: "yyyy-MM-dd", selector: "date"});
			arguments[0]["toDate"] = toDate;
		}
		
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
