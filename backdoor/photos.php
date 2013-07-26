<?php 

function get_photos_array($con){
	$options_query = "SELECT * FROM photos";
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

$photos = get_photos_array($con);
echo '<section class="photos preferences">
		<h3>Photos</h3>
		<a id="upload_photo" class="btn pull-right">Upload Photo</a>
		<input type="file" class="file invisible" name="file">
			<ul>';

foreach($photos as $photo){ ?>
	<li><img src="uploads/<?= $photo['image_url']; ?>" alt=""><a class="delete" data-id="<?= $photo['id']; ?>" data-url="<?= $photo['image_url']; ?>">&times;</a></li>
	<?php
}

echo '</ul>
</section>';
?>