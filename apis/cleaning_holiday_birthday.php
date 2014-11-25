<?php
// start columns mid wallboard
echo '<section class="wallboard-middle">';
		
	// cleaning crew module
	function get_cleaning_crew($con){
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
		return $user_array;
	}

	$cleaning_crew = get_cleaning_crew($con);
	echo '<div class="col cleaning-crew">
			<h5>Cleaning Crew</h5>
			<ul>';
	foreach($cleaning_crew as $crewmember){
		$path = "uploads/people/".$crewmember['image_url'];
		if ( empty($crewmember['image_url']) || !file_exists(__DIR__."/../$path")) {
			$path = "img/default_person.png";
		}
		echo '<li><img src="./'.$path.'" alt=""/>'.$crewmember['name'].'</li>';
	}
	echo '</ul>
		</div>'; // end cleaning crew module
		
		
	// next holiday module
	function next_holiday($con){
		$replace_array = array(" (Holiday)"=> "",);
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
			'q'            => 'holiday',
			'singleEvents' =>true
		));
		foreach($list as $entry){
			$holiday_array['name']= strtr($entry->summary, $replace_array);
			$holiday_array['date']= date('F jS, Y', strtotime($entry->start->date));
			$first = false;
			if(!$first) break;
		}
		
		return $holiday_array;
	}

	$holiday = next_holiday($con);
	$name_replace = array("'"=> "", " "=> "", "day"=> "", "break"=> "");
	if (!empty($holiday)) {
		echo '<div class="col next-holiday">
				<h5>Next Holiday</h5>
				<img id="holiday-icon" class="svg" src="img/icons_'.strtr(strtolower($holiday['name']),$name_replace).'.svg" alt="'.strtr(strtolower($holiday['name']),$name_replace).'"/>
				<p>'.$holiday['name'].'</p>
				<p class="subtitle">'.date("F jS, Y", strtotime($holiday['date'])).'</p>';
		echo '</div>'; // end next holiday module
	}
	
	// next birthday module
	function next_birthdays($con){
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
					'date' => date('F jS, Y', $time),
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
		return $birthdays;
	}
	$replace = array(' '=>'', '.'=>'', '-'=>'');
	$birthdays = next_birthdays($con);
	echo '<div class="col next-birthdays">
			<h5>Next Birthday</h5>';
	$i=0;
	$nowtime = time();
	$todayisbirthday = false;
	$extraclass="";
	foreach($birthdays as $birthday){
		if ($birthday['time'] >= $nowtime){
			$index = $i;
			if (date("md", $birthday['time']) == date("md", $nowtime)){
				$todayisbirthday = true;
				$extraclass = " today";
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
		} else if ($index==count($birthdays)-1){
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
		echo '<ul>
				<li class="past small-birthday"><img src="./'.$birthdays[$past]['path'].'" alt="'.strtolower($birthdays[$past]['name']).'" /></li>
				<li class="large-birthday">
					<img class="person-image'.$extraclass.'" src="./'.$birthdays[$index]['path'].'" alt="'.strtolower($birthdays[$index]['name']).'" />
					<p>'.$birthdays[$index]['name'].'</p>
					<p class="subtitle">'.date("F jS", strtotime($birthdays[$index]['date'])).'</p>';
					if ($todayisbirthday) 
						echo '<img id="birthday-icon" src="img/icons_birthday-hat.svg" alt=""/>';
		echo '</li>
				<li class="future small-birthday"><img src="./'.$birthdays[$future]['path'].'" alt="'.strtolower($birthdays[$future]['name']).'" /></li></ul>';
	}
	echo '</div>'; // end birthday module
	
echo '</section>'; // end middle wallboard
?>
