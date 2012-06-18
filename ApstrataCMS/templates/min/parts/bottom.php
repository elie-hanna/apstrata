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
				<div id="footer-wrap">
				<div id="company">
					<ul>
<?php
		foreach ($menu["rightFooterPhp"] as $item) {
?>
						<li><?php echo $cms->getLink($item) ?></li>
<?php
		}
?>			</ul></div>
<div id="social">
<ul class="social-bookmarks">			
						<li><div class="fb-like" data-href="http://www.apstrata.com" data-send="false" data-layout="button_count" data-width="20" data-show-faces="false"></div></li>			
<li><div class="g-plusone" data-size="medium" data-href="http://www.apstrata.com"></div></li>
<li><script src="//platform.linkedin.com/in.js" type="text/javascript"></script>
<script type="IN/Share" data-url="http://www.apstrata.com" data-counter="right"></script></li>
<script type="text/javascript">gapi.plusone.go();</script>


			
					</ul>
				</div>
				</div>
			</div>
		</div>
