<?php 

function get_users($con){
	$options_query = "SELECT * FROM users ORDER BY name ASC";
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

$users = get_users($con);
echo '<section class="users preferences">
		<h3>Users
            <a id="new_user" class="btn pull-right">New User</a>
            <input type="file" class="file invisible" name="file">
        </h3>
        <table>
            <!--<thead>
                <tr>
                    <th></th>
                    <th class="sortable">Name</th>
                    <th class="sortable">Department</th>
                    <th></th>
                </tr>
                </thead>-->
                <tbody>';

foreach($users as $user){ ?>
    <tr>
    <td><img src="<?= (isset($user['image_url'])&&$user['image_url']!='') ? 'uploads/people/'.$user['image_url'] : 'img/default_person.png'; ?>" alt=""/></td>
        <td><?= $user['name']; ?></td>
        <td><?= $user['department']; ?></td>
        <td>
            <a class="edit pull-left" data-id="<?= $user['id']; ?>" data-url="<?= $user['image_url']; ?>">edit</a>
            <a class="delete pull-right" data-id="<?= $user['id']; ?>" data-url="<?= $user['image_url']; ?>">&times;</a>
        </td>
    </tr>
	<?php
}

echo '</tbody>
    </table>
</section>';
?>
