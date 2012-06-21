<?php 
	require_once 'config.php';
	include ("wikiProxyLib.php");
	$node = fetchContentFromWiki();
	echo extractSummaryFromWikiNode($node);
?>
