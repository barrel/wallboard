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
			$this->timenow = date("G", mktime(0,0,0, date("n", $tomorrow_ts), date("j", $tomorrow_ts), date("Y", $tomorrow_ts)));
		} else {
			$tomorrow = false;
			$this->timenow = date("G");
		}
		$this->meetings = array(
			'atrium'=> $this->get_meetings('atrium', $tomorrow),
			'garage'=> $this->get_meetings('garage', $tomorrow),
			'cellar'=> $this->get_meetings('cellar', $tomorrow)
		);
	}
	
	function hours() {
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
			if (intval($hour)==intval($this->timenow)){
				$class=' class="active-1"';
				$class_2 = ' class="active-2"';
			} else if (intval($hour)==intval($this->timenow)+1){
				$class=' class="active-3"';
				$class_2 = ' class="active-4"';
			} else if (intval($hour)==intval($this->timenow)+2){
				$class=' class="active-5"';
			} else if (intval($hour)<intval($this->timenow)){
				$class=' class="past"';
				$class_2 = ' class="past"';
			}
			$hours[$hour]['class'] = $class;
			$hours[$hour]['class2'] = $class_2;
			$hours[$hour]['hourprint'] = $hourprint;
			$hours[$hour]['meridiem'] = $meridiem;
			$hours[$hour]['meetings_html'] = array();

			foreach ($this->meetings as $room => $roommeetings){
				$has_td = false;
				foreach ($roommeetings as $meeting){
					if ($meeting['start']==$hour.'00' && (!isset($rowspan[$room][$hour-1]) || $rowspan[$room][$hour-1] <= 0)){
						$difference = intval($meeting['end'])-intval($meeting['start']);
						if ($difference==30 || $difference==70){
							$rowspan[$room][$hour] = 0;
							$hours[$hour]['meetings_html'][] = '<td class="thirty"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
							$has_td = true;
						} else if ($difference%100 == 0){
							$rowspan[$room][$hour] = (($difference/100)*2)-1;
							$hours[$hour]['meetings_html'][] = '<td class="event" rowspan="'.(($difference/100)*2).'"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
							$has_td = true;
						} else if ($difference%100 != 0) {
							$rowspan[$room][$hour] = ((floor($difference/100)*2));
							$hours[$hour]['meetings_html'][] = '<td class="event" rowspan="'.((floor($difference/100)*2)+1).'"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
							$has_td = true;
						} else {
							$rowspan[$room][$hour] = 0;
						}
					} else {
						$rowspan[$room][$hour] = 0;
					}
					if ($has_td){
						break;
					}
				}
				if (!$has_td){
					if (!isset($rowspan[$room][($hour-1)])){
						$hours[$hour]['meetings_html'][] = '<td class="extra"></td>';
						$rowspan[$room][$hour] = 0;
					} else if ($rowspan[$room][($hour-1)]<=0){
						$hours[$hour]['meetings_html'][] = '<td class="extra"></td>';
						$rowspan[$room][$hour] = 0;
					} else {
						//$hours[$hour]['meetings_html'][] = '<td>'.$rowspan[$room][$hour-1].'</td>';
						$rowspan[$room][$hour] = $rowspan[$room][($hour-1)] -1;
					}
				}
			}
			$hours[$hour]['meetings_html'][] = '</tr>';
			
			if ($hour!==18){
				$hours[$hour]['meetings_html'][] = "<tr$class_2><td>&nbsp;</td>";

				foreach ($this->meetings as $room => $roommeetings){
					$has_td = false;
					if ($rowspan[$room][$hour]==0){
						if (isset($rowspan[$room][($hour-1)]) && $rowspan[$room][($hour-1)]>0){
							$rowspan[$room][$hour] = $rowspan[$room][($hour-1)] -1;
						} else {
							foreach ($roommeetings as $meeting){
								if ($meeting['start']==$hour.'30'){
									$difference = intval($meeting['end'])-intval($meeting['start']);
									if ($difference==30 || $difference==70){
										$rowspan[$room][$hour] = 0;
										$hours[$hour]['meetings_html'][] = '<td class="thirty"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
										$has_td = true;
										break;
									} else if ($difference%100 == 0){
										$rowspan[$room][$hour] = (($difference/100)*2)-1;
										$hours[$hour]['meetings_html'][] = '<td class="event" rowspan="'.(($difference/100)*2).'"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
										$has_td = true;
										break;
									} else if ($difference%100 != 0) {
										$rowspan[$room][$hour] = ((floor($difference/100)*2));
										$hours[$hour]['meetings_html'][] = '<td class="event" rowspan="'.((floor($difference/100)*2)+1).'"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
										$has_td = true;
										break;
									} else {
										$rowspan[$room][$hour] = 0;
									}
								} else {
									$rowspan[$room][$hour] = 0;
								}
							} 
						}
						if (!$has_td){
							$hours[$hour]['meetings_html'][] = '<td class="extra"></td>';
							$rowspan[$room][$hour] = 0;
						}
					} else {								
						$rowspan[$room][$hour] = $rowspan[$room][($hour)] -1;
					}
				}
			
				$hours[$hour]['meetings_html'][] = '</tr>';
			}
			
		}
	#	printf("<pre>%s</pre>", print_r($hours, true)); exit;
		return array_values($hours);
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
