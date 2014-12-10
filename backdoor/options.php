<?php 

function get_options_array(){
	$con = Barrel_Wallboard_Api::get_db_con();

	$options_query = "SELECT * FROM options";
	$response = mysqli_query($con, $options_query);
	$options_array = array();

	if (!is_bool($response)){
		if (mysqli_num_rows($response) > 0) {
			while ($options = mysqli_fetch_array($response)) {
				array_push($options_array, $options);
			}
		}
	}
	

	return $options_array;
}

$options = get_options_array($con);
echo '<section class="options preferences">
	<h3>Options</h3>';

foreach($options as $option){ ?>
	<div class="clearfix options_holder">
		<label><?= ucwords($option['label']); ?></label>
		<input class="options" type="text" name="<?= $option['name']; ?>" value="<?= $option['content']; ?>" placeholder="<?= $option['placeholder']; ?>">
	</div>
	<?php
}

echo '</section>';
?>