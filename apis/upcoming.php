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
					$calendarId = explode('/', str_replace('http://www.google.com/calendar/feeds/', '', $feed['content']));
					$feed_url = $feed['content'].'?orderby=starttime&sortorder=ascending&futureevents=true&singleevents=true';
				}
			}
		}
		
		$list = get_events_list($calendarId, array(
			'orderBy'	  =>'startTime',
			'futureEvents' =>'true',
			'singleEvents' =>'true'
		));

		foreach($list as $entry){
			$event_array['name']= $entry->title;
			$namespaces = $entry->getNameSpaces(true);
			$events = $entry->children($namespaces['gd']);
			$event = $events->when->attributes();
			$event_array['date']= date("M. j", strtotime($event->startTime));
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