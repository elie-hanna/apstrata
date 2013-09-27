<script>
<scriptACL>
     <execute>group:cms-users</execute>
     <read>nobody</read>
     <write>nobody</write>
</scriptACL>
<code><![CDATA[

try{
    var response = runScriptHelper.runScript("X1477E086C","Global.DataLoader", "CMS@elementn.com",request.parameters,null );
    return response;  
       
 } catch (e) {
     return  { "status": "failure", "errorDetail": e };
 }  

]]>
</code>
</script>