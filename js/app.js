var app = angular.module('wholeApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider.when('/colorful', {
        templateUrl: 'tpls/colorful.html',
        controller:'colorfulCtrl'
    }).when('/navSlider',{
    	templateUrl:'tpls/navSlider.html',
        controller: 'sliderCtrl'
    }).when('/',{
        templateUrl:'tpls/home.html',
        controller:'homeCtrl'
    }).otherwise({
        redirectTo: '/'
    })
});

app.controller('homeCtrl',['$scope',function($scope){
    setTimeout(function(){
        var page = document.getElementById('pageInHome');
        var array = [[255,255,0],[0,220,220],[153,51,0]];
        var msec = 3000;
        startLoop(page,array,msec);
    },1);
}])

app.controller('colorfulCtrl',['$scope',function($scope){
    setTimeout(function(){
        var page = document.getElementById('page');
        var array = [[255,255,0],[0,220,220],[153,51,0]];
        var msec = 2000;
        startLoop(page,array,msec);
        startLoop(document.getElementById('isColor'),null,null,'color');
    },1);
}])

app.controller('sliderCtrl',['$scope',function($scope){
    $('#horizentalNav').slider('left',0,'fast');
    $('header').css('height',$(window).height()+'px');
    $('article').hide();
    $('#intro').show();
    $('#horizentalNav').on('click','li',function(){
        $('article').hide();
        $('article').eq($(this).parent().data('index')).show();
    })
}])