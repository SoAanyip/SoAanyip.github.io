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
    }).when('/',{
        templateUrl:'tpls/home.html',
        controller:'homeCtrl'
    }).when('/shenmegui',{
        templateUrl:'tpls/shenmegui.html',
        controller:'shenmeguiCtrl'
    }).otherwise({
        redirectTo: '/'
    })
}]);

app.controller('homeCtrl',['$rootScope',function($rootScope){
    document.getElementsByTagName('body')[0].className = 'home';
    document.getElementsByTagName('title')[0].innerHTML='So Aanyip`s GitHub';
    loadColorful($rootScope,'pageInHome');
    if($rootScope.shenmegui) shenmegui.stopJoke();
}])

app.controller('colorfulCtrl',['$rootScope',function($rootScope){
    document.getElementsByTagName('body')[0].className = 'colorful';
    document.getElementsByTagName('title')[0].innerHTML='So Aanyip`s GitHub';
    loadColorful($rootScope,'page');
}])

app.controller('shenmeguiCtrl',['$rootScope',function($rootScope){
    document.getElementsByTagName('body')[0].className = 'shenmegui';
    document.getElementsByTagName('title')[0].innerHTML='So Aanyip`s GitHub';
    if(!$rootScope.shenmegui){
        var SMGScript = document.createElement('script');
        SMGScript.src="js/shenmegui.min.js";
        document.body.appendChild(SMGScript);
        SMGScript.onload = function(){
            shenmegui.startJoke(['qq','weibo'],5000,15000);
            $rootScope.shenmegui = true;
        }
    }else{
        shenmegui.startJoke(['qq','weibo'],5000,15000);
    }
}])

app.controller('sliderCtrl',['$rootScope',function($rootScope){
    document.getElementsByTagName('body')[0].className = 'ns';
    document.getElementsByTagName('title')[0].innerHTML='So Aanyip`s GitHub';
    if(!$rootScope.navSlider){
        var JQScript = document.createElement('script');
        JQScript.src="js/jquery-1.10.2.min.js";
        var sliderScript = document.createElement('script');
        sliderScript.src="js/navSlider.min.js";
        document.body.appendChild(JQScript);
        JQScript.onload = function(){
            document.body.appendChild(sliderScript);
        }
        sliderScript.onload = function(){
            addSlider();
            $rootScope.navSlider = true;
        };
    }else{
        addSlider();
    }
    
}])

app.controller('cvCtrl',['$rootScope',function($rootScope){
    /*document.getElementsByTagName('body')[0].className = 'cv';
    document.getElementsByTagName('title')[0].innerHTML='苏晏烨的简历';
    if(!$rootScope.colorful){
        var colorfulScript = document.createElement('script');
        colorfulScript.src="js/colorful.min.js";
        document.body.appendChild(colorfulScript);
        $rootScope.colorful = true;
        colorfulScript.onload = function(){
            setTimeout(function(){
                startLoop(document.getElementById("bg"),[[102,153,255],[153,51,0],[240,204,10]],30000);
            },100);
        };
    }else{
        setTimeout(function(){
            startLoop(document.getElementById("bg"),[[102,153,255],[153,51,0],[240,204,10]],30000);
        },100);
    }*/
    window.location.href="../cv/cn.html";
}])

function loadColorful($rootScope,id){
    var page = document.getElementById(id);
    var array = [[255,255,0],[0,220,220],[153,51,0]];
    var msec = 3000;
    page.style.backgroundColor='rgb(141,226,85)';
    if(!$rootScope.colorful){
        var colorfulScript = document.createElement('script');
        colorfulScript.src="js/colorful.min.js";
        document.body.appendChild(colorfulScript);
        $rootScope.colorful = true;
        colorfulScript.onload = function(){
            setTimeout(function(){
                startLoop(page,array,msec);
            },100);
        }
    }else{
        setTimeout(function(){
            startLoop(page,array,msec);
        },100);
    }
}

function addSlider(){
    $('#horizentalNav').slider('left',0,'fast');
    $('header').css('height',$(window).height()+'px');
    $('article').hide();
    $('#intro').show();
    $('#horizentalNav').on('click','li',function(){
        $('article').hide();
        $('article').eq($(this).parent().data('index')).show();
    })
}