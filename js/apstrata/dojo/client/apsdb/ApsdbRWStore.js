/*******************************************************************************
 *  Copyright 2009 apstrata
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *
 *  You may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0.html
 *  This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 *  CONDITIONS OF ANY KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations under the License.
 * *****************************************************************************
 */
dojo.provide("apstrata.dojo.client.apsdb.ApsdbRWStore");

dojo.require("dojo.data.api.Request");
dojo.require("apstrata.dojo.client.apsdb.Query");
dojo.require("apstrata.dojo.client.apsdb.SaveDocument");
dojo.require("apstrata.dojo.client.apsdb.DeleteDocument");

dojo.declare("apstrata.dojo.client.apsdb.ApsdbRWStore",
[],
{
    
    _FLAG_ITEM_NEW: "n",
    _FLAG_ITEM_DELETED: "d",
    _FLAG_ITEM_UPDATED: "u",

    constructor: function(/* apstrata.dojo.client.apsdb.Connection */ connection, queryParams) {
        this._features= {'dojo.data.api.Read':true, 'dojo.data.api.Identity':true, 'dojo.data.api.Write': true, 'dojo.data.api.Notification': true}

        this.connection = connection;
	this._storeName = queryParams.storeName;
	this._columns = queryParams.columns;
	        
	this._itemsMap = {};
	this._itemsFetched = new Array()
        this._itemsDirty= new Array()
	
//	this._refreshNeeded = true;
    },

    getFeatures: function() {
	return this._features;
    },
        
    _getItems: function() {
        var items = new Array();
        items = items.concat(this._itemsFetched)

        return items
    },
    
    _isEmptyObject: function (ob){
	for(var i in ob){ return false;}
        return true;
    },
    
    fetch: function(request) {
	var self = this;

	var _request = dojo.mixin(request, new dojo.data.api.Request());
	var query = new apstrata.dojo.client.apsdb.Query(self.connection);
	query.execute({store: this._storeName, query: request.query, queryFields: this._columns});

//        var query = this.connection.execute("Query", {store: this._storeName, query: request.query, queryFields: this._columns})

	dojo.connect(query, "handleResult", function() {
	    //
	    // this is to fix a dojo.json parser issue
	    // When only one document is returned,
	    //  query.response.result.documents.document is not created as an array
	    //  we expect it to be an array
	    //

	    if (self._isEmptyObject(query.response.result.documents)) {
		query.response.result.documents.document = []
	    } else if (query.response.result.documents.document.@key!= undefined) {
		var a = query.response.result.documents.document		
		query.response.result.documents.document = [a]
	    }
	    
	    dojo.forEach(query.response.result.documents.document, function(item) {
		item._S = self; // Adding a reference (_S) to ItemFileWriteStore object in each item 
		item.fields = {};
		
		// Rearranging the item object in a better way
		// and adding an associative array
		dojo.forEach(item.field, function(f) {
		    item.fields[f["@name"]] = {type:f["@type"], value:f["value"]}
		})

		item.fields[self.connection._KEY_APSDB_ID] = {value: item[self.connection._KEY_APSDB_ID], type: apstrata.dojo.client.apsdb.Query.prototype._TYPE_STRING}

		delete (item["field"]);
		
		// build associative array to retrieve item by identity later

		self._itemsMap[item[self.connection._KEY_APSDB_ID]] = item;
	    })
            
            self._itemsFetched = query.response.result.documents.document

            // use self._getItems() to get items because the store might be dirty from previous changes
            //  that haven't been persisted yet to objects prior to a save
            //  this means all local changes in store items remain even if the same items
            //  were updated in apsdb meanwhile
            //  the developer can save() the changes prior to a fetch
            //  if that's what he's looking for
	    request.onComplete(self._getItems(), _request);
	});	
    },
    
    //
    // This is where the item object is properly setup from the raw JSON response
    //
    xfetch: function(request) {
	var self = this;
	
	if (this._itemsDirty.length==0) {
self.log("refreshing")
	    this._fetch(request)
//	    this._refreshNeeded = false;
	} else {
	    var _request = dojo.mixin(request, new dojo.data.api.Request());
self.log("not refreshing, the items", this._getItems())

	    request.onComplete(self._getItems(), _request);
	}
	
    },

    isItem: function(something) {
/*
        if ((something != undefined) &&
            (something[this.connection._KEY_APSDB_ID] != undefined)) {
                return (this._itemsMap[something[this.connection._KEY_APSDB_ID]] === something)
            }
            
        return false
*/
	// temporary
	self.log("It is in the store", this._itemsMap[something[this.connection._KEY_APSDB_ID]])
	return (something._S === this)
    },

    _assertIsItem: function(/* item */ item){
	    //	summary:
	    //		This function tests whether the item passed in is indeed an item in the store.
	    //	item: 
	    //		The item to test for being contained by the store.
	    if(!this.isItem(item)){ 
self.log("assert is item item", item)
		    throw new Error("apstrata.dojo.client.apsdb.ItemFileReadStore: Invalid item argument.");
	    }
    },

    _assertIsReady: function(){
	    //	summary:
	    //		This function tests whether the item passed in is indeed an item in the store.
	    //	item: 
	    //		The item to test for being contained by the store.
	    if(!this._isReady){ 
		    throw new Error("apstrata.dojo.client.apsdb.ItemFileReadStore: Store not ready.");
	    }
    },

    getValue: function(item, attribute, defaultValue) {
	this._assertIsItem(item);
	if (item.fields[attribute] != undefined) return item.fields[attribute].value; else return defaultValue;
    },    
    
    // Doesn't support multi values yet
    getValues: function(item, attribute) {
	this._assertIsItem(item);
	if (item.fields[attribute] != undefined) return [item.fields[attribute].value]
    },
    
    getAttributes: function(item) {
	this._assertIsItem(item);
	var attributes = new Array()
	var i = 0;
	
	for (var attribute in item.fields) {
	    attributes[i++] = attribute
	};

	return attributes;
    },

    hasAttribute: function(item, attribute) {
	this._assertIsItem(item);
	return item.fields[attribute] != undefined;
    },    
    
    // Doesn't support multi values yet
    containsValue: function(item, attribute, value) {
	this._assertIsItem(item);
	if (!this.hasAttribute(item, attribute)) return false;
	return (item.fields[attribute].value == value)
    },
    
    // all items are loaded for now
    isItemLoaded: function(something) {
	return this.isItem(something);
    },
    
    setLabelAttribute: function(labelAttribute) {
	this.labelAttribute = labelAttribute;
    },

    getLabel: function(item) {
	this._assertIsItem(item);
        // If there's no label return the first attribute of item or the key
	if (this.labelAttribute == undefined) {
	    if (this.getAttributes(item).length == 0) return item[this.connection._KEY_APSDB_ID]
	    else return this.getValue(item, this.getAttributes(item)[0])
	}
	
	return this.getValue(item, this.labelAttribute);
    },

    getLabelAttributes: function(item) {
	if (this.labelAttribute == undefined) {
	    return this.getAttributes(item);
	} else return [this.labelAttribute]	
    },    

    loadItem: function(keywordArgs) {},
	
    close: function(request) {},
    
    //
    // dojo.data.api.identity implementation
    //
    getIdentity: function(item) {
	return item[this.connection._KEY_APSDB_ID]
    },
    
    getIdentityAttributes: function(item) {
	return this.connection._KEY_APSDB_ID;
    },
    
    fetchItemByIdentity: function(args) {
	return this._itemsMap[args.identity];
    },

    //
    // dojo.data.api.write implementation
    //
    
    //
    // _status is used internally in the store to determine if an item is new, to be updated or to be deleted 
    //
    _setItemStatus: function(item, status) {
        if (status == null) {
            if (item._status != undefined) delete item._status
        } else {
            item._status = status
        }  
    },
    
    _getItemStatus: function(item) {
        return item._status
    },

    newItem: function(/* Object? */ keywordArgs, /*Object?*/ parentInfo){
	var self = this
        if ((typeof keywordArgs) != "object") throw new Error('apstrata.dojo.client.apsdb.ItemFileWriteStore: keywordArgs is not an object');
        var newItem = {}
        
        // Generate a new hash to use as unique ID for the new document
        var key = this.connection.getNewKey();
        
        // the _S is used as a signature to determine if an item sent to a store method is effectively an apstrata store item
        newItem._S = this;
        
        // Set the key attribute 
        newItem[this.connection._KEY_APSDB_ID] = key;
        newItem.fields = {}
        newItem.fields[this.connection._KEY_APSDB_ID] = {};
        newItem.fields[this.connection._KEY_APSDB_ID].value = key;
        newItem.fields[this.connection._KEY_APSDB_ID].type = "string";
        
        // Create the fields object with the proper type assignments
        //  only string for now
	for (var attribute in keywordArgs) {
            newItem.fields[attribute] = {
                value: keywordArgs[attribute],
                type: "string"
            }
	};
        
        // Mark the new item as new
        this._setItemStatus(newItem, this._FLAG_ITEM_NEW)
        
        // Stick in the itemsMap so it's fetchable by getItemByIdentity
        this._itemsMap[key] = newItem;
        
        // Put the item in the dirty stack so it can be updated when save() is invoked
        this._itemsDirty.push(newItem)         
        
	this.save({onComplete: function() {
this.log("*********** save completed")
	    // Signal than a new item has been added to the store
            self.onNew(newItem)
	}})

        return newItem;
    },

    deleteItem: function(/* item */ item){
        this._assertIsItem(item);

        // Mark the new item as deleted
        this._setItemStatus(item, this._FLAG_ITEM_DELETED)

        // Put the item in the dirty stack so it can be updated when save() is invoked
        this._itemsDirty.push(item) 


	this.save({onComplete: function() {
this.log("*********** delete completed")
	    // Signal than a new item has been deleted
            self.onDelete(item)
	}})

        return false; // boolean
    },
    
    _assertIsString: function(s) {
        if (s == undefined) throw new Error('apstrata.dojo.client.apsdb.ItemFileWriteStore: attribute is undefined');
        if ((typeof s) != "string") throw new Error('apstrata.dojo.client.apsdb.ItemFileWriteStore: attribute is not a string');
    },
    
    setValue: function(	/* item */ item, /* string */ attribute, /* almost anything */ value){
        this._assertIsItem(item);
        this._assertIsString(attribute);
        
        var oldValue = this.getValue(item, attribute)
 
        if (oldValue == undefined) {
            item.fields[attribute] = {}; // if attribute is not defined, created it
        }

        // For now we're only assuming everything is a string
        item.fields[attribute].value = value;
        item.fields[attribute].type = "string";

        // Put the item in the dirty stack so it can be updated when save() is invoked
        this._itemsDirty.push(item)

        // Mark the new item as modified
        this._setItemStatus(item, this._FLAG_ITEM_UPDATED)

        // Signal than a new item has been modified
        this.onSet(item, attribute, oldValue, value)

        return true; // boolean
    },

    // For now multivalue is not supported
    setValues: function(/* item */ item,/* string */ attribute, /* array */ values){
            return this.setValue(item, attribute, value)
    },

    // Deletes an items attribute
    unsetAttribute: function(/* item */ item, /* string */ attribute) {
            this._assertIsItem(item);
            this._assertIsString(attribute);
            
            if (this.hasAttribute(item, attribute)) {
                delete item.fields[attribute];
        
                // Put the item in the dirty stack so it can be updated when save() is invoked
                this._itemsDirty.push(item)
                
                // Signal than a new item has been modified
                this.onSet(item, attribute, this.getValue(item, attribute), undefined)
                
                // Mark the new item as modified
                this._setItemStatus(item, this._FLAG_ITEM_UPDATED)
    
                return true; 
            } else return false                
    },

    // Invokes apsdb client SaveDocument 
    _saveDocument: function(item, handleResult, handleError) {
        var self = this;
        var sd = new apstrata.dojo.client.apsdb.SaveDocument(connection);
        dojo.connect(sd, "handleResult", function() {
	    handleResult(item)
	})
        dojo.connect(sd, "handleError", function() {
	    handleError(item)
	})

        var fields = {}
        
        for (prop in item.fields) {
            fields[prop] = item.fields[prop].value
        }
        
        sd.execute({store: self._storeName, fields: fields})
    },
    
    // Invokes apsdb client DeleteDocument     
    _deleteDocument: function(item, handleResult, handleError) {
        var self = this;
        var op = new apstrata.dojo.client.apsdb.DeleteDocument(connection);
        dojo.connect(op, "handleResult", function() {
	    handleResult(item)
	})
        dojo.connect(op, "handleError", function() {
	    handleError(item)
	})

        var attr = {
            store: self._storeName,
            documentKey: self.getIdentity(item)
        }

        op.execute(attr);
    },

    _processUpdates: function(queue, finishHandler) {
	self = this;
	
	//
	// Setup the response handlers
	//
        var handleResult = function(item) {
	    // Operation successful
	    //  item is no longer dirty
	    self._setItemStatus(item, null)
	    //  remove it from the queue
	    queue.pop()
	    
	    // recurse over the remainder of the queue
	    self._processUpdates(queue, finishHandler)
        }
	
	var handleError = function(item) {
	    queue.pop()
	    
	    // recurse over the remainder of the queue
	    self._processUpdates(queue, finishHandler)
	}

	//
	// Process the last item in the queue
	//
	if (queue.length>0) {
	    // Get the last item in the queue
	    item = queue[queue.length-1]

	    if (self._getItemStatus(item) == self._FLAG_ITEM_NEW) self._saveDocument(item, handleResult, handleError)
	    if (self._getItemStatus(item) == self._FLAG_ITEM_UPDATED) self._saveDocument(item, handleResult, handleError)
	    if (self._getItemStatus(item) == self._FLAG_ITEM_DELETED) self._deleteDocument(item, handleResult, handleError)
	} else {
	    finishHandler()
	}
    },

    // Commits all changes to the store back to the database     
    save: function(/* object */ keywordArgs){
        var self = this;

//	var queue = dojo.clone(self._itemsDirty) not working
	var queue = new Array();
	for (i=0; i<self._itemsDirty.length; i++) {
	    queue[i] =  self._itemsDirty[i]
	}

	self._processUpdates(queue, function() {

	    var tmp = new Array()
	    for (i=0; i<self._itemsDirty.length; i++) {		
		if (self._itemsDirty[i]._status != undefined) tmp.push(self._itemsDirty[i])
	    }
	    self._itemsDirty = tmp

	    self.log("what remains of dirty items is", self._itemsDirty)
//	    this._refreshNeeded = false;
	    keywordArgs.onComplete();
	})
    },

    revert: function(){
            throw new Error('Unimplemented API: dojo.data.api.Write.revert');
            return false; // boolean
    },

    // determines if an item has been added/modified/deleteed
    isDirty: function(/* item? */ item){
        this._assertIsItem(item)

        // if item._status exists and is not null then the item is dirty
        return ((item._status != undefined) && (item._status != null))                        
    },

    onSet: function(/* item */ item, /* attribute-name-string */ attribute, /* object | array */ oldValue,/* object | array */ newValue){
    },

    onNew: function(/* item */ newItem, /*object?*/ parentInfo){
self.log("newItem", newItem)	
    },

    onDelete: function(/* item */ deletedItem){	
self.log("deletedItem", deletedItem)
    }
});


