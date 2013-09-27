	<style type="text/css">
	<?php 
			if ($config["developmentMode"]) { 
		?>
		/* manually import the apstrataSDK styles since they are not in touch.css in development mode */
	    @import "lib/ApstrataSDK/apstrata/ui/themes/apstrata/FormGenerator.css";
	    @import "lib/ApstrataSDK/apstrata/ui/themes/apstrata/Curtain.css";
	    @import "lib/ApstrataSDK/apstrata/ui/themes/apstrata/FlashAlert.css";
	    @import "lib/ApstrataSDK/apstrata/ui/themes/apstrata/ApstrataAnimation.css";
	
		/* import amc styles which contain amc widgets and panels styles */
		@import "lib/amc/src/ui/css/amcStyles.css";
		/* import fonts as icons */
		@import "lib/amc/src/ui/css/font-style.css";
		/* import horizon styles from amc */
		@import "lib/amc/src/ui/css/horizon/horizon.css";
	<?php 
			} 
		?>
	</style>
	
	<!-- begin side menu -->

    <div class="side-menu" style="display: none;">
    	<h1>tools</h1>
    	
    	
    	<!-- begin navigation -->
        <div class="navigation">
        	<div class="top"></div>
            <div class="middle">
                <ul>           
                    <li><a href="#" id="manageAccountLink" class="selected">manage accounts</a></li>
                    <li><a href="#" id="userProfileLink">user profile</a></li>                
                    <li><a href="#" id="workbenchLink">workbench</a></li>                   
                    <li style="display:none"><a href="#" id="logoutLink">logout</a></li>
                </ul>
        	</div>
            <div class="bottom"></div>
        </div>
        <!-- end navigation -->
    	
    	
    </div>
    <!-- end side menu -->
	<div class="editorial">
    	<h1 class="marB20" style="visibility:hidden; display: none;">Hello</h1>      
    	<div class="dashboard" style="display:none">
		This is your dashboard. <br />
		This is where you control your apps, your settings and stuff.
		</div>
		<div id="linkedContent">    
		<script>
		
		    /*
		     * Global variables defining templates that will overload the default templates of Account.js and Profile.js
		     */
			accountsTemplate =  "../../../templates/touch/widgets/Accounts.html";
			profileTemplate = "../../../../templates/touch/widgets/Profile.html";
			dojo.addOnLoad(function() {
		<?php 
				if ($config["developmentMode"]) { 
			?>
				dojo.registerModulePath("apstrata", "../../ApstrataSDK/apstrata")
				dojo.registerModulePath("apstrata.cms", "../../../src/cms")
				dojo.registerModulePath("amc", "../../../lib/amc/src/ui/amc");
				<?php 
				} 
			?>
				dojo.require("dijit._Widget");
				dojo.extend(dijit._Widget, {
					_apstrataRoot: apstrata.baseUrl,
					_horizonRoot: apstrata.baseUrl + "/../horizon"
				})
								
				dojo.require("apstrata.sdk.Connection");
				dojo.require("apstrata.sdk.Client");
				dojo.require("apstrata.home.dashboard.Dashboard");
				dojo.require("dojo.parser");
				dojo.require("apstrata.ui.widgets.LoginWidget");
				dojo.require("apstrata.touch.extend.Accounts");
				dojo.require("apstrata.touch.extend.Profile");
															 
				// These are visual properties used by the application that can not fit in a CSS file yet 			
				apstrata.horizon.magicUIdimensions = {
					"panel.finalAlpha": .95
				}
				
				var helloNode = dojo.query(".marB20")[0];
				//var txtNode = dojo.query(".dashboard")[0];
				
				//dojo.style(helloNode, "visibility", "hidden");
				//dojo.style(txtNode, "visibility", "hidden");
				
				/*
				 * this variable is regularly updated with a reference to the menu link node that was last selected 
				 */
				var lastSelected = dojo.byId("manageAccountLink");
					
				loginWidget = new apstrata.ui.widgets.LoginWidget({useToken: true, type: "user"})
				//loginWidget = new apstrata.ui.widgets.LoginWidget({type: "user"});		
				dojo.parser.parse();
				var dashboard = dijit.byId("dashboard");				
				
				/*
				 * the linkedContent node contains the content to display when clicking on some of the menu links
				 */
				var linkedContent = dojo.byId("linkedContent");
				
				/*
				 * Login successful event handler, triggers the display of the accounts info
				 */ 

				var userCredentials = null;	
				var logoutLink = dojo.byId("logoutLink");
				var logoutLinkLine = logoutLink.parentNode;
				var logoutIconTop = dojo.query(".logout")[0];
				var loginIconTop = dojo.query(".login")[0];
				dojo.connect(dashboard, "onCredentials", function(credentials){	
					userCredentials = credentials;
					if (dashboard.connection.isLoggedIn()) {
						toggleLoginLogout("in");
						manageAccountFct(dashboard.connection);	
					}
				})
				
				/*
				 * manage account link event handler, displays the accounts of the looged in user
				 */
				var manageAccountLink = dojo.byId("manageAccountLink");
				dojo.connect(manageAccountLink, "onclick", function(event) {
					dojo.empty(linkedContent);
					manageAccountFct(dashboard.connection);
				})
				
				/*
				 * user Profile event handler, displays the profile of the logged in user
				 */
				var userProfileLink = dojo.byId("userProfileLink");
				dojo.connect(userProfileLink, "onclick", function(event) {	
					if (dashboard.connection) {						
						var userProfile = new apstrata.touch.extend.Profile({container: dashboard, useClass: "dashboard"});
						dojo.empty(linkedContent);					
						dojo.place(userProfile.domNode, linkedContent);	
						toggleSelected(userProfileLink);
					}			
				})
				
				/*
				 * workbench link on click event handler
				 */
				var workbenchLink = dojo.byId("workbenchLink");
				dojo.connect(workbenchLink, "onclick", function(event) {
					toggleSelected(workbenchLink);
					window.open('<?php echo $config["workbenchUrl"]; ?>', '_blank');
  					window.focus();
				});	
				
				/*
				 * log out link on click event handler
				 */								 
				 dojo.connect(logoutLink, "onclick", function(event) {
				 	logout(event);	
				 });
				 
				
				 /*
				 * log out icon on click event handler
				 */								 
				 dojo.connect(logoutIconTop, "onclick", function(event) {
				 	logout(event);	
				 });				
				
				/*
				 * this function factors out the logic that is shared by the login successful and manage account event handler
				 */
				var manageAccountFct = function(connection) {					
					dojo.style(helloNode, "visibility", "visible");
					//dojo.style(txtNode, "visibility", "visible");
					helloNode.innerHTML = "Hello " + (connection ? connection.credentials.user : "");
					var account = null;
					/*if (connection) { 		
						account = new apstrata.touch.extend.Accounts({container: dashboard, credentials: connection.credentials});
						account.container = dashboard;								
						dojo.place(account.domNode, linkedContent);						
						toggleSelected(manageAccountLink);
					}*/
					
					dojo.require("amc.Init");
		
					dojo.require('apstrata.sdk.TokenConnection');
					dojo.require('apstrata.sdk.Client');
	/*			
					// Instantiate an apstrata token based connection
					amc.globals.sdk.connection = new apstrata.sdk.Connection({
						"credentials": {
						"key": "X1477E086C",
						"secret": "W5BA7B8659529AD9A248C45DAFE36B2B",
						"user": "maya.kassem@elementn.com", 
						"password": "121212"
						},
						"timeout": "10000",
						"serviceURL": "https://10.0.0.93:8446/apstratabase/rest",
						"success": function () {},
						"failure": function () {}
					});
					amc.globals.sdk.client = new apstrata.sdk.Client(amc.globals.sdk.connection);
*/
					amc.globals.sdk.client = new apstrata.sdk.Client(dashboard.connection);
					amc.globals.sdk.connection = dashboard.connection;
					
					dojo.require("apstrata.cms.App");
					
					// These are visual properties used by the application that can not fit in a CSS file yet 			
					apstrata.horizon.magicUIdimensions = {
							"list.SimpleFilterAndSort.width": 35,
							"panel.finalAlpha": .95
						}
					var mainContainer = new apstrata.cms.App({
						showToolbar: false,
						margin:{top: 132, left: 0, right:0, bottom: 26}}, "linkedContent");
		
					mainContainer.startup();		
				}
				
				/*
				 * this function factors out the logic to log out
				 */
				var logout =  function(event) {					
					if (dashboard.connection) {
						toggleSelected(logoutLink);
						toggleLoginLogout("out");
						dashboard.connection.logout({
							success: function() {
								window.location = '<?php echo $config["baseUrl"]; ?>';	
							},
							failure: function() {
								
							}
						})		
					}
				} 
				
				/*
				 * this function factors out the logic to toggle the selected element on the menu				 
				 */
				var toggleSelected = function(newLinkNode) {					
					dojo.toggleClass(lastSelected, "selected");					
					dojo.toggleClass(newLinkNode, "selected");
					lastSelected = newLinkNode;
				}
				
				/*
				 * toggles login/logout links and icons
				 */
				var toggleLoginLogout = function(status) {
					if (status == "in") {
						dojo.style(logoutLinkLine, "display", "block");
						dojo.style(logoutIconTop, "display", "block");
						dojo.style(loginIconTop, "display", "none");						
					}else {
						dojo.style(logoutLinkLine, "display", "block");
						dojo.style(logoutIconTop, "display", "block");
						dojo.style(loginIconTop, "display", "none");	
					}					
				}
				
				//This is required in case we are using token connection
				dashboard.onCredentials();
				
			})		
			
		</script>
		</div>
		<div 
			dojoType="apstrata.home.dashboard.Dashboard"
			loginWidget='loginWidget'
			class= "dashboard"
			id="dashboard"
			curtainNodeClass="content-wrap"
		>
		</div>
	</div>

