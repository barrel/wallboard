/*
wallboard - v - 2014-12-12
An app to make a dashboard for the wallboard.
Lovingly coded by BarrelNY Developers  - http://barrelny.com 
*/
/**
* author Remy Sharp
* url http://remysharp.com/tag/marquee
*/
 
(function ($) {
    $.fn.marquee = function (klass) {
        var newMarquee = [],
            last = this.length;
 
        // works out the left or right hand reset position, based on scroll
        // behavior, current direction and new direction
        function getReset(newDir, marqueeRedux, marqueeState) {
            var behavior = marqueeState.behavior, width = marqueeState.width, dir = marqueeState.dir;
            var r = 0;
            if (behavior == 'alternate') {
                r = newDir == 1 ? marqueeRedux[marqueeState.widthAxis] - (width*2) : width;
            } else if (behavior == 'slide') {
                if (newDir == -1) {
                    r = dir == -1 ? marqueeRedux[marqueeState.widthAxis] : width;
                } else {
                    r = dir == -1 ? marqueeRedux[marqueeState.widthAxis] - (width*2) : 0;
                }
            } else {
                r = newDir == -1 ? marqueeRedux[marqueeState.widthAxis] : 0;
            }
            return r;
        }
 
        // single "thread" animation
        function animateMarquee() {
            var i = newMarquee.length,
                marqueeRedux = null,
                $marqueeRedux = null,
                marqueeState = {},
                newMarqueeList = [],
                hitedge = false;
                
            while (i--) {
                marqueeRedux = newMarquee[i];
                $marqueeRedux = $(marqueeRedux);
                marqueeState = $marqueeRedux.data('marqueeState');
                
                if ($marqueeRedux.data('paused') !== true) {
                    // TODO read scrollamount, dir, behavior, loops and last from data
                    marqueeRedux[marqueeState.axis] += (marqueeState.scrollamount * marqueeState.dir);
 
                    // only true if it's hit the end
                    hitedge = marqueeState.dir == -1 ? marqueeRedux[marqueeState.axis] <= getReset(marqueeState.dir * -1, marqueeRedux, marqueeState) : marqueeRedux[marqueeState.axis] >= getReset(marqueeState.dir * -1, marqueeRedux, marqueeState);
                    
                    if ((marqueeState.behavior == 'scroll' && marqueeState.last == marqueeRedux[marqueeState.axis]) || (marqueeState.behavior == 'alternate' && hitedge && marqueeState.last != -1) || (marqueeState.behavior == 'slide' && hitedge && marqueeState.last != -1)) {                        
                        if (marqueeState.behavior == 'alternate') {
                            marqueeState.dir *= -1; // flip
                        }
                        marqueeState.last = -1;
 
                        $marqueeRedux.trigger('stop');
 
                        marqueeState.loops--;
                        if (marqueeState.loops === 0) {
                            if (marqueeState.behavior != 'slide') {
                                marqueeRedux[marqueeState.axis] = getReset(marqueeState.dir, marqueeRedux, marqueeState);
                            } else {
                                // corrects the position
                                marqueeRedux[marqueeState.axis] = getReset(marqueeState.dir * -1, marqueeRedux, marqueeState);
                            }
 
                            $marqueeRedux.trigger('end');
                        } else {
                            // keep this marquee going
                            newMarqueeList.push(marqueeRedux);
                            $marqueeRedux.trigger('start');
                            marqueeRedux[marqueeState.axis] = getReset(marqueeState.dir, marqueeRedux, marqueeState);
                        }
                    } else {
                        newMarqueeList.push(marqueeRedux);
                    }
                    marqueeState.last = marqueeRedux[marqueeState.axis];
 
                    // store updated state only if we ran an animation
                    $marqueeRedux.data('marqueeState', marqueeState);
                } else {
                    // even though it's paused, keep it in the list
                    newMarqueeList.push(marqueeRedux);                    
                }
            }
 
            newMarquee = newMarqueeList;
            
            if (newMarquee.length) {
                setTimeout(animateMarquee, 25);
            }            
        }
        
        // TODO consider whether using .html() in the wrapping process could lead to loosing predefined events...
        this.each(function (i) {
            var $marquee = $(this),
				tagName = $marquee[0].tagName,
				newTagName = tagName === "marquee" ? "div" : tagName,
                width = $marquee.attr('width') || $marquee.width(),
                height = $marquee.attr('height') || $marquee.height(),
                $marqueeRedux = $marquee.after('<' + newTagName + ' '+ (klass ? 'class="' + klass + '" ' : '') + 
					'style="display: block-inline; width: ' + width + 'px; height: ' + height + 
					'px; overflow: hidden;"><div style="float: left; white-space: nowrap;">' + 
					$marquee.html() + '</'+newTagName+'></div>').next(),
                marqueeRedux = $marqueeRedux.get(0),
                hitedge = 0,
                direction = ($marquee.attr('direction') || 'left').toLowerCase(),
                marqueeState = {
                    dir : /down|right/.test(direction) ? -1 : 1,
                    axis : /left|right/.test(direction) ? 'scrollLeft' : 'scrollTop',
                    widthAxis : /left|right/.test(direction) ? 'scrollWidth' : 'scrollHeight',
                    last : -1,
                    loops : $marquee.attr('loop') || -1,
                    scrollamount : $marquee.attr('scrollamount') || this.scrollAmount || 2,
                    behavior : ($marquee.attr('behavior') || 'scroll').toLowerCase(),
                    width : /left|right/.test(direction) ? width : height
                };
            
            // corrects a bug in Firefox - the default loops for slide is -1
            if ($marquee.attr('loop') == -1 && marqueeState.behavior == 'slide') {
                marqueeState.loops = 1;
            }
 
            $marquee.remove();
            
            // add padding
            if (/left|right/.test(direction)) {
                $marqueeRedux.find('> div').css('padding', '0 ' + width + 'px');
            } else {
                $marqueeRedux.find('> div').css('padding', height + 'px 0');
            }
            
            // events
            $marqueeRedux.bind('stop', function () {
                $marqueeRedux.data('paused', true);
            }).bind('pause', function () {
                $marqueeRedux.data('paused', true);
            }).bind('start', function () {
                $marqueeRedux.data('paused', false);
            }).bind('unpause', function () {
                $marqueeRedux.data('paused', false);
            }).data('marqueeState', marqueeState); // finally: store the state
            
            // todo - rerender event allowing us to do an ajax hit and redraw the marquee
 
            newMarquee.push(marqueeRedux);
 
            marqueeRedux[marqueeState.axis] = getReset(marqueeState.dir, marqueeRedux, marqueeState);
            $marqueeRedux.trigger('start');
            
            // on the very last marquee, trigger the animation
            if (i+1 == last) {
                animateMarquee();
            }
        });            
 
        return $(newMarquee);
    };
}(jQuery));google.load("feeds", "1");

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
                    $('.news-slider').append('<li><p>'+entry.title +'<span class="news-time">'+hours+':'+minutes+' '+meridiem+'</span></p></li>');
                }
                $('.news-slider').marquee({
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
