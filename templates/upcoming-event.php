<?php 
/**
 * Context: Upcoming Event
 */
class Upcoming_Event{
	
	public function __construct(){
		global $con;

		date_default_timezone_set('America/New_York');

		$this->event = $this->next_event($con);
	}

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
			'orderBy'      =>'startTime',
			'timeMin'      =>date("Y-m-d\TH:i:sP", strtotime('last month')),
			'maxResults'   =>5,
			'singleEvents' =>true
		));

		foreach($list as $entry){
			if ( strtotime($entry->start->dateTime) < time()) continue;
			$event_array['name']= $entry->summary;
			$event_array['date']= date("M. j", strtotime($entry->start->dateTime));
			$first = false;
			if(!$first) break;
		}
		
		return $event_array;
	}
}
?>