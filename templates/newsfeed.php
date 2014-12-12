<?php 
/**
 * Context: Newsfeed
 */
class Newsfeed {
	public function __construct(){
		$this->feed_items = $this->get_feeds();
	}

	function get_feeds(){
		$feed_xml = @file_get_contents( $this->newsfeed_url() );
		$items = array();
		if ( $feed_xml && $feed = new SimpleXMLElement($feed_xml)) {
			foreach ($feed->channel->item as $item) {
				$items[] = array(
					'title' => $item->title,
					'date' => date('g:i a', strtotime($item->pubDate)),
				);
			}
		}
		return $items;
	}

	function newsfeed_url(){
		$con = Barrel_Wallboard_Api::get_db_con();

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

}
?>