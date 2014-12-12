/*
wallboard - v - 2014-12-12
An app to make a dashboard for the wallboard.
Lovingly coded by BarrelNY Developers  - http://barrelny.com 
*/
google.load("feeds", "1");

// wallboard functions
var wallboard = {
    init: function(){
        this.update_weather();
        this.update_ticker(newsfeed);
        this.photo_slider();
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
                    if (entry.title.length < 1) continue;
					if (hours>12){
                        hours = hours - 12;
                        meridiem = 'pm';
                    }
                    var minutes = ("0" + news_date.getMinutes()).slice(-2);
                    $('.news-slider').append('<li>'+entry.title +'<span class="news-time">'+hours+':'+minutes+' '+meridiem+'</span></li>');
                }
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
            url: siteUrl+"inc/ajax/weather.php",
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
};

$(function(){
	wallboard.init();
});
