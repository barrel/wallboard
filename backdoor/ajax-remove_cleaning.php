<?php
	include('../con.php');
	$cleaning_day_id = intval($_REQUEST['cleaning_day_id']);
	$user_query = "DELETE FROM cleaning_meta WHERE cleaning_day_id=$cleaning_day_id";
	mysqli_query($con, $user_query);
	mysqli_close($con);
?>