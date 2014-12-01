<?php 
$page       = 'wallboard';
$pagename   = "Home";
$components = array(
	'time-weather', 'cleaning-holiday-birthday', 'upcoming-event', 'rooms-calendar', 'newsfeed'
);
include('inc/barrel-wallboard-api.php');
include('header.php'); 

Barrel_Wallboard_Api::load_components($components);

/*
include('apis/time_weather.php'); 	
include('apis/cleaning_holiday_birthday.php');
include('apis/upcoming.php'); 	
include('apis/conference_rooms_calendar.php');
include('apis/newsfeed.php');
*/

include('footer.php'); 		
?>