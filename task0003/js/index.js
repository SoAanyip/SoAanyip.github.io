window.onload = function(){
    /*组装分类列表*/
    createTab(true);
    
    GTDOnclickFunctions();
}


/*组装分类列表*/
function createTab(isFirst){

    var category = getCategory().category,   //用户分类列表
        missions = getMissions().missions,   //用户任务数据
        tabUl = $('#tab-ul'),   //分类列表ul
        tabUlFragment = document.createDocumentFragment(),
        spanDeleteFolder = document.createElement('span'),    //删除图标
        allMissionCount = 0,   //所有任务数
        oAllMission = $('#all-mission');    //显示所有任务的Dom

    spanDeleteFolder.className = 'delete-folder';

    /*进行递归append*/
    for( var i = 0, len = category.length ; i<len ; i++ ){
        var deepth = 1,
            oLi = recurTab( category[i],spanDeleteFolder,deepth,isFirst );  //递归调用返回tab-ul里面所有的li

        /*计算所有任务数*/
        allMissionCount += parseInt(oLi.dataset.missionCount);

        tabUlFragment.appendChild( oLi );
    }
    /*append fragment*/
    tabUl.innerHTML = '';
    tabUl.appendChild(tabUlFragment);

    oAllMission.innerHTML = '所有任务 (' + allMissionCount + ')'

}

/**
 * 递归组装分类列表的li
 * @param  {JSONObject} curCate      当前li层级的JSON对象
 * @param  {HTMLElement} spanDeleteFolder 删除图标的span
 * @param  {int} deepth           当前深度，起始为1
 * @param  {boolean} isFirst           是否第一次创建tabulation
 * @return {HTMLElement}                  组装好的当前层级li标签
 */
function recurTab( curCate,spanDeleteFolder,deepth,isFirst ){

    /*获得每一个task的任务数*/
    var taskLength = getMissionsCount(),
        folderCount = 0;  //每一个文件夹的总任务数

    /*主要的li*/
    var tabLi = document.createElement('li');
    tabLi.className = 'tab-tree-li';
    /*名字标签*/
    var nameDiv = document.createElement('div');
    nameDiv.innerHTML = curCate.name;
    nameDiv.dataset.folderId = curCate.folderId;
    nameDiv.appendChild(spanDeleteFolder.cloneNode());
    if(curCate.name === '默认分类'){
        nameDiv.id = 'protected';
        if(isFirst) addClass(nameDiv,'font-active');
        
    }

    tabLi.appendChild(nameDiv);

    /*如果有子元素（子task或者文件夹）*/
    if( curCate.children ){

        /*包裹子级的ul*/
        var childrenUl = document.createElement('ul');

        for( var i = 0 ; i<curCate.children.length ; i++ ){
            /*遍历子li*/
            var childrenLi = undefined;

            /*如果是文件夹*/
            if( curCate.children[i].children ){
                /*递归调用*/
                childrenLi = arguments.callee( curCate.children[i],spanDeleteFolder,deepth+1 );
                folderCount += parseInt(childrenLi.dataset.missionCount);
            }else{
                /*如果是task*/
                childrenLi = document.createElement('li');
                childrenLi.innerHTML = curCate.children[i].name;

                /*填写task中的任务数量*/
                for(var j = 0, countLen = taskLength.length ; j<countLen ; j++ ){
                    if( curCate.children[i].taskId === taskLength[j].taskId ){
                        folderCount += parseInt( taskLength[j].count );
                        childrenLi.innerHTML += ' (' + taskLength[j].count + ')';
                        break;
                    }
                }
                /*如果task中没有任务*/
                if( j === countLen ){
                    childrenLi.innerHTML += ' (' + 0 + ')';
                }

                childrenLi.dataset.taskId = curCate.children[i].taskId;
            }

            childrenUl.appendChild(childrenLi);
        }

        tabLi.appendChild(childrenUl);
        tabLi.dataset.missionCount = folderCount;
    }

    nameDiv.innerHTML += ' (' + folderCount + ')'

    return tabLi;
}




