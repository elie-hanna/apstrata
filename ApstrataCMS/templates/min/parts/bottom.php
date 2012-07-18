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
<li><script src="//platform.linkedin.com/in.js" type="text/javascript"></script>
<script type="IN/Share" data-url="http://www.apstrata.com" data-counter="right"></script></li>
<li><div class="g-plusone" data-size="medium" data-href="http://www.apstrata.com"></div></li>
<li><iframe src="//www.facebook.com/plugins/like.php?href=http://www.apstrata.com&amp;send=false&amp;layout=button_count&amp;width=450&amp;show_faces=true&amp;action=like&amp;colorscheme=light&amp;font&amp;height=80" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:100px; height:21px;" allowTransparency="true"></iframe></li>
<script type="text/javascript">gapi.plusone.go();</script>



			
					</ul>
				</div>
				</div>
			</div>
		</div>
