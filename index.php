<?php 
$page       = 'wallboard';
$pagename   = "Home";
$components = array(
	'time-weather'              => 60*30,    # 30 min
	'cleaning-holiday-birthday' => 60*60*24, # 24 hrs
	'upcoming-event'            => 60*60*12, # 12 hrs
	'rooms-calendar'            => 60*15,    # 15 min
	'newsfeed'                  => 60*60*24  # 24 hrs
);

include('inc/barrel-wallboard-api.php');

include('header.php'); 

Barrel_Wallboard_Api::load_components($components);

include('img/icons.svg'); 		
include('footer.php'); 		
?>