/*使用sort根据时间排序任务时传入的函数*/
function compareDeadline(mis1,mis2){
    if(mis1.time === 'now') return -1;
    if(mis2.time === 'now') return 1;
    return new Date(mis2.time).getTime() - new Date(mis1.time).getTime() ;
}

/**
 * 根据parentId以及任务id唯一对应一个任务.parentId方便查找
 * @param  {int}  parentId 从属的taskId
 * @param  {int}  id       missionId
 * @param  {Boolean} isNo     是否返回这个mission的位置[i,j];
 * @return {JSONObject || array}           返回mission或者它的位置
 */
function getMissionByparentId(parentId,id,isNo){
    var missions = getMissions().missions;

    for( var i = 0, len = missions.length ; i<len ; i++){
        /*查找到parentId*/
        if( missions[i].parentId === parseInt(parentId) ){
            var children = missions[i].children;

            for( var j = 0, childrenLen = children.length ; j<childrenLen ; j++ ){
                /*查找到missionId*/
                if( children[j].id === parseInt(id) ){
                    if(isNo) return [i,j];
                    return children[j];
                }
            }
            break;
        }
    }
    return null;
}


/**
 * 添加文件夹到model
 * @param {int} folderId      从属文件夹的id
 * @param {string} newFolderName 文件夹名字
 */
function addFolderToStorage(folderId,newFolderName){
    /*获得从属文件夹*/
    var categoryToAdd = getFolderById(folderId);

    categoryToAdd.push({
        "name" : newFolderName,
        "folderId" : getCategory().folderIdCount++,
        "children" : []
    })
    /*更新本地存储*/
    updateStorage('category');
}

function deleteFolderToStorage(folderId){
    /*当前层级*/
    var category = getCategory().category;
    newCategory = cloneCategory( category , folderId );

    getCategory().category = newCategory;
    updateStorage('category');
    updateTabulation();
    
    
}


function cloneCategory(src,folderId) {
    if(src === null) return 'Null';
    if(src === undefined) return 'Undefined';
    var key,result,srcClass = getType(src);
    if(srcClass === 'Object'){
        result = {};
    }else if(srcClass === 'Array'){
        result = [];
    }else if(srcClass === 'Number' || srcClass === 'String' || srcClass === 'Boolean'
       || srcClass === 'Date'){
        return src;
    }
    for(key in src){

        var attr = src[key];
        if(getType(attr) === 'Object' || getType(attr) === 'Array' ){
            if(srcClass === 'Array'){
                var children = arguments.callee(attr,folderId);
                if(children) result.push( children );
            }else{
                result[key] = arguments.callee(attr,folderId);
            }
        }else if( key === 'folderId' && attr === folderId ){
            src = null;
            return;
        }
        else{
            result[key] = src[key];
        }
    }
    return result;  
}

/**
 * 通过folderId获得文件夹（其children数组）
 * @param  {int} folderId      从属文件夹的id
 * @param  {array} categoryArr 当前层级数组
 * @return {array}             文件夹（其children数组）
 */
function getFolderById(folderId,categoryArr){
    /*当前层级*/
    var category = categoryArr || getCategory().category;

    if(folderId === -1){
        return category;
    }else{
        /*遍历当前层级*/
        for( var i = 0, len = category.length ; i<len ; i++ ){
            /*对应则返回*/
            if( category[i].folderId === folderId ) return category[i].children;
            /*还有子级则递归*/
            if( category[i].children ) {
                var categoryChildren = arguments.callee(folderId,category[i].children);
                if( categoryChildren ) return categoryChildren;
            }
        }
        return null;
    }

}

/*获得现在正在编辑的mission*/
function getEditingMission(){
    var oContMissionBody = getMissionContElements().oContMissionBody,
        parentId = oContMissionBody.dataset.parentId,
        missionId = oContMissionBody.dataset.missionId;


    return getMissionByparentId(parentId,missionId);
}

/*获得正在显示中的任务*/
function getActiveMission(){
    var oActiveDd = $('#mission-timeline .font-active');

    return getMissionByparentId( oActiveDd.dataset.parentId , oActiveDd.dataset.missionId );
}


