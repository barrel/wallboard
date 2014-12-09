
		<div class="hidden"><?php include('img/icons.svg'); ?></div>
		<script>var siteUrl = "<?php echo (Barrel_Wallboard_Api::is_production()) ? '/' : '/wallboard/'; ?>";</script>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
		<script>window.jQuery || document.write('<script src="js/lib/jquery-1.9.1.min.js"><\/script>')</script>
		<script type="text/javascript" src="https://www.google.com/jsapi"></script>
		<script src="js/wallboard.js"></script>
		<?php if (!Barrel_Wallboard_Api::is_production()): ?><script src="http://localhost:35729/livereload.js"></script><?php endif; ?>
	</body>
</html><?php mysqli_close( Barrel_Wallboard_Api::get_db_con() ); ?>