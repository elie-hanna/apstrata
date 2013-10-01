<script>
    <scriptACL>
        <execute>group:cms-users</execute>
        <read>nobody</read>
        <write>nobody</write>
    </scriptACL>
    <code><![CDATA[
      

try{
     
	var params={
			'accountKey':request.parameters["accountKey"],
			'apsdb.sort':request.parameters["apsdb.sort"],
			'queryFields':request.parameters["queryFields"],
			'toDate':request.parameters["toDate"],
			'fromDate':request.parameters["fromDate"],
			'resultsPerPage':request.parameters["resultsPerPage"],
			'pageNumber':request.parameters["pageNumber"]
        	
		}


	var response = runScriptHelper.runScript("X1477E086C","Transactions.Account", "CMS@elementn.com",params,null );
	return response;  
	   
} catch (e) {
 return  { "status": "failure", "errorDetail": e };
}  


    ]]></code>
</script>