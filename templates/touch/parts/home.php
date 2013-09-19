<?php
	
	$pages = $cms->getPages("homeSlides");
	
?>
<script type="text/javascript">
	
	var items = [];
	<?php 
	
		$index = 0;
		foreach($pages as $item) {		
			
				echo "items[$index] =  {";
				echo " key:'" . $item['key'] . "',\n";
				echo " title:'" . $item['title'] . "',\n";
				echo " regularIcon:'" . $item['regularIcon'] . "',\n";  
				echo " section1:'" .  html_entity_decode(str_replace("'", "\\'", ($item['section1']))) . "',\n";
				echo " section2:'" .  html_entity_decode(str_replace("'", "\\'", ($item['section2']))) . "'\n";
				echo "};\n";
				$index = $index + 1;    
		}
	?>
	
	searchBarTemplate = "../../templates/touch/widgets/SearchBar.html";	
	
	dojo.ready(function() {
		dojo.require("apstrata.touch.extend.SearchBar");
		dojo.require("apstrata.home.Gallery");
		dojo.require("apstrata.home.Slides");		
		dojo.require("apstrata.home.Carousel");
		dojo.require("apstrata.sdk.Connection");
		
		var useConnection = null;	
		var connectionData = {
			credentials: {
				key: '<?php print $GLOBALS["config"]["apstrataKey"]; ?>'								
			},
			serviceURL: '<?php print $GLOBALS["config"]["apstrataServiceURL"]; ?>',
			defaultStore: '<?php print $GLOBALS["config"]["contentStore"]; ?>',
			timeout: parseInt('<?php print $GLOBALS["config"]["apstrataConnectionTimeout"]; ?>')
		}
		
		useConnection = new apstrata.sdk.Connection(connectionData);	
								
		var carousel = new apstrata.home.Carousel({
				items: items,
				autoRotate: true,
				connection: useConnection,
			}, dojo.byId("carouselContainer") );
			
		var navNode = dojo.byId("nav-wrapper");	
		dojo.place(carousel.domNode, navNode, "after");		
			
		var searchBar = new apstrata.touch.extend.SearchBar({onSearch: function(v, category) {
				results.search(v, category)
			}}, dojo.byId("searchBar") );
		
		
		var results = new apstrata.home.Gallery({}, dojo.byId("searchResults") );		
		dojo.parser.parse()
	})
</script>
<div class="container">             	
	<!-- begin content wrap-->
	<div class="content-wrap">
    	<!-- begin content -->
        <div class="content">
			<div class='homePage'>	
				<div id="searchBar"></div>
				<div id="search-results">
					<div id='searchResults'></div>
				</div>	
		</div>
	 <!-- end content -->
        <div class="clearfix"></div>
    </div>
    <!-- end content wrap-->
</div>
 <!-- end wrapper -->	