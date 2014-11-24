<?php
date_default_timezone_set('America/New_York');
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'root');
define('DB_PASS', 'apple');
define('DB_NAME', 'wallboard');

$con = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);

/* check connection */
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
} 

?>
