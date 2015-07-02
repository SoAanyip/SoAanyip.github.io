window.onload = function(){
    /*初始化SPA*/
    initHash();
    /*配置触摸返回事件*/
    touchBack();
}



/*初始化SPA hash相关*/
function initHash(){
    /*检测页面初始hash*/
    var hashArr = judHash();
    /*组装当前页面*/
    packElms(hashArr);
    /*记录当前hash为上一次hash*/
    getElms().lastHash = hashArr[0];
    /*检查初始hash*/
    if( location.hash !== '' ){
        sectionChange(hashArr[0]);
    }

    /*配置hashchange事件*/
    window.onhashchange = function(){
        hashArr = judHash();
        packElms(hashArr);
        /*动画效果切换页面*/
        sectionAnimate(judHash()[0]);

        getElms().lastHash = hashArr[0];
    };

    
}

/**
 * 判断页面hash，返回数组
 * @return {array} 若为index，返回['index']; 若为tab，返回['tab',tabId];若为task，返回['task',taskId,tabId]
 */
function judHash(){
    if(location.hash === ''){
        return ['index'];
    }
    /*去掉 #/  */
    var hash = location.hash.substring(2);
    if( hash.indexOf('tab') !== -1 && hash.indexOf('/') === -1 ){
        return ['tab',hash.substring(3)];
    }else if( hash.indexOf('task') !== -1 ){
        return ['task',hash.substring(hash.indexOf('task')+4),hash.substring(3,hash.lastIndexOf('/')) ];
    }
}

/*根据当前hash组装页面内容*/
function packElms(hashArr){
    var task = getTask();
    if( hashArr[0] === 'index' ) {
        packIndex(task);
    }else if( hashArr[0] === 'tab' ){
        packTab(hashArr[1],task);
    }else if( hashArr[0] === 'task' ){
        packTask(hashArr[1],hashArr[2],task);
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

/*组装某一个分类下的所有任务*/
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

/*组装具体任务的内容*/
function packTask(taskId,tabId,task){
    var oTaskName = $('#task-name'),
        oTaskTime = $('#task-time'),
        oTaskText = $('#task-text');

    for( var i = 0, tabLen = task.length ; i<tabLen ; i++ ){
         if( task[i].id === parseInt(tabId) ){
            var j = 0,
                children = task[i].children,
                taskLen = children.length;
            for(; j<taskLen ; j++ ){
                if( children[j].id === parseInt(taskId) ){
                    oTaskName.innerHTML = children[j].name;
                    oTaskTime.innerHTML = children[j].time;
                    oTaskText.innerHTML = children[j].text.replace(/\n/,'<br>');
                }
            }
        }
    }
}

/*动画切换页面*/
function sectionAnimate(target){
    /*通过html标签的class来控制*/
    var elms = getElms();
    removeClass( elms.oHtml , '*' );

    /*需要通过lastHash判断是从哪个页面来到当前页的*/
    if(target === 'tab'){
        addClass( elms.oHtml,  target+'-from-' + elms.lastHash );
        setTimeout(function(){
            elms.oHtml.className = target+'-now';
        },400)

        /*当transition结束后切换class*/
    }else{
        addClass( elms.oHtml,  target+'-show' );
        setTimeout(function(){
            elms.oHtml.className = target+'-now';
        },400)
    }
    
}

/*直接切换页面，用于页面首次加载时*/
function sectionChange(target){
    var elms = getElms();

    elms.oHtml.className = target+'-now';
}

/*配置触摸（和滑动）返回上一页的功能*/
function touchBack(){
    /*上一层级留在左边一点点的位置*/
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

        /*保存被点击的对象*/
        aToucToBack[i].addEventListener('touchstart',function(){
            saveTarget = this;
        },false);

        /*无论end的位置在哪里，只要start在左边一点点的那个位置，就触发回到上一页事件*/
        $('#body').addEventListener('touchend',function(){
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

/*获取任务数据*/
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

    if( !localStorage.getItem('task') ){
        localStorage.setItem( 'task' , JSON.stringify(task) );
    }

    return function(){
        return task;
    }
}

var getTask = _getTask();
