<?php 
$page       = 'wallboard';
$pagename   = "Home";
$components = array(
	'time-weather'   => 60*30,    # 30 min
	'rooms-calendar' => 60*15,    # 15 min
	'upcoming-dates' => 60*60*24, # 24 hrs
	'upcoming-event' => 60*60*12, # 12 hrs
//	'newsfeed'       => 60*60*24  # 24 hrs
);

include('inc/barrel-wallboard-api.php');

include('header.php'); 

echo '<div class="hidden">';
include('img/icons.svg');
echo '</div>';

Barrel_Wallboard_Api::load_components($components);

include('footer.php'); 		
?>