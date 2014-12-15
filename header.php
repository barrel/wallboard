<!DOCTYPE html>
<!--[if lt IE 7]><html class="no-js lt-ie9 lt-ie8 lt-ie7"><![endif]-->
<!--[if IE 7]><html class="no-js lt-ie9 lt-ie8"><![endif]-->
<!--[if IE 8]><html class="no-js lt-ie9"><![endif]-->
<!--[if gt IE 8]><!--><html class="no-js"><!--<![endif]-->
	<head>
		<base href="<?= (Barrel_Wallboard_Api::is_production()) ? '/' : '/wallboard/'; ?>">
		<meta charset="utf-8">
		<meta http-equiv="refresh" content="3600">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<title>Wallboard: <?= $pagename; ?></title>
		<meta name="viewport" content="width=device-width">
		
		
		<!-- styles -->
		<link rel="stylesheet" href="./css/wallboard<?php if ($page === 'backdoor'): ?>.back<?php endif; ?>.min.css">
		<script src="./js/lib/modernizr-2.6.2.min.js"></script>
	</head>
	<body class="<?= $page; ?>"<?php if ($page != 'backdoor'): ?> onload="wallboard.init();"<?php endif; ?>>
