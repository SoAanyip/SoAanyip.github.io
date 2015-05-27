/*window.onload = function(){
    GTDOnclickFunctions();
}*/
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