		<div class='sideButton'>fork this site from github</div>

		<div id='header'>
			<div class='contentFrame'>
				<div id='header-inner'>
					<a href="<?php echo $cms->getUrl('/'); ?>" id='logo'></a>
					<div id='menu'>
<?php
		foreach ($menu["menuPhp"] as $menuItem) {
?>
						<div class='menu-item'>
							<?php echo $cms->getLink($menuItem) ?>
						</div>
<?php
		}
?>
					</div>
				</div>
			</div>
		</div>