/*保存新任务*/
function createNewMission(taskId){
    var missions = getMissions().missions;

    for( var i = 0, len = missions.length ; i<len ; i++ ){
        if(missions[i].parentId === taskId){
            missions[i].children.push({
                "name" : "新任务",
                "time" : "now",
                "type" : "unfinish",
                "text" : "新任务内容",
                "id" : getMissions().missionId++
            })
            
            return;
        }
    }
    missions.push({
        "parentId" : taskId,
        "children" : [
            {
                "name" : "新任务",
                "time" : "now",
                "type" : "unfinish",
                "text" : "新任务内容",
                "id" : getMissions().missionId++
            }
        ]
    })
}

/*保存任务主体的各个被频繁操作的Dom元素*/
function _getMissionContElements(){
    var oContMissionBody = $('#cont-mission-body'),    //右侧窗口任务内容部分
        oContTitleBar = $('#cont-title-bar'),    //标题栏
        oMissionTitle = oContTitleBar.getElementsByTagName('h2')[0],    //标题
        oMissionTime = $('#cont-mission-time span'),    //任务完成时间
        aTitleBarBtns = oContTitleBar.getElementsByTagName('a'),  //标题栏的所有按钮
        aTitleBarIcons = [],    //未进入编辑状态时显示的按钮
        aTitleBarWords = [];    //进入了编辑状态后显示的按钮

    for(var i = 0 ; i<aTitleBarBtns.length ; i++){
        if( aTitleBarBtns[i].className.indexOf('icon-btn') !== -1 ) aTitleBarIcons.push(aTitleBarBtns[i]);
        if( aTitleBarBtns[i].className.indexOf('word-btn') !== -1 ) aTitleBarWords.push(aTitleBarBtns[i]);
    }
    oContTitleBar = null;
    aTitleBarBtns = null;

    var contElements = {
        oContMissionBody : oContMissionBody,
        oMissionTitle : oMissionTitle,
        oMissionTime : oMissionTime,
        aTitleBarIcons : aTitleBarIcons,
        aTitleBarWords : aTitleBarWords
    }

    return function(){
        return contElements;
    }
}
var getMissionContElements = _getMissionContElements();

/*获得mission总数*/
function getMissionsCount(){
    var missions = getMissions().missions;

    var count = [];

    /*返回一个数组，数组中每一项为以对应taskId整合的对象*/
    for( var i = 0, len = missions.length ; i<len ; i++ ){
        var missionCount = {
            taskId : missions[i].parentId,
            count : missions[i].children.length
        }
        count.push(missionCount);
    }

    return count;
}

/**
 * 切换任务框标题栏中按钮的显示
 * @param  {string} type 要切换到的类型，'edit'切换到编辑状态的按钮，'see'切换到浏览状态的按钮
 */
function switchMissonContBtns(type){
    /*获取dom元素集合*/
    var contElements = getMissionContElements();

    if(type === 'edit' ){
        /*使按钮变成保存和取消*/
        for(var i = 0 ; i<contElements.aTitleBarIcons.length ; i++){
            contElements.aTitleBarIcons[i].style.display = 'none';
        }
        for(var i = 0 ; i<contElements.aTitleBarWords.length ; i++){
            contElements.aTitleBarWords[i].style.display = 'block';
        }
    }else if(type === 'see'){
        /*使按钮变成保存和取消*/
        for(var i = 0 ; i<contElements.aTitleBarIcons.length ; i++){
            contElements.aTitleBarIcons[i].style.display = 'block';
        }
        for(var i = 0 ; i<contElements.aTitleBarWords.length ; i++){
            contElements.aTitleBarWords[i].style.display = 'none';
        }
    }
}

/*更新task视图*/
function updateTabulation(){
    /*暂时使用粗暴更新*/
    createTab(false);
}

