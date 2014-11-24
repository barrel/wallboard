<?php

require_once 'google-api-php-client/autoload.php'; // or wherever autoload.php is located
	
$service_account_name = '430426449978-j23jkmcs396p6ecckg01hocgdn415j42@developer.gserviceaccount.com';
$key_file_location = __DIR__ ."/priv/Wallboard-2013-999b2ac61d06.p12";

$client = new Google_Client();
$client->setApplicationName("Wallboard 2013");
$client->setDeveloperKey("AIzaSyCtNqYKdfy4WsCk9Ex3KTHC4s9knJHKlQc");
$client->setClientId('430426449978-j23jkmcs396p6ecckg01hocgdn415j42.apps.googleusercontent.com');
$client->setClientSecret('{clientsecret}');
$calendarService = new Google_Service_Calendar($client);

if (isset($_SESSION['service_token'])) {
	$client->setAccessToken($_SESSION['service_token']);
}
$key = file_get_contents($key_file_location);
$cred = new Google_Auth_AssertionCredentials(
	$service_account_name,
	'https://www.googleapis.com/auth/calendar',
	$key
);
$client->setAssertionCredentials($cred);
if ($client->getAuth()->isAccessTokenExpired()) {
	$client->getAuth()->refreshTokenWithAssertion($cred);
}
$_SESSION['service_token'] = $client->getAccessToken();

function get_events_list($calendarId, $queryOpts) {
	global $calendarService;

	$list = array();
	try {
		$list = $calendarService->events->listEvents($calendarId, $queryOpts);
	} catch( Exception $e ) {
		#$e->getMessage();
	}
	return !empty($list) ? $list->items : $list;
}