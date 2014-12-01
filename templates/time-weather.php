<?php 
/**
 * Context: Time and Weather
 */
class Time_Weather {
	public function __construct(){
		date_default_timezone_set('America/New_York');

		$this->weekday = date('l');
		$this->date = date('F jS, Y');
		$this->time = date('g:i');
		$this->meridiem = substr(date('a'), 0, 1);
		
	}

	public static function photos(){
		global $con;

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

}

?>
