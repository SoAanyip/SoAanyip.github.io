function initHash(){var a=judHash();packElms(a),getElms().lastHash=a[0],""!==location.hash&&sectionChange(a[0]),window.onhashchange=function(){a=judHash(),packElms(a),sectionAnimate(judHash()[0]),getElms().lastHash=a[0]}}function judHash(){if(""===location.hash)return["index"];var a=location.hash.substring(2);return-1!==a.indexOf("tab")&&-1===a.indexOf("/")?["tab",a.substring(3)]:-1!==a.indexOf("task")?["task",a.substring(a.indexOf("task")+4),a.substring(3,a.lastIndexOf("/"))]:void 0}function packElms(a){var t=getTask();"index"===a[0]?packIndex(t):"tab"===a[0]?packTab(a[1],t):"task"===a[0]&&packTask(a[1],a[2],t)}function packIndex(a){for(var t=getElms().oIndex.getElementsByTagName("ul")[0],e=document.createDocumentFragment(),n=0,s=a.length;s>n;n++){var i=document.createElement("li"),o=document.createElement("a");i.className="item one-tab",o.href="#/tab"+a[n].id,o.innerHTML=a[n].name,i.appendChild(o),e.appendChild(i)}t.innerHTML="",t.appendChild(e)}function packTab(a,t){for(var e=getElms().oTab.getElementsByTagName("ul")[0],n=document.createDocumentFragment(),s=0,i=t.length;i>s;s++)if(t[s].id===parseInt(a)){for(var o=0,d=t[s].children,l=d.length;l>o;o++){var r=document.createElement("li"),c=document.createElement("a");r.className="item one-task",c.href="#/tab"+a+"/task"+d[o].id,c.innerHTML=d[o].name,r.appendChild(c),n.appendChild(r)}break}e.innerHTML="",e.appendChild(n)}function packTask(a,t,e){for(var n=$("#task-name"),s=$("#task-time"),i=$("#task-text"),o=0,d=e.length;d>o;o++)if(e[o].id===parseInt(t))for(var l=0,r=e[o].children,c=r.length;c>l;l++)r[l].id===parseInt(a)&&(n.innerHTML=r[l].name,s.innerHTML=r[l].time,i.innerHTML=r[l].text.replace(/\n/,"<br>"))}function sectionAnimate(a){var t=getElms();removeClass(t.oHtml,"*"),"tab"===a?(addClass(t.oHtml,a+"-from-"+t.lastHash),setTimeout(function(){t.oHtml.className=a+"-now"},400)):(addClass(t.oHtml,a+"-show"),setTimeout(function(){t.oHtml.className=a+"-now"},400))}function sectionChange(a){var t=getElms();t.oHtml.className=a+"-now"}function touchBack(){for(var a=document.querySelectorAll(".touch-to-back"),t=void 0,e=0,n=a.length;n>e;e++)a[e].addEventListener("touchstart",function(){t=this},!1),$("#body").addEventListener("touchend",function(){if(t){var a=t.parentNode;"index"===a.id?location.hash="":"tab"===a.id&&(location.hash=location.hash.substring(0,location.hash.lastIndexOf("/"))),t=void 0}});a=null}function _getElms(){var a=$("html"),t=$("#index"),e=$("#tab"),n=$("#task"),s={oHtml:a,oIndex:t,oTab:e,oTask:n,lastHash:void 0};return function(){return s}}function _getTask(){var a=JSON.parse(localStorage.getItem("task"))||[{name:"任务分类1",id:1,children:[{name:"任务1",id:1,time:"2015-05-10",text:"asdadasdas\nasdas"},{name:"任务2",id:2,time:"2015-05-20",text:"asdadasda"}]},{name:"任务分类2",id:2,children:[{name:"任务1",id:1,time:"2015-05-10",text:"asdadasdas\nasdas"},{name:"任务2",id:2,time:"2015-05-20",text:"asdadasda"}]},{name:"任务分类3a",id:3,children:[{name:"任务1",id:1,time:"2015-05-10",text:"asdadasdas\nasdas"},{name:"任务2",id:2,time:"2015-05-20",text:"asdadasda"}]}];return localStorage.getItem("task")||localStorage.setItem("task",JSON.stringify(a)),function(){return a}}window.onload=function(){initHash(),touchBack()};var getElms=_getElms(),getTask=_getTask();
;function isArray(e){return"Array"===Object.prototype.toString.call(e).slice(8,-1)}function isFunction(e){return"Function"===Object.prototype.toString.call(e).slice(8,-1)}function getType(e){return Object.prototype.toString.call(e).slice(8,-1)}function cloneObject(e){if(null===e)return"Null";if(void 0===e)return"Undefined";var t,n,r=getType(e);if("Object"===r)n={};else if("Array"===r)n=[];else if("Number"===r||"String"===r||"Boolean"===r||"Date"===r)return e;for(t in e){var a=e[t];n[t]="Object"===getType(a)?arguments.callee(a):"Array"===getType(a)?arguments.callee(a):e[t]}return n}function uniqArray(e){for(var t=[],n={},r=0,a=e.length;a>r;r++){var i=e[r];n[i]||(t.push(i),n[i]=!0)}return t}function trim(e){return null===e?null:void 0===e?void 0:e.replace(/(^\s*)|(\s*$)/g,"")}function each(e,t){for(var n=0,r=e.length;r>n;n++)t.call(e,e[n],n)}function getObjectLength(e){var t=0;for(var n in e)t++;return t}function isEmail(e){var t=/^([\w\d])+\@([\w\d])+(\.([\w\d]{2,4}))+$/;return t.test(e)}function isMobilePhone(e){var t=/^(\d{3,5}\-)?(\d{8,11})(\-\d{3,5})?$/;return t.test(e)}function hasClass(e,t){if(!t||!e||!e.className)return!1;var n=e.className.indexOf(t);return-1===n?!1:!0}function addClass(e,t){t&&e&&(e.className?-1===e.className.indexOf(t)&&(e.className+=" "+t):e.className=t)}function removeClass(e,t){if(t&&e&&e.className){if("*"===t)return e.className="";var n=e.className.indexOf(t);-1!==n&&(e.className=e.className.substring(0,n)+e.className.substring(n+t.length))}}function toggleClass(e,t){hasClass(e,t)?removeClass(e,t):addClass(e,t)}function isSiblingNode(e,t){return t&&e?e.parentNode===t.parentNode:!1}function getPosition(e){function t(e){var t=e.offsetTop;return null!=e.offsetParent&&(t+=arguments.callee(e.offsetParent)),t}function n(e){var t=e.offsetLeft;return null!=e.offsetParent&&(t+=arguments.callee(e.offsetParent)),t}if(!e)return void 0;var r={x:n(e),y:t(e)};return r}function $(e){function t(e,t){var n=[],o=function(e,t,n){if("."===e.charAt(0))return e=e.substring(1),function(t){return t.className?t.className.indexOf(e)>=0:!1};if(t.test(e))return e=e.substring(1,e.length-1),function(t){return t.getAttribute(e)};if(n.test(e)){e=e.substring(1,e.length-1);var r=e.substring(e.indexOf("=")+1);return e=e.substring(0,e.indexOf("=")),function(t){return t.getAttribute(e)===r}}return function(){return!1}}(e,r,a);if(t===document){if("#"===e.charAt(0))return n.push(document.getElementById(e.substring(1))),n;if(i.test(e))return Array.prototype.slice.call(document.getElementsByTagName(e));for(var u=document.getElementsByTagName("*"),s=u.length,c=0;s>c;c++)o(u[c])&&n.push(u[c]);return n}if("#"===e.charAt(0)){for(e=e.substring(1);t=t.parentNode;)if(e===t.id)return t;return null}if(i.test(e)){for(;t=t.parentNode;){if(t===document)return null;if(e.toUpperCase()===t.tagName.toUpperCase())return t}return null}for(;t=t.parentNode;){if(t===document)return null;if(o(t))return t}return null}if(!e)return null;var n=document,r=/^\[[\w\d-_]+\]$/,a=/^\[[\w\d-_]+\=[\d\w-_\"\']+\]$/,i=/^[\w]+$/,o=trim(e).split(/\s+/).reverse(),u=o.length,s=1,c=t(o[0],n);if(!c[0])return null;if(1===u)return c[0];for(;c.length;){for(n=c[0];u>s;s++)if(null===(n=t(o[s],n))){c.shift();break}if(s===u)return c[0]}return null}function getDomChildren(e){for(var t=[],n=e.children.length;n--;)8!=e.children[n].nodeType&&t.unshift(e.children[n]);return t}function addEvent(e,t,n){if(n&&t&&e){e[t+"Events"]=e[t+"Events"]||[];var r=void 0;e.addEventListener?(r=n,e[t+"Events"].push({raw:n,wrap:r}),e.addEventListener(t,r,!1)):e.attachEvent?(r=function(){n.call(e)},e[t+"Events"].push({raw:n,wrap:r}),e.attachEvent("on"+t,r)):e["on"+t]=n}}function removeEvent(e,t,n){if(t&&e)if(e.removeEventListener){if(!n){for(var r=0;r<e[t+"Events"].length;r++)e.removeEventListener(t,e[t+"Events"][r].wrap,!1);return}e[t+"Events"]?e.removeEventListener(t,findWrapEvent(e,t,n),!1):e.removeEventListener(t,n,!1)}else if(e.detachEvent){if(!n){for(var r=0;r<e[t+"Events"].length;r++)e.detachEvent("on"+t,e[t+"Events"][r].wrap);return}e[t+"Events"]?e.detachEvent("on"+t,findWrapEvent(e,t,n)):e.detachEvent("on"+t,n)}else e["on"+t]=null}function addClickEvent(e,t){t&&e&&addEvent(e,"click",t)}function addEnterEvent(e,t){if(t&&e){e.keyupEvents=e.keyupEvents||[];var n=void 0;e.addEventListener?(n=function(n){13==n.keyCode&&t.call(e,n)},e.keyupEvents.push({raw:t,wrap:n}),e.addEventListener("keyup",n,!1)):e.attachEvent&&(n=function(){13==window.event.keyCode&&t.call(e,window.event)},e.keyupEvents.push({raw:t,wrap:n}),e.attachEvent("onkeyup",n))}}function delegateEvent(e,t,n,r){if(r&&n&&t&&e){e[n+"Events"]=e[n+"Events"]||[];var a=void 0;if(e.addEventListener)a=function(e){(e.target.tagName.toUpperCase()===t.toUpperCase()||"*"===t)&&r.call(e.target,e)},e[n+"Events"].push({raw:r,wrap:a}),addEvent(e,n,a);else{if(!e.attachEvent)return!1;a=function(){window.event.srcElement.tagName.toUpperCase()===t.toUpperCase()&&r.call(window.event.srcElement,window.event)},e[n+"Events"].push({raw:r,wrap:a}),addEvent(e,n,a)}}}function findWrapEvent(e,t,n){for(var r=0;r<e[t+"Events"].length;r++)if(e[t+"Events"][r].raw.toString()===n.toString())return e[t+"Events"][r].wrap;return null}function isIE(){var e=navigator.userAgent,t=e.indexOf("MSIE");return 0>t?-1:parseFloat(e.substring(t+5,e.indexOf(";",t)))}function setCookie(e,t,n){if(e){t=t||"",n=n||30;var r=new Date;r.setDate(r.getDate()+n),document.cookie=encodeURIComponent(e)+"="+encodeURIComponent(t)+";expires="+r.toUTCString()}}function getCookie(e){if(!e)return"";var t=document.cookie.indexOf(encodeURIComponent(e)+"=");if(t>=0){t=t+e.length+1;var n=document.cookie.indexOf(";",t);return-1===n&&(n=document.cookie.length),decodeURLComponent(document.cookie.substring(t,n))}return""}function ajax(e,t){function n(e){var t="{",n=getType(e);if("Object"!==n)return e;for(var r in e)t+=r+":","Object"===getType(e[r])?(t+="{",t+=arguments.callee(e[r]),t+="},"):t+=e[r]+",";return t=t.substring(0,t.length-1)+"}"}var r=function(){return void 0!=typeof XMLHttpRequest?function(){return new XMLHttpRequest}:function(){for(var e=null,t=["MSXML2.XMLHttp2.0","MSXML2.XMLHttp3.0","MSXML2.XMLHttp4.0","MSXML2.XMLHttp5.0","MSXML2.XMLHttp6.0","MSXML2.XMLHttp","Miscrosoft.XMLHTTP"],n=0;n<t.length;n++)try{return e=new ActiveXObject(t[n])}catch(r){continue}return null}}(),a=r();t=t||{};{var i=t.type||"GET";t.data||{}}if(a.onreadystatechange=function(){4==a.readyState&&200==a.status?t.onsuccess&&t.onsuccess(a.responseText,a):4==a.readyState&&404==a.status&&t.onfail&&t.onfail(a.responseText,a)},"GET"===i.toUpperCase()){var o="?";for(var u in t.data){var s=t.data[u];o+=u+"=",o+="Object"===getType(s)?n(s)+"&":s+"&"}o=o.substring(0,o.length-1),a.open("GET",e+o,!0),a.send(null)}else{var o="";for(var u in t.data){var s=t.data[u];o+=u+"=",o+="Object"===getType(s)?n(s)+"&":s+"&"}o=o.substring(0,o.length-1),a.setRequestHeader("Content-type","application/x-www-form-urlencoded"),a.open("POST",e,!0),a.send(o)}}$.on=function(e,t,n){addEvent($(e),t,n)},$.click=function(e,t){addClickEvent($(e),t)},$.un=function(e,t,n){removeEvent($(e),t,n)},$.delegate=function(e,t,n,r){delegateEvent($(e),t,n,r)};