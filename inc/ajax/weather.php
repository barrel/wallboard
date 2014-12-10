<?php 

/**
 * Get the weather info
 * @uses http://api.openweathermap.org
 * @param void
 * @return array
 */
function weather(){
	date_default_timezone_set('America/New_York');

	$icons = array(
		'sky_is_clear'=> 'B',
		'few_clouds'=> 'H',
		'scattered_clouds'=> 'N',
		'overcast_clouds'=> 'N',
		'broken_clouds'=> 'Y',
		'shower_rain'=> 'R',
		'moderate_rain'=> 'R',
		'rain'=> '8',
		'thunderstorm'=> '6',
		'snow'=> 'W',
		'mist'=> 'Q',
		'fog'=> 'M',
		'heavy_intensity_rain'=>'8',
		'light_snow'=>'U',
		'light_rain'=>'R',
		'light_rain_and_snow'=>'V',
		'light_intensity_drizzle'=>'R',
		'drizzle'=>'R',
		'heavy_intensity_drizzle'=>'R',
		'very_heavy_rain'=>'8',
		'extreme_rain'=>'8',
		'freezing_rain'=>'8',
		'light_intensity_shower_rain'=>'R',
		'heavy_intensity_shower_rain'=>'8',
		'unknown'=>')'
	);
	$weather_replace = array( ' ' => '_' );
	$weather = $query = array();
	$weather_api = array(
		'url' => 'http://api.openweathermap.org/data/2.5/%s?',
		'base' => array(
			'mode' => 'xml',
			'units' => 'imperial',
			'APPID' => '4039c138d3a75fe829894408af96b78b'
		), // base query data
		'q' => array(
			array(
				'id' => '5128581',
			),
			array(
				'q' => 'manhattan,ny',
				'cnt' => '3'
			)
		), // query data
	);
	foreach($weather_api['q'] as $idx => $q )
		$query[] = http_build_query( $weather_api['base'] + $q );

	/** get the weather info */
	$weatherxml = @file_get_contents(sprintf($weather_api['url'], 'weather').$query[0]);
	if ( $weatherxml && $weatherDataLater = new SimpleXMLElement($weatherxml)) {
		$forecast = $weatherDataLater->temperature->attributes();
		$status = $weatherDataLater->weather->attributes();
		$icon_index = strtolower(strtr($status->value, $weather_replace));

		if ( empty($icons[$icon_index])) {
			error_log("Missing Icon: $icon_index");
			$icon_index = 'unknown';
		}

		$weather['now_high']        = (int)$forecast->max;
		$weather['now_low']         = (int)$forecast->min;
		$weather['now_temperature'] = (int)$forecast->value;
		$weather['now_icon']        = sprintf(
			'<span class="weather-icon">%s</span>', $icons[$icon_index]
		);
	}

	/** get the forecast info */
	$weatherxml = @file_get_contents(sprintf($weather_api['url'], 'forecast').$query[0]);
	if ( $weatherxml && $weatherDataLater = new SimpleXMLElement($weatherxml)) {
		$forecast = $weatherDataLater->forecast;

		foreach($forecast->{'time'} as $time){
			$symbol = $time->symbol->attributes();
			$icon_index = strtolower(strtr($symbol->name, $weather_replace));

			if ( empty($icons[$icon_index])) {
				error_log("Missing Icon: $icon_index");
				$icon_index = 'unknown';
			}
			$temperature = $time->temperature->attributes();
			$weather['next_hour_icon'] = sprintf(
				'<span class="weather-icon">%s</span>', $icons[$icon_index]
			);
			$weather['next_hour_temperature'] = (int)$temperature->value;
			$first = false;
			if(!$first) break;
		}
	}

	/** get the daily forecast info */
	$weatherxml = @file_get_contents(sprintf($weather_api['url'], 'forecast/daily').$query[1]);
	if ( $weatherxml && $weatherDataLater = new SimpleXMLElement($weatherxml) ) {
		$forecast = $weatherDataLater->forecast;

		$i=0;
		foreach($forecast->{'time'} as $time){
			$symbol = $time->symbol->attributes();
			$temperature = $time->temperature->attributes();
			$icon_index = strtolower(strtr($symbol->name, $weather_replace));

			if ( empty($icons[$icon_index])) {
				error_log("Missing Icon: $icon_index");
				$icon_index = 'unknown';
			}
			if ($i==1){
				$weather['tomorrow_icon'] = sprintf(
					'<span class="weather-icon">%s</span>', $icons[$icon_index]
				);
				$weather['tomorrow_temperature'] = (int)$temperature->day;
			} elseif ($i==2){
				$weather['next_icon'] = sprintf(
					'<span class="weather-icon">%s</span>', $icons[$icon_index]
				);
				$weather['next_temperature'] = (int)$temperature->day;
			}
			$i++;
		}
		$weather['date'] = date("M. j @ g:ia");
	}

	return $weather;
}

echo json_encode( weather() );
?>