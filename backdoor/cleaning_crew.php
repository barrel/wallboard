<?php 

function get_cleaning_days_array($con){
	$cleaning_days_query = "SELECT * FROM cleaning_days";
	$response = mysqli_query($con, $cleaning_days_query);
	$cleaning_days_array = array();

	while ($cleaning_day = mysqli_fetch_array($response)) {
		$cleaning_day_id = $cleaning_day['id'];
		$day_query = "SELECT * FROM cleaning_meta WHERE cleaning_day_id = $cleaning_day_id";
		$day_response = mysqli_query($con, $day_query);
		$user_array = array();
		
		if (!is_bool($day_response)){
			if (mysqli_num_rows($day_response) > 0) {
				while ($user_entry = mysqli_fetch_array($day_response)) {
					array_push($user_array, $user_entry['user_id']);
				}
			}
		}
		$cleaning_days_array[] = array(
			'id' => $cleaning_day['id'],
			'name' => $cleaning_day['name'],
			'users' => $user_array
		);
	}

	return $cleaning_days_array;
}

function get_users_array($con){
	$users_array = array();
	$users_query = "SELECT * FROM users";
	$response = mysqli_query($con, $users_query);

	while ($user = mysqli_fetch_array($response)) {
		$users_array[$user['id']] = $user['name'];
	}

	return $users_array;
}


$users = get_users_array($con);
$cleaning_days = get_cleaning_days_array($con);
echo '<section class="cleaning_days preferences">
	<h3>Cleaning Crew</h3>';

foreach($cleaning_days as $cleaning_day){ ?>
	<div class="clearfix edit-tag-holder">
		<p class="lead"><?= ucwords($cleaning_day['name']); ?></p>
		<select id="tags_<?= $cleaning_day['id']; ?>" class="chzn-select chzn-edit-tags" data-placeholder="Add User to Cleaning Day..." tabindex="1" style="width:645px;"  name="<?= $cleaning_day['id']; ?>" multiple>
		<?php 
			foreach($users as $user_id => $username){
				if (in_array($user_id, $cleaning_day['users'])){
					echo '<option value="'.$user_id.'" selected="selected">'.$username.'</option>
					';
				} else {
					echo '<option value="'.$user_id.'">'.$username.'</option>
					';
				}
			}
	 ?>

		</select>
	</div>
	<?php
}

echo '</section>';
?>