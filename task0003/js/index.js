window.onload = function(){
    /*组装分类列表*/
    createTab(true);
    /*绑定点击类事件*/
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




/*配置点击事件*/
function GTDOnclickFunctions(){
    try{
        switchMissionType();    //选择所有任务或者完成的任务或者未完成的任务
        selectMission();    //选择了具体的任务
        selectTask();    //选择了某个task或者文件夹    
        editMission();    //点击了编辑任务
        addTab();    //点击了新增分类
        addMission();    //点击了新增任务
        saveEdit();    //点击了保存修改
        cancelEdit();    //点击了取消保存
        finishMission();    //点击了完成任务
        deleteFolder();    //点击了文件夹右边的小叉叉
    }catch(e){
        console.log(e);
    }
}

/*点击未完成，已完成等按钮*/
function switchMissionType(){
    
    var oMissionType = $('#mission-type'),
        aTypes = oMissionType.getElementsByTagName('a'),
        currentSelected = aTypes[0],
        oTimelineOl = $('#mission-timeline ol'),   //获得时间线栏的ol
    oMissionType = null;

    $.delegate('#mission-type', 'a', 'click', function(ev){
        /*变更显示状态*/
        if( !hasClass(this,'type-active') ) currentSelected = $('#mission-type .type-active');
        removeClass(currentSelected,'type-active');
        addClass(this,'type-active');
        currentSelected = this;

        /*点前选择的task*/
        var currentTask = $('#tab-ul .font-active');
        if( !currentTask || currentTask.tagName.toUpperCase() !== 'LI' ) return;

        /*清空时间线*/
        oTimelineOl.innerHTML = '';

        /*通过packTimeline方法返回的fragment对象组装时间线*/
        oTimelineOl.appendChild( packTimeline( parseInt($('#tabulation .font-active').dataset.taskId) , this.dataset.type ) )

        var aDd = oTimelineOl.getElementsByTagName('dd');
        for( var i = 0, len = aDd.length; i<len ; i++ ){
            if( aDd[i].dataset.missionId === getMissionContElements().oContMissionBody.dataset.missionId ){
                addClass(aDd[i],'font-active');
            }
        }
    })
}

/*点击了具体分类或者task(menu栏)*/
function selectTask(){

    var oTabUl = $('#tab-ul'), //主体ul
        missions = getMissions().missions,  //得到missions
        oTimelineOl = $('#mission-timeline ol'),   //获得时间线栏的ol
        currentSelected = $('#protected'),        //当前选择项
        selectedId = undefined;             //当前选择项的id

    $.delegate('#tab-ul','li','click',function(ev){
        /*是不包括子类的li以及不是已经处于active的*/
        if( !hasClass(this,'tab-tree-li') &&  !hasClass(this,'font-active') ) {
            
            /*如果已有选中的，取消它的active*/
            if( currentSelected ) removeClass(currentSelected,'font-active');

            /*处理点击项*/
            addClass(this,'font-active');
            currentSelected = this;
            /*清空时间线*/
            oTimelineOl.innerHTML = '';
            /*通过packTimeline方法返回的fragment对象组装时间线*/
            oTimelineOl.appendChild( packTimeline( parseInt(this.dataset.taskId) , $('#mission-type .type-active').dataset.type ) )

        }
    })

    /*点击了文件夹的情况*/
    $.delegate('#tabulation','div','click',function(ev){
        if( !hasClass(this,'font-active') && this.id !== 'tabulation' && this.id !== 'tab-title' ){
            if( currentSelected ) removeClass(currentSelected,'font-active');
            addClass(this,'font-active');
            currentSelected = this;
            oTimelineOl.innerHTML = '请点击具体任务';

        }
    })
}


/*点击了具体任务(时间线)*/
function selectMission(){
    
    var ocurrentSelected = undefined;                    //当前选中项

    /*点击了时间线的具体任务*/
    $.delegate('#mission-timeline ol','dd','click',function(ev){

        /*是保存了对象之后直接进行操作还是不保存通过for循环取得比较好？*/
        /*for(var i = 0 ; i<aMissionDd.length ; i++){
            if(aMissionDd[i] !== this) removeClass(aMissionDd[i],'font-active');
        }*/
        if( !hasClass(this,'font-active') ){

            /*获取dom元素集合*/
            var contElements = getMissionContElements();
            if( hasClass(contElements.oContMissionBody,'mission-editing') ){
                if( !confirm("正在编辑中，要放弃保存吗") ){
                    return;
                }else{
                    switchMissonContBtns('see');
                    removeClass(contElements.oContMissionBody,'mission-editing');
                }
            }

            if( ocurrentSelected ) removeClass(ocurrentSelected,'font-active');

            ocurrentSelected = this;
            addClass(this,'font-active');

            /*通过选中项上的parentId和任务名字来查找任务json对象*/
            var mission = getMissionByparentId(this.dataset.parentId,this.dataset.missionId);
            
            /*在右侧主体区域填充信息*/
            contElements.oMissionTitle.innerHTML = this.innerHTML;
            contElements.oMissionTime.innerHTML = mission.time;
            contElements.oContMissionBody.innerHTML = mission.text.replace(/\n/g,'<br/>');
            contElements.oContMissionBody.dataset.parentId = this.dataset.parentId;
            contElements.oContMissionBody.dataset.missionId = this.dataset.missionId;

            if( !contElements.aTitleBarIcons[0].style.display || contElements.aTitleBarIcons[0].display === 'none' ){
                for( var i = 0 ; i<contElements.aTitleBarIcons.length ; i++ ){
                    contElements.aTitleBarIcons[i].style.display = 'block';
                }
            }
            
        }

    })
}

/*点击了编辑任务按钮*/
function editMission(){

    $.on('#edit-mission','click',function(){
        /*获取dom元素集合*/
        var contElements = getMissionContElements();
        /*使任务内容变成可编辑*/
        var oEditArea = document.createElement('textarea');
        oEditArea.id = 'cont-mission-edit';
        /*把br标签换成换行符*/
        oEditArea.innerHTML = contElements.oContMissionBody.innerHTML.replace(/\<br\>/g,'\n');

        contElements.oContMissionBody.innerHTML = '';
        addClass(contElements.oContMissionBody,'mission-editing');
        contElements.oContMissionBody.appendChild(oEditArea);

        /*使任务标题可编辑*/
        var oEditTitle = document.createElement('input');
        oEditTitle.id = 'cont-title-edit';
        oEditTitle.type = 'text';
        oEditTitle.value = contElements.oMissionTitle.innerHTML;
        contElements.oMissionTitle.innerHTML = '';
        contElements.oMissionTitle.appendChild(oEditTitle);

        /*使任务时间可编辑*/
        var oEditTime = document.createElement('input');
        oEditTime.id = 'cont-time-edit';
        oEditTime.type = 'text';
        oEditTime.value = contElements.oMissionTime.innerHTML === 'now' ? 'yyyy-mm-dd' : contElements.oMissionTime.innerHTML;
        contElements.oMissionTime.innerHTML = '';
        contElements.oMissionTime.appendChild(oEditTime);
        
        /*使按钮变成保存和取消*/
        switchMissonContBtns('edit');
    })
}

/*点击了保存修改按钮*/
function saveEdit(){

    $.on('#save-edit','click',function(){
        /*获取dom元素集合*/
        var contElements = getMissionContElements(),
            oEditArea = $('#cont-mission-edit'),          //任务内容编辑框
            oEditTitle = $('#cont-title-edit'),    //标题编辑框
            oEditTime = $('#cont-time-edit'),    //任务完成时间编辑框
            mission = getEditingMission();       //当前编辑中的任务

        
        if( !Number(new Date(oEditTime.value).getTime()) ){
            alert("日期输入有误");
            return;
        }

        /*获取编辑后的值*/
        mission.name = oEditTitle.value;
        mission.time = oEditTime.value;
        mission.text = oEditArea.value;

        /*保存到storage*/
        updateStorage('missions');

        /*回到非编辑状态*/
        contElements.oMissionTitle.innerHTML = mission.name;
        contElements.oMissionTime.innerHTML = mission.time;
        contElements.oContMissionBody.innerHTML = mission.text.replace(/\n/g,'<br>');
        removeClass(contElements.oContMissionBody,'mission-editing');

        /*使按钮变成编辑和完成*/
        switchMissonContBtns('see');

    })
}

/*点击了取消保存按钮*/
function cancelEdit(){

    $.on('#cancel-edit','click',function(){

        var contElements = getMissionContElements(),    //获取dom元素集合
            mission = getEditingMission();        //当前编辑中的任务model
        if( hasClass(contElements.oContMissionBody,'mission-editing') ){
            if( !confirm("正在编辑中，要放弃保存吗") ){
                return;
            }else{
                switchMissonContBtns('see');
                removeClass(contElements.oContMissionBody,'mission-editing');

                /*在右侧主体区域填充任务的原本信息*/
                contElements.oMissionTitle.innerHTML = mission.name;
                contElements.oMissionTime.innerHTML = mission.time;
                contElements.oContMissionBody.innerHTML = mission.text.replace(/\n/g,'<br/>');

            }
        }
    })
}


/*点击了完成任务按钮*/
function finishMission(){
    $.on('#finish-mission','click',function(){

        var mission = getActiveMission();
        if(mission.type === 'finish'){
            alert('任务已经完成啦');
            return;
        }
        if(confirm('确认完成任务吗?') ){
            mission.type = 'finish';
            alert('任务完成！');
            /*更新本地存储*/
            updateStorage('missions');
        }
    })
}

/*点击了文件夹右边的小叉叉*/
function deleteFolder(){
    $.delegate('#tab-ul','span','click',function(){
        if(this.parentNode.id === 'protected'){
            alert('默认文件夹不能删除');
            return;
        }
        if( hasClass(this,'delete-folder') && confirm('确定要删除这个文件夹吗') ){
            var currentFolder = this.parentNode,
                folderId = parseInt(currentFolder.dataset.folderId);

            /*删除文件夹*/
            deleteFolderToStorage(folderId);
        }
    })
}

/*点击了新增分类按钮*/
function addTab(){

    $.on('#add-tab','click',function(){
        var tabPrompt=prompt("在当前分类下添加分类，请输入分类名字","分类");

        while( trim(tabPrompt) === '' ){
            alert('请输入分类名字呀');
            tabPrompt=prompt("在当前分类下添加分类，请输入分类名字","分类");
        }
        if(tabPrompt === null) return;

        /*获得当前选中分类*/
        var oActiveTab = $('#tabulation .font-active'),
            folderId = 0;

        /*获得最近的上层文件夹*/
        while( oActiveTab.tagName.toUpperCase() !== 'DIV' ) {
            oActiveTab = oActiveTab.parentNode;
            var childrenElm = getDomChildren( oActiveTab );
            for( var i = 0, len = childrenElm.length ; i<len ; i++ ){
                if( childrenElm[i].tagName.toUpperCase() === 'DIV' ) oActiveTab = childrenElm[i];
            }
        }

        /*获得folderId*/
        if( oActiveTab.id === 'all-mission' ){
            folderId = -1;
        }else{
            folderId = parseInt(oActiveTab.dataset.folderId);
        }
        /*添加folder到model*/
        addFolderToStorage( folderId,tabPrompt );
        /*更新视图*/
        updateTabulation();

    })
}

/*点击了新增任务按钮*/
function addMission(){
    $.on('#add-mission','click',function(){
        var oActiveTab = $('#tab-ul .font-active');
        if( oActiveTab.tagName.toUpperCase() !== 'LI' ){
            alert('请选择具体task来增加任务');
            return;
        }
        /*新增mission到model*/
        createNewMission(parseInt(oActiveTab.dataset.taskId));
        /*更新视图*/
        updateTimeline('all',true);
        updateTabulation();

        $('#edit-mission').click();
    })
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