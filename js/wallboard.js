/*
wallboard - v - 2015-01-06
An app to make a dashboard for the wallboard.
Lovingly coded by BarrelNY Developers  - http://barrelny.com 
*/
var wallboard = {
    init: function(){
		var self = this;
        self.update_time();
        self.update_weather();
        self.photo_slider();
        self.instagram_module();
        self.time = window.setInterval(wallboard.update_time, 30000); // update every 30 sec
    },
    update_time: function() {
        var now = new Date(),
            hours = now.getHours(),
            meridiem = hours > 12 ? 'p' : 'a', 
            minutes = ("0" + now.getMinutes()).slice(-2),
            timeObj = document.querySelectorAll('.time');
        if ((hours >= 10 && hours <= 18)&&parseInt(minutes)===15) {
            current = (hours - 10)*2;
            if (parseInt(minutes) > 30) current += 1;
            calHead = document.querySelectorAll('.current-mark');
            calHead[0].style.height = (current*40)-1+'px';
            var etime = document.querySelectorAll('.e-time'); 
            for(var i=0;i<etime.length;i++){
                var time = etime[i].innerHTML.split('-').pop().split(':'),
                    hrs = parseInt(time[0]),
                    min = parseInt(time[1]),
                    className = etime[i].parentNode.className,
                    isTop = (className.indexOf('top') > -1),
                    newClass = ( hrs > hours ) ? (
                        className +(isTop ? '' : ' top')
                    ) : className.replace('top', '');
                etime[i].parentNode.className = newClass;
            };
        }
        if (hours>12){
            hours = hours - 12;
            meridiem = 'p';
        }
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
            randIdx = Math.floor(Math.random()*6),
            randSpan = spans[ randIdx ], 
            randImg = randSpan.getElementsByTagName('img')[0], 
            url = manifest.data.splice(
                Math.floor(Math.random()*manifest.data.length), 
                1, randImg.src
            ), 
            url = url[0];

        // append new img with new src to existing span
        var img = new Image();
        img.src = url;
        randSpan.style.backgroundImage = 'url("'+url+'")';
        
        // crossfade new image with old image
        randSpan.className = 'cross';

        setTimeout( function(){
            // remove old image element
            randImg.remove();
            randSpan.appendChild(img);
            randSpan.style.backgroundImage = '';
            randSpan.className = '';
        }, 5000);
        
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
