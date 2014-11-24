<?php 
$page='wallboard';
$pagename="Home";
include('header.php'); 

include('apis/google_calendar.php');
include('apis/time_weather.php'); 	
include('apis/cleaning_holiday_birthday.php');
include('apis/upcoming.php'); 	
include('apis/conference_rooms_calendar.php');
include('apis/newsfeed.php');
	
include('footer.php'); 		
?>