window.onload = function(){
    clickTab();
}

function clickTab(){
    $.delegate('#tab','a','click',function(){
        addClass( $('html'),'task-show' );
        removeClass( $('#task'),'hide-bg' );
        setTimeout(function(){
            removeClass( $('html'),'task-show' );
            addClass( $('html'),'task-now' );
        },400)
    })

}