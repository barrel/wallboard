/*
wallboard - v - 2014-12-31
An app to make a dashboard for the wallboard.
Lovingly coded by BarrelNY Developers  - http://barrelny.com 
*/
var wallboard = {
    init: function(){
		var self = this;
        self.update_weather();
        self.photo_slider();
        self.instagram_module();
        self.time = window.setInterval(wallboard.update_time, 30000); // update every 30 sec
    },
    update_time: function() {
        var now = new Date(),
            hours = now.getHours(),
            meridiem = hours > 12 ? 'p' : 'a', 
            minutes,
            timeObj = document.querySelectorAll('.time');
        if (hours>12){
            hours = hours - 12;
            meridiem = 'p';
        }
        minutes = ("0" + now.getMinutes()).slice(-2);
        timeObj[0].innerHTML = (hours+':'+minutes+' <span class="meridiem">'+meridiem+'</span>');
    },
    update_weather: function(){
        var d = document,
			self = this,
            getRequest = siteUrl+"inc/ajax/weather.php",
            xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var weather = JSON.parse(xhr.responseText);
                d.querySelectorAll('.now-icon')[0].innerHTML = (weather.now_icon);
                d.querySelectorAll('.now-temp')[0].innerHTML = (weather.now_temperature+'<sup>&deg;</sup>');
                d.querySelectorAll('.now-low')[0].innerHTML = (weather.now_low+'<sup>&deg;</sup>');
                d.querySelectorAll('.now-high')[0].innerHTML = (weather.now_high+'<sup>&deg;</sup>');

                d.querySelectorAll('.next-hour')[0].innerHTML = (weather.next_hour_icon+weather.next_hour_temperature+'<sup>&deg;</sup>');
                d.querySelectorAll('.tomorrow')[0].innerHTML = (weather.tomorrow_icon+weather.tomorrow_temperature+'<sup>&deg;</sup>');
                d.querySelectorAll('.two-days')[0].innerHTML = (weather.next_icon+weather.next_temperature+'<sup>&deg;</sup>');
                d.querySelectorAll('.updated-datetime')[0].innerHTML = ('Last updated: '+weather.date);

		        self.weather = window.setTimeout(function (){
					delete(d);
					delete(getRequest);
					delete(xhr);
					delete(weather);

					clearTimeout(self.weather);

		        	self.update_weather();
		        }, 15*60*1000); // update every 15 min
            }
        };
        xhr.open("GET",getRequest,true);
        xhr.send();
    },
    instagram_module: function(){
        wallboard.instagram = this.setPhotoInfo('instagram');
        if ( ! wallboard.instagram ) return;
        wallboard.layout();
        window.setInterval(wallboard.layout, 10000);
    },
    photo_slider: function(){
        var el = this.setPhotoInfo('slideshow');
        if ( ! el ) return;
        wallboard.images[0].className = "fx";
        window.setInterval(wallboard.kenburns, 5000);
    },
    setPhotoInfo: function(el){
        var sl = document.getElementById(el);
        if ( sl === null ) return false;
        wallboard.images = sl.getElementsByTagName('img');
        wallboard.numberOfImages = wallboard.images.length;
        wallboard.i = 1;
        return sl;
    },
    layout: function (){
        var insta = wallboard.instagram,
            spans = insta.getElementsByTagName('span'),
            randIdx = Math.floor(Math.random()*10),
            randSpan = spans[ randIdx ], 
            randImg = randSpan.getElementsByTagName('img'), 
            url = manifest.data.splice(
                Math.floor(Math.random()*manifest.data.length), 
                1, randImg.src
            ); 

        // append new img with new src to existing span
        var img = new Image();
        img.src = url;
        img.className = 'trans';
        randSpan.appendChild(img);
        randSpan.className = 'cross';
        setTimeout( function(){
            delete(randImg);
            img.className = '';
            randSpan.className = '';
        }, 500);
        
        // crossfade new image with old image
        
        // remove old image element
        
        // cycle big images 16-19
        var iB = Math.floor(Math.random()*4);
        for(var i=0; i<4; i++){
            wallboard.images[10+i].className = '';
        }
        wallboard.images[10+iB].className = 'active';
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
};
