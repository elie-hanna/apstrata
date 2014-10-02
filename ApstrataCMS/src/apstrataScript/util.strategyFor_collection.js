<script>
<scriptACL><execute>anonymous</execute></scriptACL>
<code> <![CDATA[

function execute(params){

	if (!params || !params["document"] || !params["apsdb"]) {
		throw error("params can't be null. Apstrata document and apsdb object are expected");
	}
	
	var apsdb = params["apsdb"];
	apsdb.log.setLogLevel(4);
	apsdb.log.debug("Entering strategy");	
	
	var doc = params["document"];
	var firstQuery = doc["firstQuery"];
	var secondQuery = doc["secondQuery"];
	var pageSelection = doc["pageSelection"];
	var store = params["store"] ? params["store"] : "apstrata";
	
	var result = {};
	result["keys"] = ["firstQuery", "secondQuery", "pageSelection"];
	result["firstQuery"] = {};
	result["secondQuery"] = {};
	result["pageSelection"] = {};
	
	try {
	
		if (firstQuery) {
			result["firstQuery"] = runSavedQuery(firstQuery, apsdb, store).result;
		}
		
		if (secondQuery) {
			result["secondQuery"] = runSavedQuery(secondQuery, apsdb, store).result;
		}
		
		if (pageSelection) {
			result["pageSelection"] = getPageSelection(pageSelection, apsdb, store);
		}
			
	}catch(exception) {
	
		apsdb.log.debug("Exception occured", {exception: exception});		
	}finally {
		return result;
	}
}

function runSavedQuery(queryName, apsdb, store) {	
	
	var queryRequest = {		
		"apsdb.store": "apstrata",
		"apsdb.queryName": queryName			
	};
		
	return apsdb.callApi("Query", queryRequest, null);
}

function getPageSelection(pageSelection, apsdb, store) {
	
	try {		
		
		pageSelection = [].concat(pageSelection);
		
		var results = []; 
		for (var i = 0; i < pageSelection.length; i++) {
		
			var queryRequest = {
			"apsdb.forceCurrentSnapshot": "true",
			"apsdb.store": "apstrata",
			"apsdb.query":  "apsdb.documentKey=\"" + pageSelection[i] + "\"",
			"apsdb.queryFields": "*"
			};
		
			apsdb.log.debug("pageSelection request " + i, {params: queryRequest});
		
			var result = apsdb.callApi("Query", queryRequest, null);
			apsdb.log.debug("Page Selection", {"result": result});
			if (result && result.result && result.result.documents) {
				results.push(result.result.documents[0]);
			}		
		}
		
		return results;
	}catch(exception) {
	
		throw exception;
	}
}

]]>
</code>
</script>