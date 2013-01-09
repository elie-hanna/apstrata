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

	searchBarTemplate = "../../templates/touch/widgets/SearchBar.html";

	dojo.ready(function() {
		dojo.require("apstrata.home.SearchBar");
		dojo.require("apstrata.home.Gallery");
		dojo.require("apstrata.home.Slides");		
		dojo.require("apstrata.home.Carousel");
		
		var items = [
			{section1: '<div class="details-container"><h3>touch cloud is free to use</h3><div class="txt-details">If your application succeeds, then you start paying, before that\'s on us!</div><div class="buttons"><div class="btn yellow large"><input type="submit" value="SIGN UP FOR FREE"></div><div class="btn large tour"><input type="submit" value="TAKE THE TOUR"></div></div><div class="note">Already a member? Click <a href="#">here</a> to sign in.</div></div>', section2: '<div class="control control1"><div class="arrow"></div><h5>11111 what is touch cloud?</h5><div class="">11111 apstrata is a complete BAAS service for web and mobile apps. find out how it can help</div></div>', title: "Title 1", regularIcon: "<?php print $config['baseUrl'] ?>" + "/themes/cms/resources/bin-full.png"},
			{section1: '<div class="details-container"><h3>touch cloud is free to use</h3><div class="txt-details">If your application succeeds, then you start paying, before that\'s on us!</div><div class="buttons"><div class="btn yellow large"><input type="submit" value="SIGN UP FOR FREE"></div><div class="btn large tour"><input type="submit" value="TAKE THE TOUR"></div></div><div class="note">Already a member? Click <a href="#">here</a> to sign in.</div></div>', section2: '<div class="control control1"><div class="arrow"></div><h5>11111 what is touch cloud?</h5><div class="">11111 apstrata is a complete BAAS service for web and mobile apps. find out how it can help</div></div>', title: "Title 1", regularIcon: "<?php print $config['baseUrl'] ?>" + "/themes/cms/resources/bin-full.png"},
			{section1: '<div class="details-container"><h3>touch cloud is free to use</h3><div class="txt-details">If your application succeeds, then you start paying, before that\'s on us!</div><div class="buttons"><div class="btn yellow large"><input type="submit" value="SIGN UP FOR FREE"></div><div class="btn large tour"><input type="submit" value="TAKE THE TOUR"></div></div><div class="note">Already a member? Click <a href="#">here</a> to sign in.</div></div>', section2: '<div class="control control1"><div class="arrow"></div><h5>11111 what is touch cloud?</h5><div class="">11111 apstrata is a complete BAAS service for web and mobile apps. find out how it can help</div></div>', title: "Title 1", regularIcon: "<?php print $config['baseUrl'] ?>" + "/themes/cms/resources/bin-full.png"},
			{section1: '<div class="details-container"><h3>touch cloud is free to use</h3><div class="txt-details">If your application succeeds, then you start paying, before that\'s on us!</div><div class="buttons"><div class="btn yellow large"><input type="submit" value="SIGN UP FOR FREE"></div><div class="btn large tour"><input type="submit" value="TAKE THE TOUR"></div></div><div class="note">Already a member? Click <a href="#">here</a> to sign in.</div></div>', section2: '<div class="control control1"><div class="arrow"></div><h5>11111 what is touch cloud?</h5><div class="">11111 apstrata is a complete BAAS service for web and mobile apps. find out how it can help</div></div>', title: "Title 1", regularIcon: "<?php print $config['baseUrl'] ?>" + "/themes/cms/resources/bin-full.png"}
		];
		
		var carousel = new apstrata.home.Carousel({
				items: items
			}, dojo.byId("carouselContainer") );
			
		var contentNode = dojo.query(".content")[0];	
		dojo.place(carousel.domNode, contentNode, "first");
			
		var searchBar = new apstrata.home.SearchBar({onSearch: function(v, category) {
				results.search(v, category)
			}}, dojo.byId("searchBar") );
		
		
		var results = new apstrata.home.Gallery({}, dojo.byId("searchResults") );		
		dojo.parser.parse()
	})
</script>

<div class='homePage'>	
	<div id="searchBar"></div>
	<div id="search-results">
		<div id='searchResults'></div>
	</div>	
</div>


		