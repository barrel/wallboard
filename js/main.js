google.load("feeds", "1");

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

// backdoor functions
var backdoor = {
    init: function(){

        $(".chzn-edit-tags").each(function(){
            var id= $(this).attr('id');
            sortSelect($("#"+id));
        });

        // profile edit tags change
        $(".chzn-edit-tags").chosen().change(function(){
            var selected = $(this).val();
            var this_cleaning_day_id = $(this).attr('name');

            $.ajax({
                url: siteUrl+"backdoor/ajax-update_cleaning.php",
                type: "POST",
                data: { cleaning_day_id: this_cleaning_day_id, type: 'remove' },
            }).done(function(data) {
                for (var i=0;i<selected.length;i++){
                    $.ajax({
                        url: siteUrl+"backdoor/ajax-update_cleaning.php",
                        type: "POST",
                        data: { user_id: selected[i], cleaning_day_id: this_cleaning_day_id, type: 'update' },
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

        $('#upload_photo').on('click', function(){
            $('.photos .file').trigger('click');
            $(this).empty().html('<img src="img/ajax-loader.gif" alt=""/>');
        });

        $('.photos .file').AjaxFileUpload({
            action: siteUrl+"backdoor/ajax-upload.php",
            onComplete: function(filename, response) {
                $('.photos ul').prepend('<li><img src="uploads/'+response.name+'" alt="" /><a class="delete" data-id="'+response.photo_id+'" data-url="'+response.name+'">×</a></li>');
                $('#upload_photo').empty().html('Upload Photo');
            }
        });

        $('.photos').delegate('.delete', 'click', function(){
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

        $('.users').delegate('.delete', 'click', function(){
            var $this_item = $(this);
            var this_id = $(this).attr('data-id');
            var this_url = $(this).attr('data-url');
            $.ajax({
                url: siteUrl+"backdoor/ajax-update_user.php",
                type: "POST",
                data: { id: this_id, image_url: this_url, type: 'remove' },
            }).done(function(data) {
                $this_item.parents('tr').remove();
            });	
        });

        $('.users').delegate('.edit', 'click', function(){
            var $this_item = $(this);
            var this_id = $(this).attr('data-id');
            var this_url = $(this).attr('data-url');
            $('.form_edit').remove();
            $('.editing').removeClass('editing');
            $this_item.parents('tr').after('<tr class="form_edit"><td><input type="hidden" name="id" value="'+this_id+'" /><input type="hidden" name="img_val" value="'+this_url+'" /><button class="btn upload_user_photo">+ Photo</button></td><td><input type="text" name="name" placeholder="Name" value="'+$(this).parents('tr').find('td:nth-child(2)').html()+'"/></td><td><input type="text" name="department" placeholder="Department" value="'+$(this).parents('tr').find('td:nth-child(3)').html()+'"/></td><td><button type="submit" class="btn save_user">Save</button></td></tr>');	
            $this_item.parents('tr').addClass('editing');
        });

        $('#new_user').bind('click', function(e){
            e.preventDefault();
            $('.form_edit').remove();
            $('.editing').removeClass('editing');
            $('.users tbody').prepend('<tr class="form_edit"><td><input type="hidden" name="img_val" /><button class="btn upload_user_photo">+ Photo</button></td><td><input type="text" name="name" placeholder="Name"/></td><td><input type="text" name="department" placeholder="Department"/></td><td><button type="submit" class="btn save_user">Save</button></td></tr>');
        });

        $('.users tbody').delegate('.upload_user_photo', 'click', function(){
            $('.users .file').trigger('click');
            $(this).empty().html('<img src="img/ajax-loader.gif" alt=""/>');
        });

        $('.users tbody').delegate('.save_user', 'click', function(e){
            e.preventDefault();
            var $this_item = $(this);
            var name_input = $(this).parents('tr').find('input[name=name]');
            var dept_input = $(this).parents('tr').find('input[name=department]');
            var form_type= 'insert';
            var user_id = '';
            if ($(this).parents('tr').find('input[name=id]').length){
                form_type= 'update';
                user_id= $(this).parents('tr').find('input[name=id]').val();
            }
            if (name_input.val()!=''){
                $.ajax({
                    url: siteUrl+"backdoor/ajax-update_user.php",
                    type: "POST",
                    data: { id: user_id, name: name_input.val(), department: dept_input.val(), image_url: $(this).parents('tr').find('input[name=img_val]').val(), type: form_type },
                }).done(function(json) {
                    var data =JSON.parse(json);
                    if(data.img!=''){
                        $('.form_edit').after('<tr><td><img src="uploads/people/'+data.img+'" alt=""></td><td>'+name_input.val()+'</td><td>'+dept_input.val()+'</td><td><a class="edit pull-left" data-id="'+data.user_id+'" data-url="'+data.img+'">edit</a><a class="delete pull-right" data-id="'+data.user_id+'" data-url="'+data.img+'">&times;</a></td></tr>');
                    } else {
                        $('.form_edit').after('<tr><td><img src="img/default_person.png" alt=""/></td><td>'+name_input.val()+'</td><td>'+dept_input.val()+'</td><td><a class="edit pull-left" data-id="'+data.user_id+'" data-url="'+data.img+'">edit</a><a class="delete pull-right" data-id="'+data.user_id+'" data-url="'+data.img+'">&times;</a></td></tr>');
                    }
                    $this_item.parents('tr').remove();
                    $('.editing').remove();
                });
            } else {
                name_input.addClass('error');
            }
        });

        $('.users .file').AjaxFileUpload({
            action: siteUrl+"backdoor/ajax-upload_user_photo.php",
            onComplete: function(filename, response) {
                $('.users .upload_user_photo').remove();
                $('.users input[name=img_val]').parent('td').append('<img src="uploads/'+response.name+'" alt="" />');
                $('.users input[name=img_val]').val(response.name);
            }
        });
    }
};

// wallboard functions
var wallboard = {
    init: function(){
        this.update_weather();
        this.update_ticker(newsfeed);
        this.photo_slider();
        this.svgs();
        this.weather = window.setInterval(wallboard.update_weather, 60000); // update every 60 sec
        this.time = window.setInterval(wallboard.update_time, 30000); // update every 30 sec
    },
    update_ticker: function(newsfeed){
        $('.news-slider').empty();
        var feed = new google.feeds.Feed(newsfeed);
        feed.load(function(result) {
            if (!result.error) {
                for (var i = 0; i < result.feed.entries.length; i++) {
                    var entry = result.feed.entries[i];
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
    },
    update_time: function() {
        var now = new Date();
        var hours = now.getHours();
        var meridiem = 'a';
        if (hours>12){
            hours = hours - 12;
            meridiem = 'p';
        }
        var minutes = ("0" + now.getMinutes()).slice(-2);
        $('.time').html(hours+':'+minutes+' <span class="meridiem">'+meridiem+'</span>');
    },
    update_weather: function(){
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
    },
    photo_slider: function(){
        wallboard.images = document.getElementById('slideshow').getElementsByTagName('img');
        wallboard.numberOfImages = wallboard.images.length;
        wallboard.i = 1;
        document.getElementById('slideshow').getElementsByTagName('img')[0].className = "fx";
        window.setInterval(wallboard.kenburns, 5000);
    },
    kenburns: function(){
        if (wallboard.i==wallboard.numberOfImages){ 
            wallboard.i = 0;
        }
        wallboard.images[wallboard.i].className = "fx";
        if (wallboard.i===0){ 
            wallboard.images[wallboard.numberOfImages-2].className = "";
        }
        if (wallboard.i===1){ 
            wallboard.images[wallboard.numberOfImages-1].className = "";
        }
        if (wallboard.i>1){ 
            wallboard.images[wallboard.i-2].className = "";
        }
        wallboard.i++;
    },
    svgs: function(){
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
    }
};

$(document).ready(function(){	
    if ($('.wallboard').length){
        wallboard.init();
    } else {
        backdoor.init();
    }    
});
