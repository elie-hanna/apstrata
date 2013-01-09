<script>
<scriptACL><execute>anonymous</execute></scriptACL>
<code> <![CDATA[
//apsdb.log.setLogLevel(4); 

var category = request.parameters.category;

var queryRequest = {
	"apsdb.queryName":"getPages",
	"category": category
};

function _phpEscape(value) {
	// replace("'","\\'", "g").
	return value.replace("\\", "\\\\", "g").replace("\"", "\\\"", "g")
}

// Query listing fields
var queryResult = apsdb.callApi("Query", queryRequest, null);
log.debug("Debug trace", queryResult);
var strOutput = '';

var leftColumn, rightColumn, title, template
var document = {};
if (queryResult && 
	queryResult.result && 
	queryResult.result.documents && 
	queryResult.result.documents.length>0) {
	
	document = queryResult.result.documents;
	document["pageFound"] = "1";	
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
