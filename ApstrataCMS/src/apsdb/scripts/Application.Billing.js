<script>
    <scriptACL>
        <execute>group:cms-users</execute>
        <read>nobody</read>
        <write>nobody</write>
    </scriptACL>
     <code> <![CDATA[

try{

var params={
	'accountKey':request.parameters["accountKey"],
	'monthPar':request.parameters["monthPar"],
	'yearPar':request.parameters["yearPar"]
}

				//return params;
    var response = runScriptHelper.runScript("X1477E086C","Application.Billing", "CMS@elementn.com",params,null );
    return response;  
       
 } catch (e) {
     return  { "status": "failure", "errorDetail": e };
 }  

    ]]>
    </code>
</script>