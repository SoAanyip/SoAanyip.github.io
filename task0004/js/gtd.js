window.onload = function(){
    clickTab();
}

function clickTab(){
    $.delegate('#tab','a','click',function(){
        addClass( $('html'),'task-show' );
        removeClass( $('#task'),'hide-bg' );
    })
    /*$.delegate('#task','a','click',function(){
        addClass( $('html'),'task-show' );
        removeClass( $('#task'),'hide-bg' );
    })*/
}