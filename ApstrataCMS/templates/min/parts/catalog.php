<?php
	$title='';
	$description='';
	$section2='';
	$firstQuery=array();
	$secondQuery=array();

	if (isset($page["title"])) $title=$page["title"];
	if (isset($page["description"])) $description=$page["description"];
	if (isset($page["firstQuery"])) $firstQuery= json_decode($page["firstQuery"]);
	if (isset($page["secondQuery"])) $secondQuery= json_decode($page["secondQuery"]);

	$page1 = 1;
	if (isset($_GET['catalog-page1'])){
	   $page1 = $_GET['catalog-page2'];
	}

	$page2 = 1;
	if (isset($_GET['catalog-q2-page'])){
	   $page2 = $_GET['catalog-q2-page'];
	}

?>
<div class='page catalogPage'>
	<h2><?php print $title; ?></h2>

	<div class="pageDescription"><?php print $description; ?></div>


	<div>first query: page <?php print $page1; ?> of <?php print ceil($firstQuery->count/11); ?></div>
	<div class='slides'>
		<?php
				foreach ($firstQuery->documents as $item) {
		?>
			<div class='slide'>
				<div class='title'>
					<?php print $item->title; ?><br>
				</div>
				<div class='itemDescription'>
					<?php print $item->section1; ?><br>		
				</div>
			</div>
		<?php
				}
		?>
	</div>
	
	<div style="clear: both;"></div>
	
	<br>
	<div>second query: page <?php print $page2; ?> of <?php print ceil($firstQuery->count/11); ?></div>
	<?php
			foreach ($secondQuery->documents as $item) {
	?>
		<div class='title'>
			<?php print $item->title; ?><br>
		</div>
		<div class='itemDescription'>
			<?php print $item->section1; ?><br>		
		</div>
	<?php
			}
	?>
	
</div>