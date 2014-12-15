<?php 
/**
 * Context: Time and Weather
 */
class Time_Weather {
	public function __construct(){
		date_default_timezone_set('America/New_York');
		// TODO: possibly add config to backdoor to switch between these for the future

		$this->weekday = date('l');
		$this->date = date('F jS, Y');
		$this->time = date('g:i');
		$this->meridiem = substr(date('a'), 0, 1);
		$this->photo_mode = false;
	}

	/**
	 * Get photos saved in database
	 * @return array of relative image url paths with key of image_url
	 */
	public static function photos(){
		$con = Barrel_Wallboard_Api::get_db_con();

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
		shuffle($options_array);
		return array_slice($options_array, 0, 10);
	}

	/**
	 * Get photos from instagram
	 * @return array of absolute image url paths with key of url
	 */
	public static function instagram(){
		$limit = 20;
		$img = array();

		$instagram = new Instagram\Instagram();
		$instagram->setClientID('535021b4fda14063bd1e898e32438a5e');
		$insta = $instagram->getUser( 207617934 );
		$media = $insta->getMedia();

		foreach($media as $item) {
			if ( $limit < 1 ) break;
			$img[] = $item->getStandardRes();
			$limit -= 1;
		}
		shuffle($img);
		return array('top' => array_slice($img, 0, 16), 'bottom' => array_slice($img, 16, 4));
	}
}

?>
