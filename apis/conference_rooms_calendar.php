<?php
function get_meetings($conference_room, $con){
	$name_replace = array("(Atrium) "=> "", "(Cellar) "=>'', '(Garage) '=>'');
	$query = "SELECT content FROM options WHERE name = 'calendar_feed_url'";
	$response = mysqli_query($con, $query);
	$meeting_array = array();
	if (!is_bool($response)){
		if (mysqli_num_rows($response) > 0) {
			while ($feed = mysqli_fetch_array($response)) {
				$feed_url = str_replace('basic', 'full', $feed['content']).'?orderby=starttime&sortorder=ascending&singleevents=true&start-min='.date("Y-m-d\TH:i:sP", mktime(10,0,0,date("n"), date("j"), date("Y"))).'&start-max='.date("Y-m-d\TH:i:sP", mktime(18,0,0,date("n"), date("j"), date("Y"))).'&q='.$conference_room;
			}
		}
	}
	$xml_source = file_get_contents($feed_url);
	$xml = simplexml_load_string($xml_source);
	$i=0;
	foreach($xml->{'entry'} as $entry){
		$meeting_array[$i]['name']= strtr($entry->title, $name_replace);
		$namespaces = $entry->getNameSpaces(true);
		$events = $entry->children($namespaces['gd']);
		$event = $events->when->attributes();
		$meeting_array[$i]['start'] = date("Gi", strtotime($event->startTime));
		$meeting_array[$i]['end'] = date("Gi", strtotime($event->endTime));
		$meeting_array[$i]['date'] = date("g:i", strtotime($event->startTime))."-".date("g:ia", strtotime($event->endTime));
		$i++;
	}
	
	return $meeting_array;
}

$meetings = array(
	'atrium'=> get_meetings('atrium', $con),
	'garage'=> get_meetings('garage', $con),
	'cellar'=> get_meetings('cellar', $con)
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
			$timenow = date("G");
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
						if ($meeting['start']==$hour.'00'){
							$difference = intval($meeting['end'])-intval($meeting['start']);
							if ($difference==30 || $difference==70){
								$rowspan[$room][$hour] = false;
								echo '<td class="thirty"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
								$has_td = true;
							} else if ($difference%100 == 0){
								$rowspan[$room][$hour] = true;
								echo '<td class="event" rowspan="'.(($difference/100)*2).'"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
								$has_td = true;
							} else if ($difference%100 != 0) {
								$rowspan[$room][$hour] = true;
								echo '<td class="event" rowspan="'.((floor($difference/100)*2)+1).'"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
								$has_td = true;
							} else {
								$rowspan[$room][$hour] = false;
							}
						} else {
							$rowspan[$room][$hour] = false;
						}
						if ($has_td){
							break;
						}
					}
					if (!$has_td){
						if (!isset($rowspan[$room][($hour-1)])){
							echo '<td></td>';
						} else if (!$rowspan[$room][($hour-1)]){
							echo '<td>'.$rowspan[$room][$hour -1].'</td>';
						}
					}
				}
				
				echo '</tr>';
				
				echo '<tr'.$class_2.'>
						<td>&nbsp;</td>';
				
				foreach ($meetings as $room => $roommeetings){
					$has_td = false;
					if (!$rowspan[$room][$hour]){
						foreach ($roommeetings as $meeting){
							if ($meeting['start']==$hour.'30'){
								$difference = intval($meeting['end'])-intval($meeting['start']);
								if ($difference==30 || $difference==70){
									$rowspan[$room][$hour] = false;
									echo '<td class="thirty"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
									$has_td = true;
									break;
								} else if ($difference%100 == 0){
									$rowspan[$room][$hour] = true;
									echo '<td class="event" rowspan="'.(($difference/100)*2).'"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
									$has_td = true;
									break;
								} else if ($difference%100 != 0) {
									$rowspan[$room][$hour] = true;
									echo '<td class="event" rowspan="'.((floor($difference/100)*2)+1).'"><span class="event-border">&nbsp;</span>'.$meeting['name'].'<span class="e-time">'.$meeting['date'].'</span></td>';
									$has_td = true;
									break;
								} else {
									$rowspan[$room][$hour] = false;
								}
							} else {
								$rowspan[$room][$hour] = false;
							}
						}
						if (!$has_td){
							echo '<td></td>';
						}
					}
				}
				
				echo '</tr>';
			}
			?>
		</tbody>
	</table>
</section>