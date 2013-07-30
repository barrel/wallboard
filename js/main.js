google.load("feeds", "1");

function update_time() {
    var now = new Date();
	var hours = now.getHours();
	var meridiem = 'a';
	if (hours>12){
		hours = hours - 12;
		meridiem = 'p';
	}
	var minutes = ("0" + now.getMinutes()).slice(-2);
    $('.time').html(hours+':'+minutes+' <span class="meridiem">'+meridiem+'</span>');
}

function update_weather(){
	$.ajax({
	  url: siteUrl+"apis/weather.php",
	  type: "GET",
	}).done(function(data) {
		weather = JSON.parse(data);
		$('.now-icon').html(weather.now_icon);
		$('.now-temp').html(weather.now_temperature+'<sup>&deg;</sup>');
		$('.now-low').html(weather.now_low+'<sup>&deg;</sup>');
		$('.now-high').html(weather.now_high+'<sup>&deg;</sup>');
		
		$('.next-hour').html(weather.next_hour_icon+weather.next_hour_temperature+'<sup>&deg;</sup>');
		$('.tomorrow').html(weather.tomorrow_icon+weather.tomorrow_temperature+'<sup>&deg;</sup>');
		$('.two-days').html(weather.next_icon+weather.next_temperature+'<sup>&deg;</sup>');
		$('.updated-datetime').html('Last updated:'+weather.date);
	});	
}

function update_ticker(newsfeed){
	$('.news-slider').empty();
	var feed = new google.feeds.Feed(newsfeed);
	feed.load(function(result) {
		if (!result.error) {
			for (var i = 0; i < result.feed.entries.length; i++) {
				var entry = result.feed.entries[i];
				console.log(entry);
				var news_date = new Date(entry.publishedDate);
				var hours = news_date.getHours();
				var meridiem = 'am';
				if (hours>12){
					hours = hours - 12;
					meridiem = 'pm';
				}
				var minutes = ("0" + news_date.getMinutes()).slice(-2);
				$('.news-slider').append('<li><p>'+entry.title +'<span class="news-time">'+hours+':'+minutes+' '+meridiem+'</span></p></li>');
			}
			$('.news-slider').slider({
				ticker: true,
				speed: 100000
			});
		}
	});
	 
	
}

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
	  
	if ($('.photos-slider').length){
		var images = document.getElementById('slideshow').getElementsByTagName('img'),
			numberOfImages = images.length,
			i = 1;
		function kenBurns() {
			if (i==numberOfImages){ 
				i = 0;
			}
			images[i].className = "fx";
			if (i===0){ 
				images[numberOfImages-2].className = "";
			}
			if (i===1){ 
				images[numberOfImages-1].className = "";
			}
			if (i>1){ 
				images[i-2].className = "";
			}
			i++;
		}
		document.getElementById('slideshow').getElementsByTagName('img')[0].className = "fx";
		window.setInterval(kenBurns, 5000);
	}
	
	if ($('.wallboard').length){
		update_weather();
		update_ticker(newsfeed);
		window.setInterval(update_weather, 5000);
		window.setInterval(update_time, 5000);
		//window.setInterval(update_ticker, 500000);
	}
	
	
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
	
	/*  Replace all SVG images with inline SVG */
	$('img.svg').each(function(){
		var $img = $(this);
		var imgID = $img.attr('id');
		var imgClass = $img.attr('class');
		var imgURL = $img.attr('src');

		$.get(imgURL, function(data) {
			// Get the SVG tag, ignore the rest
			var $svg = $(data).find('svg');
			// Add replaced image's ID to the new SVG
			if (typeof imgID !== 'undefined') {
				$svg = $svg.attr('id', imgID);
			}
			// Add replaced image's classes to the new SVG
			if (typeof imgClass !== 'undefined') {
				$svg = $svg.attr('class', imgClass+' replaced-svg');
			}
			// Remove any invalid XML tags as per http://validator.w3.org
			$svg = $svg.removeAttr('xmlns:a');
			// Replace image with new SVG
			$img.replaceWith($svg);
		});
	});
});