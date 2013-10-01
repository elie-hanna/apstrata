	<style type="text/css">
	<?php 
			if ($config["developmentMode"]) { 
		?>

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
    <!-- end side menu -->


	<script type="text/javascript">
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
				_apstrataRoot: apstrata.baseUrl
			})
			dojo.require("apstrata.ui.widgets.LoginWidget");
			dojo.require("dojox.validate.regexp");
			
			var formDefinition = {
				label: "Login",
				cssClass: "loginClass",
				fieldset: [
					{name: "user", required: true, label: "", displayGroup: "user", attrs: {placeHolder: "Your registration email", lowercase: true, maxLength:50, regExpGen: dojox.validate.regexp.emailAddress, invalidMessage : "Enter a valid email address in the format: someone@example.com"}},
					{name: "password", required: true, label: "", type: "password", displayGroup: "user", attrs: {placeHolder: "Your password", maxLength:50}}
				],
				requiredFieldIndicator: "",
				submitAction: 'login',
				actions: ['login']
			};
		
			loginWidget = new apstrata.ui.widgets.LoginWidget({
				useToken: true,
				cssClass: "loginClass",
				type: "user",
				formDefinition: formDefinition,
				_success: function() {window.location = '<?php echo $config["baseUrl"]. "/" . $config["urlPrefix"] ."test-dashboard" ?>';},
				_failure: function() {}
			}).placeAt(dojo.byId('loginID'));	
		
		});
		
	</script>
	<div id="loginID"></div>
