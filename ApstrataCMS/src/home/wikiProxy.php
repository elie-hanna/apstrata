<?php 

include ('../../lib/simplehtmldom/simple_html_dom.php');

$url = "http://wiki.apstrata.com/display/doc/" . $_GET['api'];
$html = file_get_html ($url);
$content = $html->find('#apstrata-summary'); 
$summary = $content[0];

$expandControl = $summary->find('.expand-control');
$expandControl[0]->innertext = '';

$anchors = $summary->find('a');
foreach ($anchors as $link) {
	$link->target = '_new';
	if ((strpos($link->href, 'http://') === FALSE ) && (strpos($link->href, 'https://') === FALSE)) {  
		$link->href = 'http://wiki.apstrata.com' . $link->href;
	}
}

echo $summary; 

?>