/*更新时间线视图*/
function updateTimeline(type,isNewMission){
    var oMissionType = $('#mission-type'),
        aTypes = oMissionType.getElementsByTagName('a'),
        currentSelected = undefined;
        oTimelineOl = $('#mission-timeline ol'),   //获得时间线栏的ol
        targetSelect = undefined;
    oMissionType = null;


    for( var i = 0 ; i<aTypes.length ; i++ ){
        if( hasClass(aTypes[i],'type-active') ){
            currentSelected = aTypes[i];
        }
        if( aTypes[i].dataset.type === type ){
            targetSelect = aTypes[i];
        }
    }

    removeClass(currentSelected,'type-active');
    addClass(targetSelect,'type-active');

    /*点前选择的task*/
    var currentTask = $('#tab-ul .font-active');
    if( !currentTask || currentTask.tagName.toUpperCase() !== 'LI' ) return;

    /*清空时间线*/
    oTimelineOl.innerHTML = '';

    /*通过packTimeline方法返回的fragment对象组装时间线*/
    oTimelineOl.appendChild( packTimeline( parseInt($('#tabulation .font-active').dataset.taskId) , type ) )

    if(isNewMission){
        oTimelineOl.getElementsByTagName('dd')[0].click();
    }

   
}

/**
 * 组装时间线
 * @param  {int} taskId 现在对应的task的id
 * @param  {string} type   现在选择的任务类型（已完成，未完成）
 * @return {documentFragment}        要添加到时间线的fragment
 */
function packTimeline(taskId,type){
    var missions = getMissions().missions,
        liFragment = document.createDocumentFragment();

    /*通过点击项的id来寻找所有任务中属于这个task的任务*/
    for( var i = 0, len = missions.length ; i<len; i++ ){
        /*判断id*/
        if( missions[i].parentId === taskId ){

            var children = missions[i].children;

            /*根据时间排序*/
            children.sort(compareDeadline);
            
            /*循环组装时间线li*/
            for( var j = 0, childrenLen = children.length ; j<childrenLen ; j++ ){
                if( children[j].type !== type && type !== 'all' ) continue;
                var oLi = document.createElement('li'),
                    oDl = document.createElement('dl'),
                    oDt = document.createElement('dt'),
                    oDd = document.createElement('dd');

                /*每一个时间下的任务*/
                oDt.innerHTML = children[j].time;
                oDd.innerHTML = children[j].name;
                oDd.dataset.parentId = missions[i].parentId;
                oDd.dataset.missionId = children[j].id;

                oDl.appendChild(oDt);
                oDl.appendChild(oDd);

                /*如果有相同截止时间的任务，放在同一个dl之下*/
                while( j !== childrenLen-1 && ( children[j].time === children[j+1].time ) ){
                    j++;
                    var oExtraDd = document.createElement('dd');
                    oExtraDd.innerHTML = children[j].name;
                    oExtraDd.dataset.parentId = missions[i].parentId;
                    oExtraDd.dataset.missionId = children[j].id;

                    oDl.appendChild(oExtraDd);
                }

                oLi.appendChild(oDl);
                liFragment.appendChild(oLi);
            }

            break;
        }
    }

    /*如果并没有这个task对应的任务*/
    if( i == len ){  
        var msgDiv = document.createElement('div');
        msgDiv.innerHTML = '还没有任务哦<br/>点击下方添加任务';   
        liFragment.appendChild(msgDiv);
    }
    /*如果这个task对应分类并没有任务*/
    else if( !liFragment.childElementCount ){
        var msgDiv = document.createElement('div');
        msgDiv.innerHTML = '这个任务类型下还没有任务';   
        liFragment.appendChild(msgDiv);
    }

    return liFragment;
}

/*更新本地存储*/
function updateStorage(name){
    if( name === 'category'){
        localStorage.setItem( 'category' , JSON.stringify( getCategory() ) );
    }else if( name === 'missions' ){
        localStorage.setItem( 'missions' , JSON.stringify( getMissions() ) );
    }else if( name === 'all' ){
        localStorage.setItem( 'category' , JSON.stringify( getCategory() ) );
        localStorage.setItem( 'missions' , JSON.stringify( getMissions() ) );
    }
}

