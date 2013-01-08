<?php
	$title='';

	if (isset($page["title"])) $title=$page["title"];

?>
<div class='page'>
	<h2><?php print $title; ?></h2>
	<p><?php print extractSummaryFromWikiNode($content); ?></p>
</div>
