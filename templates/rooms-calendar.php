<?php
/**
 * Context: Rooms Calendar
 */
class Rooms_Calendar{
	function __construct(){
		date_default_timezone_set('America/New_York');

		if (date("G")>=18){ // assuming GMT - 4
			$tomorrow = true;
			$tomorrow_ts = strtotime('tomorrow');
			$timenow = date("G", mktime(0,0,0, date("n", $tomorrow_ts), date("j", $tomorrow_ts), date("Y", $tomorrow_ts)));
		} else {
			$tomorrow = false;
			$timenow = date("G");
		}
		$this->meetings = array(
			'atrium'=> $this->get_meetings('atrium', $tomorrow),
			'garage'=> $this->get_meetings('garage', $tomorrow),
			'cellar'=> $this->get_meetings('cellar', $tomorrow)
		);
		$hours = $rowspan = array();
		for ($hour = 10; $hour < 19; $hour ++){
			$meridiem = 'am';
			$hourprint = $hour;
			if ($hour>12){
				$meridiem = 'pm';
				$hourprint = $hour -12;
			}
			$class = "";
			$class_2 = '';
			if (intval($hour)==intval($timenow)){
				$class=' class="active-1"';
				$class_2 = ' class="active-2"';
			} else if (intval($hour)==intval($timenow)+1){
				$class=' class="active-3"';
				$class_2 = ' class="active-4"';
			} else if (intval($hour)==intval($timenow)+2){
				$class=' class="active-5"';
			} else if (intval($hour)<intval($timenow)){
				$class=' class="past"';
				$class_2 = ' class="past"';
			}
			$hours[$hour]['class'] = $class;
			$hours[$hour]['class2'] = $class2;
			$hours[$hour]['hourprint'] = $hourprint;
			$hours[$hour]['meridiem'] = $meridiem;
		}
			
	}

	function get_meetings($conference_room, $is_tomorrow){
		global $con;

		$name_replace = array("(Atrium) "=> "", "(Cellar) "=>'', '(Garage) '=>'');
		$query = "SELECT content FROM options WHERE name = 'calendar_feed_url'";
		$response = mysqli_query($con, $query);
		$meeting_array = array();
		if (!is_bool($response)){
			if (mysqli_num_rows($response) > 0) {
				$queryOpts = array(
					'orderBy'      =>'startTime',
					'maxResults'   =>25,
					'singleEvents' =>true,
				);
				while ($feed = mysqli_fetch_array($response)) {
					$calendarId = $feed['content'];
					if ($is_tomorrow){
						$tomorrow = strtotime('tomorrow');
						$tomorrow_n = date("n", $tomorrow);
						$tomorrow_j = date("j", $tomorrow);
						$tomorrow_y = date("Y", $tomorrow);
						$queryOpts['timeMin'] = date("Y-m-d\TH:i:sP", mktime(10,0,0,$tomorrow_n,$tomorrow_j,$tomorrow_y));
						$queryOpts['timeMax'] = date("Y-m-d\TH:i:sP", mktime(18,0,0,$tomorrow_n,$tomorrow_j,$tomorrow_y));
						$queryOpts['q'] = $conference_room;
					} else {
						$queryOpts['timeMin'] = date("Y-m-d\TH:i:sP", mktime(10,0,0,date("n"), date("j"), date("Y")));
						$queryOpts['timeMax'] = date("Y-m-d\TH:i:sP", mktime(18,0,0,date("n"), date("j"), date("Y")));
						$queryOpts['q'] = $conference_room;
					}
				}
			}
		}
		$list = get_events_list($calendarId, $queryOpts);

		$i=0;
		foreach($list as $entry){
			$meeting_array[$i]['name']= strtr($entry->summary, $name_replace);
			$meeting_array[$i]['start'] = date("Gi", strtotime($entry->start->dateTime));
			$meeting_array[$i]['end'] = date("Gi", strtotime($entry->end->dateTime));
			$meeting_array[$i]['date'] = date("g:i", strtotime($entry->start->dateTime))."-".date("g:ia", strtotime($entry->end->dateTime));
			$i++;
		}

		return $meeting_array;
	}
}
?>
