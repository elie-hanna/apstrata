<script>
<scriptACL><execute>anonymous</execute></scriptACL>
<code> <![CDATA[
apsdb.log.setLogLevel(4); 

var queryRequest = {
	"apsdb.forceCurrentSnapshot":"true",
	"apsdb.store": "apstrata",
	"apsdb.query": "apsdb.documentKey=\"menu\"",
	"apsdb.queryFields": "menuPhp,leftFooterPhp,rightFooterPhp"
};

function _phpEscape(value) {
	return value.replace("\\", "\\\\", "g").replace("'","\\'", "g")
	//.replace("\"", "\\\"", "g")
}


// Query listing fields
var queryResult = apsdb.callApi("Query", queryRequest, null);
apsdb.log.debug("Debug trace", queryResult);
var strOutput = '';

var leftColumn, rightColumn, title, template

if (queryResult && 
	queryResult.result && 
	queryResult.result.documents && 
	queryResult.result.documents.length>0) {
	
	var document = queryResult.result.documents[0]

	strOutput = 'array ( "pageFound" => "1",\n'
	strOutput +=  '"menuPhp" => ' + _phpEscape(document["menuPhp"]) + ",\n"
	strOutput +=  '"leftFooterPhp" => ' + _phpEscape(document["menuPhp"]) + ",\n"
	strOutput +=  '"rightFooterPhp" => ' + _phpEscape(document["menuPhp"]) + ");"

} else {
	strOutput += 'array ( "pageFound" => "0" )'
}

var httpRsp = apsdb.httpRespond( 200, { });
httpRsp.write(strOutput);
httpRsp.flush();
httpRsp.close();

]]>
</code>
</script>