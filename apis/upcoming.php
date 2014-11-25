<?php
// start upcoming
echo '<section class="wallboard-upcoming">
		<h3>Upcoming</h3>';
	// next event module
	function next_event($con){
		$list = array();
		$query = "SELECT content FROM options WHERE name = 'events_feed_url'";
		$response = mysqli_query($con, $query);
		$event_array = array();
		if (!is_bool($response)){
			if (mysqli_num_rows($response) > 0) {
				while ($feed = mysqli_fetch_array($response)) {
					$calendarId = $feed['content'];
				}
			}
		}
		
		$list = get_events_list($calendarId, array(
			'orderBy'	   =>'startTime',
			'timeMin'      => date("Y-m-d\TH:i:sP", time()),
			'singleEvents' =>true
		));

		foreach($list as $entry){
			$event_array['name']= $entry->summary;
			$event_array['date']= date("M. j", strtotime($entry->start->dateTime));
			$first = false;
			if(!$first) break;
		}
		
		return $event_array;
	}
	$event= next_event($con);
	//var_dump($event);
	if (!empty($event)) echo '<h2>'.$event['name'].' – '.$event['date'].'</h2>'; // end next holiday module
	
echo '</section>'; // end middle wallboard
?>