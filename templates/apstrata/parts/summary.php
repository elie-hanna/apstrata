<?php
	$title='';

	if (isset($page["title"])) $title=$page["title"];

?>
<div class='api-summary'>
	<h2><?php print $title; ?></h2>
	<p><?php print extractSummaryFromWikiNode($content); ?></p>
</div>
