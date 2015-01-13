<?php
/**
 * Context: Next/Holiday/Birthday
 */
class Upcoming_Dates {
	
	function __construct(){
		date_default_timezone_set('America/New_York');
	}
	
	function cleaning_crew(){
		$con = Barrel_Wallboard_Api::get_db_con();

		$cleaning_day_id = date("w");
		if ($cleaning_day_id==0 || $cleaning_day_id==6){
			$cleaning_day_id = 1;
		}
		$day_query = "SELECT * FROM cleaning_meta LEFT JOIN users ON cleaning_meta.user_id = users.id WHERE cleaning_day_id = $cleaning_day_id ORDER BY users.name ASC";
		$day_response = mysqli_query($con, $day_query);
		$user_array = array();
		if (!is_bool($day_response)){
			if (mysqli_num_rows($day_response) > 0) {
				while ($user_entry = mysqli_fetch_array($day_response)) {
					array_push($user_array, $user_entry);
				}
			}
		}
		foreach ($user_array as $idx => $crewmember) {
			$user_array[$idx]['path'] = "uploads/people/".$crewmember['image_url'];
			if ( empty($crewmember['image_url']) || !file_exists(__DIR__."/../{$user_array[$idx]['path']}")) {
				$user_array[$idx]['path'] = "img/default_person.png";
			}
		}
		return $user_array;
	}

	function next_holiday(){
		$con = Barrel_Wallboard_Api::get_db_con();

		$replace_array = array(" (Holiday)"=> "","(Holiday)"=> "",);
		$name_replace = array("'"=> "", " "=> "", "day"=> "", "break"=> "");

		$query = "SELECT content FROM options WHERE name = 'holidays_feed_url'";
		$response = mysqli_query($con, $query);
		$holiday_array = array();
		if (!is_bool($response)){
			if (mysqli_num_rows($response) > 0) {
				while ($feed = mysqli_fetch_array($response)) {
					$calendarId = $feed['content'];
				}
			}
		}
		
		$list = get_events_list($calendarId, array(
			'orderBy'      =>'startTime',
			'timeMin'      => date("Y-m-d\TH:i:sP", time()),
			'maxResults'   =>3,
			'q'            =>'holiday',
			'singleEvents' =>true
		));
		foreach($list as $entry){
			$holiday_array['name'] = strtr($entry->summary, $replace_array);
			$holiday_array['date'] = date('F jS, Y', strtotime($entry->start->date));
			$holiday_array['name_sanitized'] = strtolower(strtr($holiday_array['name'], $name_replace));
			$first = false;
			if(!$first) break;
		}
		
		return $holiday_array;
	}

	function birthdays(){
		$con = Barrel_Wallboard_Api::get_db_con();

		$query = "SELECT content FROM options WHERE name = 'calendar_feed_url'";
		$birthday_replace = array('&#39; Birthday'=>'', '&#39;s Birthday'=>'');
		$response = mysqli_query($con, $query);
		$birthday_array = array();
		if (!is_bool($response)){
			if (mysqli_num_rows($response) > 0) {
				while ($feed = mysqli_fetch_array($response)) {
					$calendarId = $feed['content'];
				}
			}
		}
		$list = get_events_list($calendarId, array(
			'orderBy'      =>'startTime',
			'timeMin'      => date("Y-m-d\TH:i:sP", strtotime('last month')),
			'singleEvents' =>true,
			'maxResults'   =>10,
			'q'            =>'Birthday'
		));
		foreach($list as $entry){
			if (strpos(strtolower($entry->summary), 'birthday')!==FALSE){
				if ( empty($entry->start->date)) continue;
				$name = substr($entry->summary, 0, strpos($entry->summary, "'"));
				$time = strtotime($entry->start->date);
				$birthday_array[] = array(
					'name' => $name,
					'time' => $time,
					'date' => date('F jS', $time),
				);
			}
		}
		usort($birthday_array, function($a, $b){
			return $a['time'] > $b['time'];
		});
		$birthdays = array();
		$i=0;
		foreach($birthday_array as $birthday){
			$birthdays[$i]=$birthday;
			$i++;
		}
		// next birthday context data
		$replace = array(' '=>'', '.'=>'', '-'=>'');
		$i=0;
		$nowtime = time();
		$extraclass="";
		foreach($birthdays as $idx => $birthday){
			if ($birthday['time'] >= $nowtime){
				$index = $i;
				if (date("md", $birthday['time']) == date("md", $nowtime)){
					$birthdays[$idx]['todayisbirthday'] = true;
				}
				$first = false;
				if(!$first) break;
			}
			$i++;
		}
		if ( isset($index) ) {
			$past=$index-1;
			$future = $index+1;
			if ($index==0){
				$past = count($birthdays)-1;
			} elseif ($index==count($birthdays)-1){
				$future = 0;
			}
			for($j=0;$j<3;$j++) {
				$name_index = $j===0 ? $past : ($j===1 ? $index : $future);
				$path = "uploads/people/team_".strtolower($birthdays[$name_index]['name']).'.jpg';
				if ( !file_exists(__DIR__."/../$path")) {
					$path = "img/default_person.png";
				}
				$birthdays[$name_index]['path'] = $path;
			}
			foreach($birthdays as $idx => $birthday) {
				switch( $idx ) {
					case $past:
					$birthdays['past'] = $birthdays[$idx];
					break;
					case $index:
					$birthdays['current'] = $birthdays[$idx];
					break;
					case $future:
					$birthdays['future'] = $birthdays[$idx];
					break;
					default:
				}
				unset($birthdays[$idx]);
			}
		}
		return $birthdays;
	}
}
?>
