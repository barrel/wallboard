<?php
// start columns mid wallboard
echo '<section class="wallboard-middle">';
		
	// cleaning crew module
	function get_cleaning_crew($con){
		$cleaning_day_id = date("w");
		if ($cleaning_day_id==0 || $cleaning_day_id==6){
			$cleaning_day_id = 1;
		}
		$day_query = "SELECT * FROM cleaning_meta LEFT JOIN users ON cleaning_meta.user_id = users.id WHERE cleaning_day_id = $cleaning_day_id ORDER BY users.name ASC LIMIT 4";
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
		echo '<li><img src="uploads/people/'.$crewmember['image_url'].'" alt=""/>'.$crewmember['name'].'</li>';
	}
	echo '</ul>
		</div>'; // end cleaning crew module
		
		
	// next holiday module
	function next_holiday($con){
		$replace_array = array("When: "=> "", "Event Status: confirmed"=>'', "<br />"=>'', 'Who: Barrel Holidays'=>'');
		$query = "SELECT content FROM options WHERE name = 'holidays_feed_url'";
		$response = mysqli_query($con, $query);
		$holiday_array = array();
		if (!is_bool($response)){
			if (mysqli_num_rows($response) > 0) {
				while ($feed = mysqli_fetch_array($response)) {
					$feed_url = $feed['content'].'?orderby=starttime&sortorder=ascending&futureevents=true&singleevents=true';
				}
			}
		}
		
		$xml_source = file_get_contents($feed_url);
		$xml = simplexml_load_string($xml_source);
		foreach($xml->{'entry'} as $entry){
			$holiday_array['name']= $entry->title;
			$holiday_array['date']= strtr(strip_tags($entry->summary), $replace_array);
			$first = false;
			if(!$first) break;
		}
		
		return $holiday_array;
	}
	$holiday = next_holiday($con);
	$name_replace = array("'"=> "", " "=> "", "day"=> "", "break"=> "");
	echo '<div class="col next-holiday">
			<h5>Next Holiday</h5>
			<img id="holiday-icon" class="svg" src="img/icons_'.strtr(strtolower($holiday['name']),$name_replace).'.svg" alt="'.strtr(strtolower($holiday['name']),$name_replace).'"/>
			<p>'.$holiday['name'].'</p>
			<p class="subtitle">'.date("F jS, Y", strtotime($holiday['date'])).'</p>';
	echo '</div>'; // end next holiday module
	
	
	// next birthday module
	function next_birthdays($con){
		$replace_array = array("When: "=> "", "Event Status: confirmed"=>'', "<br />"=>'', 'Who: calendar@barrelny.com'=>'');
		$query = "SELECT content FROM options WHERE name = 'calendar_feed_url'";
		$response = mysqli_query($con, $query);
		$birthday_array = array();
		if (!is_bool($response)){
			if (mysqli_num_rows($response) > 0) {
				while ($feed = mysqli_fetch_array($response)) {
					$feed_url = $feed['content'].'?orderby=starttime&sortorder=ascending&singleevents=false&q=Birthday&recurrence-expansion-start='.date("Y-m-d\TH:i:sP");
				}
			}
		}
		
		$xml_source = file_get_contents($feed_url);
		$xml = simplexml_load_string($xml_source);
		foreach($xml->{'entry'} as $entry){
			if (strpos(strtolower($entry->title), 'birthday')!==FALSE){
				$thistime = date("md", strtotime(strtr(strip_tags($entry->summary), $replace_array)));
				$birthday_array[$thistime]['name']= str_replace('&#39;s Birthday', '', $entry->title);
				$birthday_array[$thistime]['time']= strtotime(strtr(strip_tags($entry->summary), $replace_array));
				$birthday_array[$thistime]['date']= strtr(strip_tags($entry->summary), $replace_array);
			}
		}
		ksort($birthday_array);
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
		if (date("md", $birthday['time']) >= date("md", $nowtime)){
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
	$past=$index-1;
	$future = $index+1;
	if ($index==0){
		$past = count($birthdays)-1;
	} else if ($index==count($birthdays)-1){
		$future = 0;
	}
	echo '<ul>
			<li class="past small-birthday"><img src="uploads/people/team_'.strtolower(strtr($birthdays[$past]['name'], $replace)).'.jpg" alt="'.strtolower(strtr($birthdays[$past]['name'], $replace)).'" /></li>
			<li class="large-birthday">
				<img class="person-image'.$extraclass.'" src="uploads/people/team_'.strtolower(strtr($birthdays[$index]['name'], $replace)).'.jpg" alt="'.strtolower(strtr($birthdays[$index]['name'], $replace)).'" />
				<p>'.$birthdays[$index]['name'].'</p>
				<p class="subtitle">'.date("F jS", strtotime($birthdays[$index]['date'])).'</p>';
				if ($todayisbirthday){ echo '<img id="birthday-icon" src="img/icons_birthday-hat.svg" alt=""/>'; }
	echo '</li>
			<li class="future small-birthday"><img src="uploads/people/team_'.strtolower(strtr($birthdays[$future]['name'], $replace)).'.jpg" alt="'.strtolower(strtr($birthdays[$future]['name'], $replace)).'" /></li>';
	echo '</div>'; // end birthday module
	
echo '</section>'; // end middle wallboard
?>