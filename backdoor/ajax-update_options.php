<?php
	include('../con.php');
	$name = $_REQUEST['name'];
	$content = mysqli_real_escape_string($con, $_REQUEST['content']);
	$options_query = "UPDATE options SET content='$content' WHERE name='$name'";
	mysqli_query($con, $options_query);
	mysqli_close($con);
?>