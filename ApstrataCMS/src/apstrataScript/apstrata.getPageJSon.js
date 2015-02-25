<script>
<scriptACL><execute>anonymous</execute></scriptACL>
<code> <![CDATA[
apsdb.log.setLogLevel(4); 
var page = request.parameters.page;

var queryRequest = {
	"apsdb.forceCurrentSnapshot":"true",
	"apsdb.store": "apstrata",
	"apsdb.query": "apsdb.documentKey=\""+ page +"\"",
	"apsdb.queryFields": "*"
};

function _phpEscape(value) {
	// replace("'","\\'", "g").
	return value.replace("\\", "\\\\", "g").replace("\"", "\\\"", "g")
}

function applyStrategy(document) {

	// Apply the corresponding strategy according to the documentType
	
	var documentType= document["documentType"];
	if (documentType) {
	
		var strategyName = "util.strategyFor_" + documentType;
		
		try {
			
			var strategy = apsdb.require(strategyName);			
		 	result = strategy.execute({"document": document, "apsdb": apsdb});
		 	var keys = result["keys"];		 	
		 	for (var i=0; keys && i < keys.length; i++) {
		 				 	   
		 	   document[keys[i]] = result[keys[i]];
		 	}			 	
		 }catch(exception) {
		
		 	apsdb.log.debug("Exception occurred while invoking " + strategyName, {exception:exception});			 				 	
		 }finally {
		 
		 	return document;
		 }		 
	}
	
	return document;
}


// Query listing fields
var queryResult = apsdb.callApi("Query", queryRequest, null);
apsdb.log.debug("Debug trace", queryResult);
var strOutput = '';

var leftColumn, rightColumn, title, template
var document = {};
if (queryResult && 
	queryResult.result && 
	queryResult.result.documents && 
	queryResult.result.documents.length>0) {
	
	document = queryResult.result.documents[0]
	document["pageFound"] = "1";	
	applyStrategy(document);	
} else {
	title = "PAGE NOT FOUND"
	section1 = "Page not found."
	section2 = ""
	strOutput += "$pageFound=\"0\";\n";
	document["pageFound"] = "0";
}

//return document;

var httpRsp = apsdb.httpRespond( 200, {"Content-Type" : "text/json" });
httpRsp.write(JSON.stringify(document));
httpRsp.flush();
httpRsp.close();

]]>
</code>
</script>