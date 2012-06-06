<?php
	$slogan='';
	$text1='';

	if (isset($page["slogan"])) $slogan=$page["slogan"];
	if (isset($page["text1"])) $text1=$page["text1"];

?>

		<script type="text/javascript">
			dojo.ready(function() {
				dojo.require("apstrata.home.SearchBar")
				dojo.require("apstrata.home.Gallery")
				dojo.require("apstrata.home.Slides")
				
				var searchBar = new apstrata.home.SearchBar({onSearch: function(v, category) {
					results.search(v, category)
				}}, dojo.byId("searchBar") )
				var results = new apstrata.home.Gallery({}, dojo.byId("searchResults") )
				
				dojo.parser.parse()
			})
		</script>

<div class='homePage'>
	<div id="serviceDescription">
		<div dojoType='apstrata.home.Slides' slogan='<?php print $slogan; ?>' text='<?php print $slogan; ?>'></div>
	</div>
	<div id="searchBar"></div>
	<div id="search-results">
		<div id='searchResults'></div>
	</div>	
</div>