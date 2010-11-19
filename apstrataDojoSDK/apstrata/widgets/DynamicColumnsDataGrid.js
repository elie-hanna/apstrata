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
        var existingFieldNames = [];
        for (var i=0; i<self.structure.length; i++) {
        	existingFieldNames.push(self.structure[i].field);
		}        
        
		dojo.forEach(this.store._fieldsArray, function(field) {
			field = dojo.string.trim(field)
			if (field != '_type') 
				if (dojo.indexOf(existingFieldNames, field) == -1)
					self.structure.unshift({ field: field, noresize: false, name: field});
		})
		
		for (var i=0; i<self.structure.length; i++) {
			if(self.store._fieldsTypeObject[self.structure[i].name] == 'file') {
				self.structure[i]['formatter'] = function (fileName, rowIndex, columnObj) {
					if (fileName && fileName != '') {
						var params = "apsdb.documentKey="+this.grid.getItem(rowIndex).getIdentity()+"&apsdb.fieldName="+columnObj.name+"&apsdb.fileName="+fileName+"&apsdb.store="+this.grid.store._store;
						var href = connection.signUrl("GetFile", params, "json").url;
						return "<a title=\"fileName\" href=\"" + href + "\">"+fileName+"</a>";
					} else {
						return "...";
					}
				};
			}
		}

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