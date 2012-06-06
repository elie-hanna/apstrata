		<div id='footer'>
			<div class='contentFrame'>
				<div id="shortcuts">
					<ul>
<?php
		foreach ($menu["leftFooterPhp"] as $item) {
?>
						<li><?php echo $cms->getLink($item) ?></li>
<?php
		}
?>
					</ul>
				</div>
				<div id="social">
					<ul>
<?php
		foreach ($menu["rightFooterPhp"] as $item) {
?>
						<li><?php echo $cms->getLink($item) ?></li>
<?php
		}
?>
						<li><div class='facebookLikeButton'></div></li>
						<li>+1</li>
					</ul>
				</div>
			</div>
		</div>
