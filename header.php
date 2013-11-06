<?php 
$actual_link = "http://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
if (strpos($actual_link,'dev') !== false){
	$production = false;
} else {
	$production = true;
}
require_once('con.php');
?><!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
	<head>
		<base href="<?php if ($production){ echo '/'; } else { echo '/wallboard/'; } ?>">
		<meta charset="utf-8">
		<meta http-equiv="refresh" content="1500">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<title>Wallboard: <?= $pagename; ?></title>
		<meta name="viewport" content="width=device-width">
		
		
		<!-- styles -->
		<link rel="stylesheet" href="css/wallboard.min.css">
		<script src="js/lib/modernizr-2.6.2.min.js"></script>
	</head>
	<body class="<?= $page; ?>">
