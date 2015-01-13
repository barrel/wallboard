
		<?php if ($page!=='backdoor'): ?>
		<section class="wallboard-footer">
			<h5>Made By Barrel</h5>
		</section>
		<?php endif; ?>
		<script>var siteUrl = "<?php echo (Barrel_Wallboard_Api::is_production()) ? '/' : '/wallboard/'; ?>";</script>
		<?php if ($page==='backdoor'): ?>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
		<script>window.jQuery || document.write('<script src="js/lib/jquery-1.9.1.min.js"><\/script>')</script>
		<?php endif; ?>
		<script src="js/wallboard<?php if ($page==='backdoor') echo '.backdoor'; ?>.min.js"></script>
		<?php if (!Barrel_Wallboard_Api::is_production()): ?><script src="http://localhost:35729/livereload.js"></script><?php endif; ?>
	</body>
</html><?php mysqli_close( Barrel_Wallboard_Api::get_db_con() ); ?>