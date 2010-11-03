dojo.provide("apstrata.widgets.DynamicColumnsDataGrid");
dojo.require("dojox.grid.DataGrid");

dojo.declare("apstrata.widgets.DynamicColumnsDataGrid", [dojox.grid.DataGrid], {
	_onFetchBegin: function(size, req){
		if(!this.scroller){ return; }
		
		if(!size){
			this.views.render();
			this._resize();
			this.showMessage(this.noDataMessage);
			this.focus.initFocusView();
		}else{
			this.showMessage();
		}
	},

	_onFetchComplete: function(items, req){
		if(!this.scroller){ return; }
        var self = this;
		// compute layout
		dojo.forEach(this.store._fieldsArray, function(field) {
			field = dojo.string.trim(field)
			//if(!dojo.string.startsWith("apsd."))
			if (self.structure && self.structure.length > 0) {
				exists = false;
				for (var i=0; i<self.structure.length; i++) {
					if (self.structure[i].field==field) {
						exists = true;
						break;
					}
				}
				if(!exists) {
					self.structure.unshift({ field: field, name: field, width: 'auto' });
				}
			}	
		})
		this.setStructure(self.structure);
		
		if(req.isRender){
			this.scroller.init(items.length, this.keepRows, this.rowsPerPage);
			this.rowCount = items.length;
			this._setAutoHeightAttr(this.autoHeight, true);
			this._skipRowRenormalize = true;
			this.prerender();
			this._skipRowRenormalize = false;
		}else{
			this.updateRowCount(size);
		}
	
		
		if(items && items.length > 0){
			//console.log(items);
			//all the items are fetched at this point
			dojo.forEach(items, function(item, idx){
				this._addItem(item, req.start+idx, true);
			}, this);
			if(this._autoHeight){
				this._skipRowRenormalize = true;
			}
			this.updateRows(req.start, items.length);
			if(this._autoHeight){
				this._skipRowRenormalize = false;
			}			
			if(req.isRender){
				this.setScrollTop(0);
				this.postrender();
			}else if(this._lastScrollTop){
				this.setScrollTop(this._lastScrollTop);
			}
		}
		delete this._lastScrollTop;
		if(!this._isLoaded){
			this._isLoading = false;
			this._isLoaded = true;
		}
		this._pending_requests[req.start] = false;
	}
});