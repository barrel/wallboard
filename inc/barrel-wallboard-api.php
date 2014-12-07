<?php

class Barrel_Wallboard_Api {
	public $calendarService;

	public $mustache;

	public $applicationName = "Wallboard 2013";

	public $developerKey = "AIzaSyCtNqYKdfy4WsCk9Ex3KTHC4s9knJHKlQc";

	public $serviceAccount = '430426449978-j23jkmcs396p6ecckg01hocgdn415j42@developer.gserviceaccount.com';

	public $keyFile = "/priv/Wallboard-2013-999b2ac61d06.p12";

	public $permissions = array(
		'https://www.googleapis.com/auth/calendar'
	);

	/**
	 * Constructor function and autoloader
	 * @param void
	 * @return void
	 */
	public function __construct(){
		include(__DIR__.'/vendor/autoload.php');
		include(__DIR__.'/phpfastcache/phpfastcache.php');
	    phpFastCache::setup("storage","auto");
		$this->_load_google_api();
		$this->_load_mustache();
	}

	/**
	 * Load google services for calendar api; set session service token
	 * @param void
	 * @return void
	 */
	private function _load_google_api(){
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
	 * Load mustache template renderer
	 * @param void
	 * @return void
	 */
	private function _load_mustache(){
		date_default_timezone_set('America/New_York');
		$this->mustache = new Mustache_Engine(array(
			'helpers' => array(
				'home_url' => "/",
				'current_year' => date('Y')
			)
		));
	}

	/**
	 * Load template and contexts
	 * @param array $components associative array of template/context handles and times
	 * @return void
	 */
	public static function load_components($components = array()){
		global $Wallboard_Api;
		$path = __DIR__."/../templates";
		foreach($components as $name => $time) {
			include_once("$path/$name.php");
			$template = file_get_contents("$path/$name.mustache");
			$context = implode('_', array_map('ucfirst', explode('-', $name)));
			
			$cached = null;
			$cache = phpFastCache();
			$cached = $cache->get($name);

			if ( $cached === null ) {
				$cached = $Wallboard_Api->mustache->render($template, new $context());
				$cache->set($name, $cached, $time);
			} else {
				echo "\n<!-- $name Cache Hit -->\n";
			}
			echo $cached;
		}
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