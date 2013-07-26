<?php 
date_default_timezone_set('America/New_York');
function weather(){
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
		'heavy_intensity_rain'=>'8',
		'light_rain'=>'R',
		'light_intensity_drizzle'=>'R',
		'drizzle'=>'R',
		'heavy_intensity_drizzle'=>'R',
		'very_heavy_rain'=>'8',
		'extreme_rain'=>'8',
		'freezing_rain'=>'8',
		'light_intensity_shower_rain'=>'R',
		'heavy_intensity_shower_rain'=>'8'
	);
	
	$weather_replace = array(
		' ' => '_',
	);
	
	$weather = array();
	$weatherxml = file_get_contents('http://api.openweathermap.org/data/2.5/weather?id=5128581&mode=xml&units=imperial&APPID=4039c138d3a75fe829894408af96b78b');
	$weatherDataLater = new SimpleXMLElement($weatherxml);
	$forecast = $weatherDataLater->temperature->attributes();
	$status = $weatherDataLater->weather->attributes();

	$weather['now_high']=(int)$forecast->max;
	$weather['now_low']=(int)$forecast->min;
	$weather['now_temperature']=(int)$forecast->value;
	$weather['now_icon']='<span class="weather-icon">' . $icons[strtolower(strtr($status->value, $weather_replace))]."</span>";
	
	$weatherxml = file_get_contents('http://api.openweathermap.org/data/2.5/forecast?id=5128581&mode=xml&units=imperial&APPID=4039c138d3a75fe829894408af96b78b');
	$weatherDataLater = new SimpleXMLElement($weatherxml);
	$forecast = $weatherDataLater->forecast;

	foreach($forecast->{'time'} as $time){
		$symbol = $time->symbol->attributes();
		$temperature = $time->temperature->attributes();
		$weather['next_hour_icon'] = '<span class="weather-icon">' . $icons[strtolower(strtr($symbol->name, $weather_replace))]."</span>";
		$weather['next_hour_temperature'] = (int)$temperature->value;
		$first = false;
		if(!$first) break;
	}
	
	$weatherxml = file_get_contents('http://api.openweathermap.org/data/2.5/forecast/daily?q=manhattan,ny&mode=xml&units=imperial&cnt=3&APPID=4039c138d3a75fe829894408af96b78b');
	$weatherDataLater = new SimpleXMLElement($weatherxml);

	$forecast = $weatherDataLater->forecast;

	$i=0;
	foreach($forecast->{'time'} as $time){
		$symbol = $time->symbol->attributes();
		$temperature = $time->temperature->attributes();
		if ($i==1){
			$weather['tomorrow_icon'] = '<span class="weather-icon">' . $icons[strtolower(strtr($symbol->name, $weather_replace))]."</span>";
			$weather['tomorrow_temperature'] = (int)$temperature->day;
		} else if ($i==2){
			$weather['next_icon'] = '<span class="weather-icon">' . $icons[strtolower(strtr($symbol->name, $weather_replace))]."</span>";
			$weather['next_temperature'] = (int)$temperature->day;
		}
		$i++;
	}
	$weather['date']=date("M. j @ g:ia");
	return $weather;
}
		
echo json_encode(weather());
?>