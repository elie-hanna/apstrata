<?php
	$slogan1='';
	$text1='';
	
	$slogan2='';
	$text2='';

	$slogan3='';
	$text3='';

	if (isset($page["slogan1"])) $slogan1 = str_replace('\n', '', $page["slogan1"]);
	if (isset($page["slogan2"])) $slogan2 = str_replace('\n', '', $page["slogan2"]);
	if (isset($page["slogan3"])) $slogan3 = str_replace('\n', '', $page["slogan3"]);

	if (isset($page["text1"])) $text1=$page["text1"];
	if (isset($page["text2"])) $text2=$page["text2"];
	if (isset($page["text3"])) $text3=$page["text3"];
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
				
				slides = [
					{
						slogan: "<?php print $slogan1; ?>",
						text: "<?php print $text1; ?>"
					},
					{
						slogan: "<?php print $slogan2; ?>",
						text: "<?php print $text2; ?>"
					},
					{
						slogan: "<?php print $slogan3; ?>",
						text: "<?php print $text3; ?>"
					}
				]
				
				dojo.parser.parse()
			})
		</script>

<div class='homePage'>
	<div id="serviceDescription">
		<div dojoType='apstrata.home.Slides' slides='slides'></div>
	</div>
	<div id="searchBar"></div>
	<div id="search-results">
		<div id='searchResults'></div>
	</div>	
</div>