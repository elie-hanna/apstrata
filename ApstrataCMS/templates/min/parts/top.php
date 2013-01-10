		<div class='sideButton'><a href='http://wiki.apstrata.com/display/doc/Apstrata+CMS' target='_googleCode'>fork this site from google code</a></div>

		<div id='header'>
			<div class='contentFrame'>
				<div id='header-inner'>
					<a href="<?php print $GLOBALS["config"]["baseUrl"]; ?>" id='logo'></a><!-- ap<span style='color: #ff8000;'>((</span>strata -->
					<div id='menu'>
					
					
<?php			
		$totalCharacters = 0;		
		foreach ($menu["menuPhp"] as $menuItem) {
			
			$totalCharacters = $totalCharacters + strlen($menuItem["title"]);			
?>	
						
						<div class='menu-item'>
							<?php echo $cms->getLink($menuItem) ?>
						</div>						
<?php
		}
		
		echo "<script>var totalCharacters = ".$totalCharacters."</script>";
?>

<script type="text/javascript">

	dojo.ready(function() {
		
		var initialCharacterCount = 4 * 12;
		var initialPaddingCount = 4 * 2;
		var menuItemQuery = ".min #menu .menu-item a";
		
		// The initial menu was styled to fit 4 items of 12 characters each. 
		// If more items are added we need to shrink the font size and paddings of all items so they can fit 
		// We will shrink by a proportional ratio for every new item.
		// The maximum allowed number of items in the menu is 9, with a maximum of 12 characters each
		// A combination is actually allowed as long as the maximum threshold of characters is 9 * 12
		// Over this limit, layout will not be consistent
		
		// Retrieve the nodes of the menu elements
		var menuItems = dojo.query(menuItemQuery);
		var initialFontSize = "16px";
		var initialPaddingLeft = "15px";
		var initialPaddingRight = "15px";		
		if (menuItems && menuItems.length > 0) {
			initialFontSize = dojo.style(menuItems[0], "fontSize");
			initialFontSize = initialFontSize.substring(0, initialFontSize.length - 2); // remove the 'px'
			initialPaddingLeft = dojo.style(menuItems[0], "paddingLeft");
			initialPaddingRight =  dojo.style(menuItems[0], "paddingRight");
			var fontRatio = initialCharacterCount / totalCharacters;
			fontRatio = fontRatio > 1 ? 1 : fontRatio;		
			var paddingRatio = initialPaddingCount / (menuItems.length * 2);
			paddingRatio = paddingRatio > 1 ? 1 : paddingRatio;
			dojo.forEach(menuItems, function(item, count){
								
				var newFontSize = Math.round(initialFontSize * fontRatio);
				var newPaddingLeft = Math.round(initialPaddingLeft * paddingRatio);
				var newPaddingRight = Math.round(initialPaddingRight * paddingRatio);
				dojo.style(item, "fontSize", newFontSize + "px");
				dojo.style(item, "paddingLeft", newPaddingLeft + "px");
				dojo.style(item, "paddingRight", newPaddingRight + "px");
			})	
	    }
	}); 
	
</script>
					</div>
				</div>
			</div>
		</div>
