/*
wallboard - v - 2014-12-12
An app to make a dashboard for the wallboard.
Lovingly coded by BarrelNY Developers  - http://barrelny.com 
*/
var wallboard = {
    init: function(){
        this.update_weather();
        this.photo_slider();
        this.weather = window.setInterval(wallboard.update_weather, 60000); // update every 60 sec
        this.time = window.setInterval(wallboard.update_time, 30000); // update every 30 sec
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
                d.querySelectorAll('.updated-datetime')[0].innerHTML = ('Last updated:'+weather.date);
            }
        };
        xhr.open("GET",getRequest,true);
        xhr.send();
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
};
