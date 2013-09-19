<?php
  
	$title='';
	$description='';
	$section2='';
	$firstQuery=array();
	$secondQuery=array();
	
	if (isset($page["title"])) $title=$page["title"];
	if (isset($page["description"])) $description=$page["description"];
	
	if (isset($page["firstQuery"])) $firstQuery= (object)($page["firstQuery"]);
	if (isset($page["secondQuery"])) $secondQuery= (object)($page["secondQuery"]);

	$page1 = 1;
	if (isset($_GET['catalog-page1'])){
	   $page1 = $_GET['catalog-page2'];
	}

	$page2 = 1;
	if (isset($_GET['catalog-q2-page'])){
	   $page2 = $_GET['catalog-q2-page'];
	}

?>

<script>
    dojo.require("apstrata.sdk.Connection");
	var connectionData = {
			credentials: {
				key: '<?php print $GLOBALS["config"]["apstrataKey"]; ?>'								
			},
			serviceURL: '<?php print $GLOBALS["config"]["apstrataServiceURL"]; ?>',
			defaultStore: '<?php print $GLOBALS["config"]["contentStore"]; ?>',
			timeout: parseInt('<?php print $GLOBALS["config"]["apstrataConnectionTimeout"]; ?>')
		}
		
	var connection = new apstrata.sdk.Connection(connectionData);
	
</script>

<!-- TODO: implement pagination <div>first query: page <?php print $page1; ?> of <?php print ceil($firstQuery->count/11); ?></div>-->

    	<h1 class="marB20"><?php print $title; ?></h1>
    	
    	<?php
			foreach ($firstQuery->documents as $item) {		
				
				$item = (object)$item;
		?>	
    	
    		
			<!-- begin case study -->
			<div class="case-study">
			    <script> 
			        // Build the URL to the image file
			    	var params = {
						"apsdb.fieldName": "regularIcon",
						"apsdb.fileName": "<?php echo $item->regularIcon ?>",
						"apsdb.store": "apstrata",
						"apsdb.documentKey": "<?php echo $item->key ?>"
					};
			      
			    var imageUrl = connection.sign("GetFile", dojo.objectToQuery(params)).url;           
			    </script>
			    <?php 
			       if (isset($item->regularIcon)) {
			       		echo "<div class='image'><div class='img-wrap'><img id='" . $item->regularIcon . "'/></div></div>";
					}
			       print html_entity_decode($item->section1);
			     ?>
			     <script>
			        <?php echo "dojo.byId('" . $item->regularIcon . "').src = imageUrl"; ?>
			     </script>
			</div>
			<!-- end case study -->
			
		<?php
				}
		?>	
					
	 </div>
      
	