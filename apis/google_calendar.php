<?php

class Barrel_Wallboard_Api {
	public $calendarService;

	public $applicationName = "Wallboard 2013";

	public $developerKey = "AIzaSyCtNqYKdfy4WsCk9Ex3KTHC4s9knJHKlQc";

	public $serviceAccount = '430426449978-j23jkmcs396p6ecckg01hocgdn415j42@developer.gserviceaccount.com';

	public $keyFile = "/priv/Wallboard-2013-999b2ac61d06.p12";

	public $permissions = array(
		'https://www.googleapis.com/auth/calendar'
	);

	/**
	 * Constructor function: init google services for calendar api
	 * Set session service token
	 * @param void
	 * @return void
	 */
	public function __construct(){
		require_once 'google-api-php-client/autoload.php'; // or wherever autoload.php is located

		$client = new Google_Client();
		$client->setApplicationName($this->applicationName);
		$client->setDeveloperKey($this->developerKey);
		$client->setClientId('430426449978-j23jkmcs396p6ecckg01hocgdn415j42.apps.googleusercontent.com');
		$client->setClientSecret('notasecret');
		$this->calendarService = new Google_Service_Calendar($client);

		if (isset($_SESSION['service_token'])) {
			$client->setAccessToken($_SESSION['service_token']);
		}
		$key = file_get_contents(__DIR__ . $this->keyFile);
		$cred = new Google_Auth_AssertionCredentials(
			$this->serviceAccount,
			$this->permissions,
			$key,
			'notasecret',
			'http://oauth.net/grant_type/jwt/1.0/bearer',
			'calendar@barrelny.com'
		);
		$client->setAssertionCredentials($cred);
		if ($client->getAuth()->isAccessTokenExpired()) {
			$client->getAuth()->refreshTokenWithAssertion($cred);
		}
		$_SESSION['service_token'] = $client->getAccessToken();
	}

	/**
	 * Get the events list for a specified calendar
	 * @param $calendarId string formatted like an email address
	 * @param $queryOpts array of key/value pairs specific to api request
	 * @return array|object list of calendar event objects or main event object
	 */
	public function get_events_list($calendarId, $queryOpts) {
		$list = array();
		try {
			$list = $this->calendarService->events->listEvents($calendarId, $queryOpts);
		} catch( Exception $e ) {
			printf('<script type="text/javascript">console.log("%s");</script>', $e->getMessage());
			#printf("<pre>%s</pre>", print_r($_SESSION['service_token'], true));
		}
		return !empty($list) ? $list->items : $list;
	}
}

$GLOBALS['Wallboard_Api'] = new Barrel_Wallboard_Api();

/**
 * Wrapper for the class method of the same name
 */
function get_events_list($calendarId, $queryOpts){
	global $Wallboard_Api;
	return $Wallboard_Api->get_events_list($calendarId, $queryOpts);
}