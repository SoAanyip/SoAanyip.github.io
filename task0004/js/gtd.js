window.onload = function(){

    initHash();
    touchBack();
}



/*初始化hash相关*/
function initHash(){
    var hashArr = judHash();
    packElms(hashArr);
    getElms().lastHash = hashArr[0];
    /*检查初始hash*/
    if( location.hash !== '' ){
        sectionChange(hashArr[0]);
    }

    window.onhashchange = function(){
        hashArr = judHash();
        packElms(hashArr);
        sectionAnimate(judHash()[0]);

        getElms().lastHash = hashArr[0];
    };

    
}

/*判断页面hash，返回数组[字符窜,id]*/
function judHash(){
    if(location.hash === ''){
        return ['index'];
    }
    var hash = location.hash.substring(2);
    if( hash.indexOf('tab') !== -1 && hash.indexOf('/') === -1 ){
        return ['tab',hash.substring(3)];
    }else if( hash.indexOf('task') !== -1 ){
        return ['task',hash.substring(hash.indexOf('task')+4)];
    }
}

function packElms(hashArr){
    var task = getTask();
    if( hashArr[0] === 'index' ) {
        packIndex(task);
    }else if( hashArr[0] === 'tab' ){
        packTab(hashArr[1],task);
    }else if( hashArr[0] === 'task' ){

    }
}

/*组装首页*/
function packIndex(task){
    var oUl = getElms().oIndex.getElementsByTagName('ul')[0],
        fragment = document.createDocumentFragment();

    for( var i = 0, len = task.length ; i<len ; i++ ){
        var li = document.createElement('li'),
            a = document.createElement('a');
        li.className = "item one-tab";
        a.href = '#/tab' + task[i].id;
        a.innerHTML = task[i].name;
        li.appendChild(a);
        fragment.appendChild(li);
    }
    oUl.innerHTML = '';
    oUl.appendChild(fragment);
}

function packTab(tabId,task){
    var oUl = getElms().oTab.getElementsByTagName('ul')[0],
        fragment = document.createDocumentFragment();

    for( var i = 0, tabLen = task.length ; i<tabLen ; i++ ){
        if( task[i].id === parseInt(tabId) ){
            var j = 0,
                children = task[i].children,
                taskLen = children.length;
            for(; j<taskLen ; j++ ){
                var li = document.createElement('li'),
                    a = document.createElement('a');
                li.className = "item one-task";
                a.href = '#/tab' + tabId + '/task' + children[j].id;
                a.innerHTML = children[j].name;
                li.appendChild(a);
                fragment.appendChild(li);
            }
            break;
        }
    }
    oUl.innerHTML = '';
    oUl.appendChild(fragment);
}

function packTask(){

}

/*动画切换页面*/
function sectionAnimate(target){
    var elms = getElms();
    removeClass( elms.oHtml , '*' );

    if(target === 'tab'){
        addClass( elms.oHtml,  target+'-from-' + elms.lastHash );
        setTimeout(function(){
            elms.oHtml.className = target+'-now';
        },400)
    }else{
        addClass( elms.oHtml,  target+'-show' );
        setTimeout(function(){
            removeClass( elms.oHtml , target+'-show' );
            addClass( elms.oHtml , target+'-now' );
        },400)
    }
    
}

/*直接切换页面*/
function sectionChange(target){
    var elms = getElms();

    removeClass( elms.oHtml , '*' );
    addClass( elms.oHtml,  target+'-now' );
}


function touchBack(){
    var aToucToBack = document.querySelectorAll('.touch-to-back'),
        saveTarget = undefined;

    for( var i = 0 , len = aToucToBack.length ; i<len ; i++ ){
        /*aToucToBack[i].addEventListener('click',function(){
            var parent = this.parentNode;
            if(parent.id === 'index') location.hash = '';
            else if(parent.id === 'tab'){
                location.hash = location.hash.substring( 0, location.hash.lastIndexOf('/') );
            }
        },false);*/


        aToucToBack[i].addEventListener('touchstart',function(){
            saveTarget = this;
        },false);

        aToucToBack[i].addEventListener('touchend',function(){
            if(saveTarget){
                var parent = saveTarget.parentNode;
                if(parent.id === 'index') location.hash = '';
                else if(parent.id === 'tab'){
                    location.hash = location.hash.substring( 0, location.hash.lastIndexOf('/') );
                }

                saveTarget = undefined;
            }
        })
    }

    aToucToBack = null;
}

/*保存常用Dom元素*/
function _getElms(){
    var oHtml = $('html'),
        oIndex = $('#index'),
        oTab = $('#tab'),
        oTask = $('#task'),
        elms = {
            oHtml : oHtml,
            oIndex : oIndex,
            oTab : oTab,
            oTask : oTask,
            lastHash : undefined
        };

    return function(){
        return elms;
    }
}

var getElms = _getElms();

function _getTask(){
    var task = JSON.parse( localStorage.getItem('task') ) || [
        {
            "name" : "任务分类1",
            "id" : 1,
            "children" : [
                {
                    "name" : "任务1",
                    "id" : 1,
                    "time" : "2015-05-10",
                    "text" : "asdadasdas\nasdas"
                },
                {
                    "name" : "任务2",
                    "id" : 2,
                    "time" : "2015-05-20",
                    "text" : "asdadasda"
                }
            ]
        },
        {
            "name" : "任务分类2",
            "id" : 2,
            "children" : [
                {
                    "name" : "任务1",
                    "id" : 1,
                    "time" : "2015-05-10",
                    "text" : "asdadasdas\nasdas"
                },
                {
                    "name" : "任务2",
                    "id" : 2,
                    "time" : "2015-05-20",
                    "text" : "asdadasda"
                }
            ]
        },
        {
            "name" : "任务分类3a",
            "id" : 3,
            "children" : [
                {
                    "name" : "任务1",
                    "id" : 1,
                    "time" : "2015-05-10",
                    "text" : "asdadasdas\nasdas"   
                },
                {
                    "name" : "任务2",
                    "id" : 2,
                    "time" : "2015-05-20",
                    "text" : "asdadasda"
                }
            ]
        },
    ]

    return function(){
        return task;
    }
}

var getTask = _getTask();
