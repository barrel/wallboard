<?php $page='wallboard';
$pagename="Home";
include('header.php'); 

	// start top wallboard
	echo '<section class="wallboard-top">';
	
	// photos slider
	function get_photos_array($con){
		$options_query = "SELECT * FROM photos";
		$response = mysqli_query($con, $options_query);
		$options_array = array();

		if (!is_bool($response)){
			if (mysqli_num_rows($response) > 0) {
				while ($options = mysqli_fetch_array($response)) {
					array_push($options_array, $options);
				}
			}
		}
		return $options_array;
	}
	$photos = get_photos_array($con);
	echo '<div id="slideshow" class="photos-slider">';
	foreach($photos as $photo){
		echo '<img src="uploads/'.$photo['image_url'].'" alt="" />';
	}
	echo '</div>';
	
	// get time and weather
	echo '<div class="time-weather">
			<div class="col col-date">
				<span class="weekday">'.date('l').'</span>
				<span class="date">'.date('F jS, Y').'</span>
				<span class="time">'.date('g:i').' <span class="meridiem">'.substr(date('a'), 0, 1).'</span></span>
			</div>
			<div class="col col-weather">
				<div class="current-weather">
					<div class="location wet-sec">
						<div class="now-icon"></div>
					</div>
					<h4 class="locationname">New York</h4>
					<div class="number wet-sec">
						<h2 class="now-temp"></h2>
					</div>
					<div class="low wet-sec pull-right">
						<h4>Low</h4>
						<h3 class="now-low"></h3>
					</div>
					<div class="high wet-sec pull-right">
						<h4>Hi</h4>
						<h3 class="now-high"></h3>
					</div>
					<span class="updated-datetime"></span>
				</div>
				<div class="upcoming-weather">
					<div class="col-3">
						<h4>Next Hour</h4>
						<h3 class="next-hour"></h3>
					</div>
					<div class="col-3">
						<h4>Tomorrow</h4>
						<h3 class="tomorrow"></h3>
					</div>
					<div class="col-3">
						<h4>2 Days</h4>
						<h3 class="two-days"></h3>
					</div>
				</div>
			</div>
			';
	echo '</div>';
	
	echo '</section>'; // end top wallboard
?>


<?php include('footer.php'); ?>