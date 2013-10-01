<script>
    <scriptACL>
        <execute>group:cms-users</execute>
        <read>nobody</read>
        <write>nobody</write>
    </scriptACL>
     <code> <![CDATA[

try{

	
	var params={
			'transactionNumber':request.parameters["transactionNumber"],
			'queryFields':request.parameters["queryFields"]
	}
				//return params;
    var response = runScriptHelper.runScript("X1477E086C","TransactionDetails", "CMS@elementn.com",params,null );
    return response;  
       
 } catch (e) {
     return  { "status": "failure", "errorDetail": e };
 }  

    ]]>
    </code>
</script>