/*得到用户分类*/
function _getCategory(){
    /*localStorage*/
    var tempCategory = JSON.parse( localStorage.getItem('category') ) || {
        "category" : [
            {
                "name" : "百度IFE项目",
                "folderId" : 1,
                "children" : [
                    {
                        "name" : "task1",
                        "taskId" : 1,
                    },
                    {
                        "name" : "task2",
                        "taskId" : 2,
                    },
                    {
                        "name" : "部分",
                        "folderId" : 2,
                        "children" : [
                            {
                                "name" : 'h1',
                                "taskId" : 3
                            }
                        ]
                    }
                ]
            },
            {
                "name" : "毕业论文" ,
                "folderId" : 4,
                "children" : []
            },
            {
                "name" : "社团" ,
                "folderId" : 5,
                "children" : []
            },
            {
                "name" : "默认分类" ,
                "folderId" : 0,
                "children" : [
                    {
                        "name" : '默认task',
                        "taskId" : 0
                    }
                ]

            }
        ],
        "taskIdCount" : 6,
        "folderIdCount" : 5
    }

    if( !localStorage.getItem('category') ){
        localStorage.setItem( 'category' , JSON.stringify(tempCategory) );
    }

    return function(){
        return tempCategory;
    };
}

var getCategory = _getCategory();

/*得到用户的具体任务*/
function _getMissions() {
    /*localStorage*/
    var tempMissions = JSON.parse( localStorage.getItem('missions') ) || {
        "missions" : [
            {
                "parentId" : 0,
                "children" : [
                    {
                        "name" : "默认任务",
                        "time" : "2015-06-01",
                        "type" : "unfinish",
                        "id" : 0,
                        "text" : '默认任务内容，什么都没有\n啊'
                    }
                ]
            },
            {
                "parentId" : 1,
                "children" : [
                    {
                        "name" : "to-do-1",
                        "time" : "2015-05-04",
                        "type" : "unfinish",
                        "id" : 1,
                        "text" : "adasdadadasds\nasfsdgsgrgrgrgrg\nasfsdgsgrgrgrgrg\nasfsdgsgrgrgrgrg\nasfsdgsgrgrgrgrg\nasfsdgsgrgrgrgrg\nasfsdgsgrgrgrgrg\nasfsdgsgrgrgrgrg\nasfsdgsgrgrgrgrg"
                    },
                    {
                        "name" : "to-do-2",
                        "time" : "2015-04-01",
                        "type" : "finish",
                        "text" : "rg",
                        "id" : 2
                    },
                    {
                        "name" : "to-do-3",
                        "time" : "2015-05-01",
                        "type" : "finish",
                        "text" : "rg1",
                        "id" : 3
                    },
                    {
                        "name" : "to-do-4",
                        "time" : "2015-04-30",
                        "type" : "unfinish",
                        "text" : "r",
                        "id" : 4
                    },
                    {
                        "name" : "to-do-6",
                        "time" : "2015-04-30",
                        "type" : "unfinish",
                        "text" : "r",
                        "id" : 5
                    },
                    {
                        "name" : "to-do-9",
                        "time" : "2015-04-30",
                        "type" : "unfinish",
                        "text" : "r",
                        "id" : 12
                    },

                ]
            },
            {
                "parentId" : 2,
                "children" : [
                    {
                        "name" : "to-do-2",
                        "time" : "2015-05-01",
                        "type" : "finish",
                        "text" : "rg",
                        "id" : 23
                    },
                    {
                        "name" : "to-do-3",
                        "time" : "2015-05-01",
                        "type" : "finish",
                        "text" : "rg1",
                        "id" : 34
                    },
                    {
                        "name" : "to-do-4",
                        "time" : "2015-04-30",
                        "type" : "unfinish",
                        "text" : "r",
                        "id" : 56
                    },
                ]
            }
        ],
        "missionId" : 56
    }

    if( !localStorage.getItem('missions') ){
        localStorage.setItem( 'missions' , JSON.stringify(tempMissions) );
    }

    return function(){
        return tempMissions;
    };
};

var getMissions = _getMissions();