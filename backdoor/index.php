<?php 
$page     = 'backdoor';
$pagename = "Settings";

include('../inc/barrel-wallboard-api.php');

include('../header.php'); ?>

<div class="container">
	<h2>Wallboard Settings</h2>
	<?php include('options.php'); ?>
	<?php include('photos.php'); ?>
    <?php include('cleaning_crew.php'); ?>
    <?php include('users.php'); ?>
</div>

<?php include('../footer.php'); ?>
