<?php
function get_meetings($conference_room, $con, $iftomorrow){
	$name_replace = array("(Atrium) "=> "", "(Cellar) "=>'', '(Garage) '=>'');
	$query = "SELECT content FROM options WHERE name = 'calendar_feed_url'";
	$response = mysqli_query($con, $query);
	$meeting_array = array();
	if (!is_bool($response)){
		if (mysqli_num_rows($response) > 0) {
			$queryOpts = array(
				'orderBy'=>'startTime',
				'singleEvents'=>'true',
			);
			while ($feed = mysqli_fetch_array($response)) {
				$calendarId = explode('/', str_replace('http://www.google.com/calendar/feeds/', '', $feed['content']));
				if ($iftomorrow){
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
	$list = get_events_list(urldecode($calendarId[0]), $queryOpts);

	$i=0;
	foreach($list as $entry){
		$meeting_array[$i]['name']= strtr($entry->title, $name_replace);
		$meeting_array[$i]['start'] = date("Gi", strtotime($entry->start->dateTime));
		$meeting_array[$i]['end'] = date("Gi", strtotime($entry->end->dateTime));
		$meeting_array[$i]['date'] = date("g:i", strtotime($entry->start->dateTime))."-".date("g:ia", strtotime($entry->end->dateTime));
		$i++;
	}
	
	return $meeting_array;
}
if (date("G")>=18){ // assuming GMT - 4
	$tomorrow = true;
	$timenow = date("G", mktime(0,0,0,date("n", strtotime('tomorrow')), date("j", strtotime('tomorrow')), date("Y")));
} else {
	$tomorrow = false;
	$timenow = date("G");
}
$meetings = array(
	'atrium'=> get_meetings('atrium', $con, $tomorrow),
	'garage'=> get_meetings('garage', $con, $tomorrow),
	'cellar'=> get_meetings('cellar', $con, $tomorrow)
);
?>
<section class="wallboard-calendar">
	<table>
		<thead>
			<tr>
				<th></th>
				<th>The Atrium</th>
				<th>The Garage</th>
				<th>The Cellar</th>
			</tr>
		</thead>
		<tbody>
			<?php
			$rowspan = array();
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
				echo '<tr'.$class.'>
						<td>'.$hourprint.' <span class="meridiem">'.$meridiem.'</span></td>';
				
				foreach ($meetings as $room => $roommeetings){
					$has_td = false;
					foreach ($roommeetings as $meeting){
						if ($meeting['start']==$hour.'00' && (!isset($rowspan[$room][$hour-1]) || $rowspan[$room][$hour-1] <= 0)){
							$difference = intval($meeting['end'])-intval($meeting['start']);
							if ($difference==30 || $difference==70){
								$rowspan[$room][$hour] = 0;
								echo '<td class="thirty"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
								$has_td = true;
							} else if ($difference%100 == 0){
								$rowspan[$room][$hour] = (($difference/100)*2)-1;
								echo '<td class="event" rowspan="'.(($difference/100)*2).'"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
								$has_td = true;
							} else if ($difference%100 != 0) {
								$rowspan[$room][$hour] = ((floor($difference/100)*2));
								echo '<td class="event" rowspan="'.((floor($difference/100)*2)+1).'"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
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
							echo '<td class="extra"></td>';
							$rowspan[$room][$hour] = 0;
						} else if ($rowspan[$room][($hour-1)]<=0){
							echo '<td class="extra"></td>';
							$rowspan[$room][$hour] = 0;
						} else {
							//echo '<td>'.$rowspan[$room][$hour-1].'</td>';
							$rowspan[$room][$hour] = $rowspan[$room][($hour-1)] -1;
						}
					}
				}
				echo '</tr>';
				
				if ($hour!==18){
					echo '<tr'.$class_2.'>
							<td>&nbsp;</td>';
				
					foreach ($meetings as $room => $roommeetings){
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
											echo '<td class="thirty"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
											$has_td = true;
											break;
										} else if ($difference%100 == 0){
											$rowspan[$room][$hour] = (($difference/100)*2)-1;
											echo '<td class="event" rowspan="'.(($difference/100)*2).'"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
											$has_td = true;
											break;
										} else if ($difference%100 != 0) {
											$rowspan[$room][$hour] = ((floor($difference/100)*2));
											echo '<td class="event" rowspan="'.((floor($difference/100)*2)+1).'"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
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
								echo '<td class="extra"></td>';
								$rowspan[$room][$hour] = 0;
							}
						} else {								
							$rowspan[$room][$hour] = $rowspan[$room][($hour)] -1;
						}
					}
				
					echo '</tr>';
				}
			}
			?>
		</tbody>
	</table>
</section>
