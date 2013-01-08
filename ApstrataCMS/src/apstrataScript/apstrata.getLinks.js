<script>
<scriptACL><execute>anonymous</execute></scriptACL>
<code> <![CDATA[
apsdb.log.setLogLevel(4); 

/**
 * This script returns an object containing:
 * status: 1 if successful, 0 otherwise
 * links: an array of 1st level links object
 * where links objects contain { title, address, type, children }
 * The "children" property is an array of "sublinks", i.e. CMS links that have the title of 
 * the container link in their "parent" property
 * where sublinks objects contain { title, address, type}
 * When a link does not have sublinks, its "children" property is an empty array  
 */
var response = {};
try {
	var getLinksRequest = {
		"apsdb.forceCurrentSnapshot":"true",
		"apsdb.store": "apstrata",
		"apsdb.query": "documentType=\"link\"",
		"apsdb.queryFields": "title, address, type, parent"
	};
	
	var getLinksResult = apsdb.callApi("Query", getLinksRequest , null);
	
	// This array will contain 1st level links, i.e. links that do noy have a parent
	var linkTree = [];
	
	if (getLinksResult.metadata.status == "success") {
	  
		for (var i=0; i < getLinksResult.result.documents.length; i++) {
			
			var linkDoc = getLinksResult.result.documents[i];
			var link = {
				title: linkDoc.title,
				address: linkDoc.address,
				type: linkDoc.type,
				children: []
			}
			
			apsdb.log.debug("link", {link: linkDoc});
			if (!linkDoc.parent) { 
				linkTree.push(link);
			}
			
			var getLinkChildrenRequest = {
				"apsdb.forceCurrentSnapshot":"true",
				"apsdb.store": "apstrata",
				"apsdb.query": "parent=\"" + link.title + "\"",
				"apsdb.queryFields": "title, address, type"
			};		
			
			var getLinkChildrenResult = apsdb.callApi("Query", getLinkChildrenRequest, null);
			if (getLinkChildrenResult.metadata.status == "success") {
			
				for (var j=0; j < getLinkChildrenResult.result.documents.length; j++) {
					
					var subLink = {
						title: getLinkChildrenResult.result.documents[j].title,
						address: getLinkChildrenResult.result.documents[j].address,
						type: getLinkChildrenResult.result.documents[j].type
					}
					link.children.push(subLink);
				}
			}
		}
	}	
	
	response["status"] = "1";
	response["links"] = linkTree;
	sendResponse(response);
}catch(exception) {

	response["status"] = "0";
	sendResponse(response);
}

function sendResponse(resp) {
apsdb.log.debug("resp", {resp: resp});
	var httpRsp = apsdb.httpRespond( 200, {"Content-Type" : "text/json" });
	httpRsp.write(JSON.stringify(resp));
	httpRsp.flush();
	httpRsp.close();	
}
	
]]>
</code>
</script>