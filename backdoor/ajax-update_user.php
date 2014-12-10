<?php
function getExtension($str) {
    $i = strrpos($str,".");
    if (!$i) { return ""; }
    $l = strlen($str) - $i;
    $ext = substr($str,$i+1,$l);
    return $ext;
}

include('../inc/barrel-wallboard-api.php');
$con = Barrel_Wallboard_Api::get_db_con();

if ($_REQUEST['type']=='insert'){
    $name = $_REQUEST['name'];
    $department = $_REQUEST['department'];
    $img_url = $_REQUEST['image_url'];
    if(file_exists('../uploads/'.$img_url)&& $img_url!=''){
        $name_array = explode(' ', $name);
        $extension = getExtension($img_url);
        $extension = strtolower($extension);
        $new_image_url = 'team_'.strtolower($name_array[0]).'.'.$extension;
        copy('../uploads/'.$img_url, '../uploads/people/'.$new_image_url);
        @unlink('../uploads/'.$img_url);
    } else {
        $new_image_url = $img_url;
    }
    $user_query = "INSERT INTO users (name, department, image_url) VALUES ('$name', '$department', '$new_image_url')";

    echo json_encode(array( 
        'user_id' => mysqli_insert_id($con),
        'img' => $new_image_url
    ));
} else if ($_REQUEST['type']=='remove') {
    $user_id = intval($_REQUEST['id']);
    $user_query = "DELETE FROM users WHERE id=$user_id";
    if(isset($_REQUEST['image_url'])){
        @unlink('../uploads/people/'.$_REQUEST['image_url']);
    }
}  else if ($_REQUEST['type']=='update') {
    $user_id = intval($_REQUEST['id']);
    $name = $_REQUEST['name'];
    $department = $_REQUEST['department'];
    $img_url = $_REQUEST['image_url'];
    if(file_exists('../uploads/'.$img_url)&& $img_url!=''){
        $name_array = explode(' ', $name);
        $extension = getExtension($img_url);
        $extension = strtolower($extension);
        $new_image_url = 'team_'.strtolower($name_array[0]).'.'.$extension;
        copy('../uploads/'.$img_url, '../uploads/people/'.$new_image_url);
        @unlink('../uploads/'.$img_url);
    } else {
        $new_image_url = $img_url;
    }
    $user_query = "UPDATE users SET name='$name', department='$department', image_url='$new_image_url' WHERE id=$user_id";
    echo json_encode(array( 
        'user_id' => $user_id,
        'img' => $new_image_url
    ));
}  
mysqli_query($con, $user_query);
mysqli_close($con);
?>

