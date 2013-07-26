<?php
	include('../con.php');
	$user_id = intval($_REQUEST['user_id']);
	$cleaning_day_id = intval($_REQUEST['cleaning_day_id']);
	$user_query = "INSERT INTO cleaning_meta (user_id, cleaning_day_id) VALUES ('$user_id', '$cleaning_day_id')";
	mysqli_query($con, $user_query);
	mysqli_close($con);
?>