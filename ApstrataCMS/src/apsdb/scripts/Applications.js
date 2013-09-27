<script>
    <scriptACL>
        <execute>group:cms-users</execute>
        <read>nobody</read>
        <write>nobody</write>
    </scriptACL>
     <code> <![CDATA[

try{

var params={
	'apsdb.pageNumber':request.parameters["apsdb.pageNumber"],
	'apsdb.resultsPerPage':request.parameters["apsdb.resultsPerPage"],
	'apsdb.queryFields':request.parameters["apsdb.queryFields"]
}

				//return params;
    var response = runScriptHelper.runScript("X1477E086C","Applications", "CMS@elementn.com",params,null );
    return response;  
       
 } catch (e) {
     return  { "status": "failure", "errorDetail": e };
 }  

    ]]>
    </code>
</script>