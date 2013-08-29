<?php
	function newsfeed_url($con){
		$query = "SELECT content FROM options WHERE name = 'ticker_rss_url'";
		$response = mysqli_query($con, $query);
		$event_array = array();
		if (!is_bool($response)){
			if (mysqli_num_rows($response) > 0) {
				while ($feed = mysqli_fetch_array($response)) {
					$feed_url = $feed['content'];
				}
			}
		}
		return $feed_url;
	}
?>
<section class="wallboard-ticker">
	<ul class="news-slider">
	</ul>
</section>
<script>var newsfeed = "<?= newsfeed_url($con); ?>"</script>