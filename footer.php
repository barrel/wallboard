
		<script>var siteUrl = "<?php if ($production){ echo '/'; } else { echo 'http://10.0.1.226/wallboard/'; } ?>";</script>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
		<script>window.jQuery || document.write('<script src="js/lib/jquery-1.9.1.min.js"><\/script>')</script>
		<script src="js/wallboard.min.js"></script>
		<?php if (!$production){ ?><script src="http://localhost:35729/livereload.js"></script><?php } ?>
	</body>
</html><?php mysqli_close($con); ?>