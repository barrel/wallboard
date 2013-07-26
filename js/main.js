function sortSelect(selElem) {
	if (selElem.children('optgroup').length){
		selElem.children('optgroup').each(function(){
			var $optgroup = $(this);
			var tmpAry = new Array();
			$optgroup.children('option').each(function(index){
		        tmpAry[index] = new Array();
		        tmpAry[index][0] = $(this).html();
		        tmpAry[index][1] = $(this).attr('value');
			});
		    tmpAry.sort();
			$optgroup.empty();
		    for (var i=0;i<tmpAry.length;i++) {
		        $optgroup.append('<option value="'+tmpAry[i][1]+'">'+tmpAry[i][0]+'</option>');
		    }
		});
	} else {
		var tmpAry = new Array();
		selElem.children('option').each(function(index){
	        tmpAry[index] = new Array();
	        tmpAry[index][0] = $(this).html();
	        tmpAry[index][1] = $(this).attr('value');
			tmpAry[index][2] = false;
			if ($(this).attr('selected')=='selected'){
				tmpAry[index][2] = true;
			}
		});
	    tmpAry.sort();
		selElem.empty();
	    for (var i=0;i<tmpAry.length;i++) {
			if (tmpAry[i][2]){
	 	       selElem.append('<option value="'+tmpAry[i][1]+'" selected="selected">'+tmpAry[i][0]+'</option>');
			} else {
 	 	       selElem.append('<option value="'+tmpAry[i][1]+'">'+tmpAry[i][0]+'</option>');
			}
	    }
		selElem.chosen().trigger("liszt:updated");
	}
}

$(document).ready(function(){
	// wallboard functions
	
	
	
	
	
	
	
	
	
	// backdoor functions
	if ($(".chzn-edit-tags").length){
		$(".chzn-edit-tags").each(function(){
			var id= $(this).attr('id');
			sortSelect($("#"+id));
		});
	}
	
	// profile edit tags change
	$(".chzn-edit-tags").chosen().change(function(){
		var selected = $(this).val();
		var this_cleaning_day_id = $(this).attr('name');
		
		$.ajax({
		  url: siteUrl+"backdoor/ajax-remove_cleaning.php",
		  type: "POST",
		  data: { cleaning_day_id: this_cleaning_day_id },
		}).done(function(data) {
			for (var i=0;i<selected.length;i++){
				$.ajax({
				  url: siteUrl+"backdoor/ajax-update_cleaning.php",
				  type: "POST",
				  data: { user_id: selected[i], cleaning_day_id: this_cleaning_day_id },
				}).done(function(data) {
				});
			}
		});
	});
	
	$('.options').bind('keyup', function(){
		$(this).removeClass('success');
	});
	
	$('.options').bind('change', function(){
		var $this_input = $(this);
		var this_content = $(this).val();
		var this_name = $(this).attr('name');
		
		$.ajax({
		  url: siteUrl+"backdoor/ajax-update_options.php",
		  type: "POST",
		  data: { name: this_name, content: this_content },
		}).done(function(data) {
			$this_input.addClass('success');
		});	
	});
	
	if ($('.file').length){
		$('#upload_photo').on('click', function(){
			$('.file').trigger('click');
			$(this).empty().html('<img src="img/ajax-loader.gif" alt=""/>')
		});
		
	    $('.file').AjaxFileUpload({
			onComplete: function(filename, response) {
				$('.photos ul').prepend('<li><img src="uploads/'+response.name+'" alt="" /></li>');
				$('#upload_photo').empty().html('Upload Photo');
			}
	    });
	}
	
	$('.delete').bind('click', function(){
		var $this_item = $(this);
		var this_id = $(this).attr('data-id');
		var this_url = $(this).attr('data-url');
		
		$.ajax({
		  url: siteUrl+"backdoor/ajax-delete_image.php",
		  type: "POST",
		  data: { id: this_id, image_url: this_url },
		}).done(function(data) {
			$this_item.parent('li').remove();
		});	
	});
});