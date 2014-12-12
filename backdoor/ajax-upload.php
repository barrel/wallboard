<?php
	$error = "";
	$filename = "";
	$filesize = "";
	$fileloc = "";
    $fileElementName = 'file';
    $new_id = '';
	if (!empty($_FILES[$fileElementName]['error'])){
		switch($_FILES[$fileElementName]['error']){

			case '1':
				$error = 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
				break;
			case '2':
				$error = 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form';
				break;
			case '3':
				$error = 'The uploaded file was only partially uploaded';
				break;
			case '4':
				$error = 'No file was uploaded.';
				break;
				
			case '6':
				$error = 'Missing a temporary folder';
				break;
			case '7':
				$error = 'Failed to write file to disk';
				break;
			case '8':
				$error = 'File upload stopped by extension';
				break;
			case '999':
			default:
				$error = 'No error code avaiable';
		}
	} elseif(empty($_FILES[$fileElementName]['tmp_name']) || $_FILES[$fileElementName]['tmp_name'] == 'none'){
		$error = 'No file was uploaded..';
	} else {
       define ("MAX_SIZE","5000"); 
	
       
       // This function reads the extension of the file. 
       // It is used to determine if the file is an image by checking the extension. 
       function getExtension($str) {
			$i = strrpos($str,".");
			if (!$i) { return ""; }
			$l = strlen($str) - $i;
			$ext = substr($str,$i+1,$l);
			return $ext;
       }
       
        //reads the name of the file the user submitted for uploading
       $image=$_FILES[$fileElementName]['name'];
       
 		// if it is not empty
 		if ($image){
 			// get the original name of the file from the clients machine
 			$filename = stripslashes($_FILES[$fileElementName]['name']);
 		
 			// get the extension of the file in a lower case format
 	 		$extension = getExtension($filename);
 			$extension = strtolower($extension);
 			// if it is not a known extension, we will suppose it is an error, print an error message 
 			//and will not upload the file, otherwise we continue
 			if (($extension != "jpg")  && ($extension != "jpeg") && ($extension != "png")){
 				$error .= 'Unknown extension!';
 				$errors=1;
 			} else {
 				// get the size of the image in bytes
 				// $_FILES[\'image\'][\'tmp_name\'] is the temporary filename of the file in which 
				//the uploaded file was stored on the server
				list($image_width, $image_height, $image_type) = getimagesize($_FILES[$fileElementName]['tmp_name']);
 				$sizekb=filesize($_FILES[$fileElementName]['tmp_name']);

 				//compare the size with the maxim size we defined and print error if bigger
 				if ($sizekb > MAX_SIZE*1024){
 					$error .= 'You have exceeded the size limit of 5MB!';
 					$errors=1;
 				} else {
					//we will give an unique name, for example the time in unix time format
            		$image_name=substr(md5(rand(0, 100)), 0, 4) . '-' . time().'.'.$extension;
            		//the new name will be containing the full path where will be stored (images folder)
					$this_filename=time().'_'.$image_name;
            		$newname="../uploads/".$this_filename;
           		 	//$copied = copy($_FILES[$fileElementName]['tmp_name'], $newname);
					//$moved = move_uploaded_file($_FILES[$fileElementName]['tmp_name'], $newname);
					switch($image_type) {
				      	case 2:
							$source = imagecreatefromjpeg($_FILES[$fileElementName]['tmp_name']);
					  		$moved = imagejpeg($source,$newname,80); 
							break;
						case 3:
							$source = imagecreatefrompng($_FILES[$fileElementName]['tmp_name']);
							$moved = imagepng($source,$newname,8);  
							break;
				    }
            		//we verify if the image has been uploaded, and print error instead
            		if (!$moved){
						$error .= 'Copy unsuccessfull!';
						$errors=1;
            		} else {
					    include('../inc/barrel-wallboard-api.php');
						$con = Barrel_Wallboard_Api::get_db_con();

                        // save image name to database 
					    $query = "INSERT INTO photos (image_url) VALUES ('$this_filename')";
                        mysqli_query($con, $query);
                        $new_id = mysqli_insert_id($con);
                        mysqli_close($con);
            		}
				}
        	}
 		}

      	// return variables to javascript
		$filename = $_FILES[$fileElementName]['name'];
		$filesize = round(($sizekb/1000), 0);
	}	

	// echo json data
	echo json_encode(array(
        'name'  => $this_filename,
        'photo_id' => $new_id,
		'error' => $error,
	));	
