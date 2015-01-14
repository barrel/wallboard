<?php 
/**
 * Context: Upcoming Event
 */
class Upcoming_Event{
	
	public function __construct(){
		date_default_timezone_set('America/New_York');

		$this->upcoming_events();
	}

	function upcoming_events(){
		$con = Barrel_Wallboard_Api::get_db_con();

		$event = $food = array();
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

		$event = get_events_list($calendarId, array(
			'orderBy'      =>'startTime',
			'timeMin'      =>date("Y-m-d\TH:i:sP", strtotime('last month')),
			'maxResults'   =>5,
			'singleEvents' =>true
		));

		foreach($event as $entry){
			if ( strtotime($entry->start->date) < time()) continue;
			$time = strtotime($entry->start->date);
			$this->name = $entry->summary;
			$this->month = date("M", $time);
			$this->day = date("j", $time);
			
			$first = false;
			if(!$first) break;
		}
		
		$query = "SELECT content FROM options WHERE name = 'food_feed_url'";
		$response = mysqli_query($con, $query);
		$event_array = array();
		if (!is_bool($response)){
			if (mysqli_num_rows($response) > 0) {
				while ($feed = mysqli_fetch_array($response)) {
					$calendarId = $feed['content'];
				}
			}
		}
		$food = get_events_list($calendarId, array(
			'orderBy'      =>'startTime',
			'timeMin'      =>date("Y-m-d\TH:i:sP", strtotime('today')),
			'maxResults'   =>5,
			'singleEvents' =>true
		));

		foreach($food as $entry){
			if ( strtotime($entry->start->date) < time()) continue;
			$time = strtotime($entry->start->date);
			list($this->lunch, $this->vendor) = array_map('trim', explode('from', $entry->summary));
			
			$first = false;
			if(!$first) break;
		}
		return;
	}
}
?>