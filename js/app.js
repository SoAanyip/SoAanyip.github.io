var app = angular.module('wholeApp', ['ngRoute']);

app.config(['$routeProvider',function($routeProvider) {
    $routeProvider.when('/colorful', {
        templateUrl: 'tpls/colorful.html',
        controller:'colorfulCtrl'
    }).when('/navSlider',{
    	templateUrl:'tpls/navSlider.html',
        controller: 'sliderCtrl'
    }).when('/cv',{
        templateUrl:'tpls/resume.html',
        controller:'cvCtrl'
    })
    .when('/',{
        templateUrl:'tpls/home.html',
        controller:'homeCtrl'
    }).otherwise({
        redirectTo: '/'
    })
}]);

app.controller('homeCtrl',['$scope',function($scope){
    document.getElementsByTagName('body')[0].className = 'home';
    document.getElementsByTagName('title')[0].innerHTML='So Aanyip`s GitHub';
    setTimeout(function(){
        var page = document.getElementById('pageInHome');
        var array = [[255,255,0],[0,220,220],[153,51,0]];
        var msec = 3000;
        startLoop(page,array,msec);
    },1);
}])

app.controller('colorfulCtrl',['$scope',function($scope){
    document.getElementsByTagName('body')[0].className = 'colorful';
    document.getElementsByTagName('title')[0].innerHTML='So Aanyip`s GitHub';
    setTimeout(function(){
        var page = document.getElementById('page');
        var array = [[255,255,0],[0,220,220],[153,51,0]];
        var msec = 2000;
        startLoop(page,array,msec);
        startLoop(document.getElementById('isColor'),null,null,'color');
    },1);
}])

app.controller('sliderCtrl',['$scope',function($scope){
    document.getElementsByTagName('body')[0].className = 'ns';
    document.getElementsByTagName('title')[0].innerHTML='So Aanyip`s GitHub';
    $('#horizentalNav').slider('left',0,'fast');
    $('header').css('height',$(window).height()+'px');
    $('article').hide();
    $('#intro').show();
    $('#horizentalNav').on('click','li',function(){
        $('article').hide();
        $('article').eq($(this).parent().data('index')).show();
    })
}])

app.controller('cvCtrl',['$scope',function($scope){
    document.getElementsByTagName('body')[0].className = 'cv';
    document.getElementsByTagName('title')[0].innerHTML='苏晏烨的简历';
    setTimeout(function(){
        startLoop(document.getElementById("bg"),[[102,153,255],[153,51,0],[240,204,10]],30000);
    },1);
}])