<?php 
	include ("wikiProxyLib.php");
	$node = fetchContentFromWiki();
	echo extractSummaryFromWikiNode($node);
?>
