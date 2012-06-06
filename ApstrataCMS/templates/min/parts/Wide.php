<?php
	$title='';
	$section1='';
	$section2='';
	$relatedItems=array();

	if (isset($page["title"])) $title=$page["title"];
	if (isset($page["section1"])) $section1=$page["section1"];
	if (isset($page["section2"])) $section2=$page["section2"];
	if (isset($page["related"])) $relatedItems=$page["related"];

?>
<div class='page'>
	<h2><?php print $title; ?></h2>
	
	<p><?php print $section1; ?></p>

	<p><?php print $section2; ?></p>
	
<?php

		foreach ($relatedItems as $related) {
?>
						<div class='menu-item'><a href="<?php echo $cms->getUrl($related['url']); ?>"><?php echo $related['label']; ?></a></div>
<?php
		}
?>
	
</div>