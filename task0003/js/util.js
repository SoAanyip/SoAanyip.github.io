(function () {
    'use strict';
    var util = function (selector) {
        if (!selector) {
            return null;
        }
        var context = document;

        /*匹配属性的正则*/
        var bracketNameReg = /^\[[\w\d-_]+\]$/;

        /*匹配属性为某值的正则*/
        var bracketValReg = /^\[[\w\d-_]+\=[\d\w-_\"\']+\]$/;

        /*匹配标签的正则*/
        var tagReg = /^[\w]+$/;

        if (

            /*document.querySelector*/ false) {
            return document.querySelector(selector);
        }
        else {

            /*由于倒序了，firstRound存放的就是匹配最后面表达式的元素*/
            var arr = util.trim(selector).split(/\s+/).reverse();
            var arrLen = arr.length;
            var i = 0;
            var j = 1;
            var firstRound = utilSelector(arr[0], context);

            if (!firstRound[0]) {
                return null;
            }
            if (arrLen === 1) {
                return firstRound[0];
            }

            /*循环firstRound的元素，如果不满足后序表达式的话就会出栈，保证最先匹配到的是第一个元素*/
            while (firstRound.length) {
                context = firstRound[0];

                /*对当前元素进行所有表达式的匹配。如果有完全匹配则立即返回。*/

                /*如果某一个不满足则shift()。如果firstRound全部元素不匹配则返回null*/
                for (; j < arrLen; j++) {
                    if ((context = utilSelector(arr[j], context)) === null) {
                        firstRound.shift();
                        break;
                    }

                }
                if (j === arrLen) {
                    return firstRound[0];
                }
            }
            return null;
        }

        /**
         * 对某一个元素进行某一个选择器的匹配。
         * @param  {String} selector 选择器字符串
         * @param  {HTMLElement} context  上一回合匹配成功的元素或者document
         * @return {Array || HTMLElement || null}     返回匹配成功的元素或者null，第一次查询时返回一个符合匹配的元素的数组
         */
        function utilSelector(selector, context) {

            /*进行第一次查询时返回的是数组*/
            var elms = [];

            /*组建判断函数，根据selector来构造函数*/
            var judAttr = (function (selector, bracketNameReg, bracketValReg) {

                /*class*/
                if (selector.charAt(0) === '.') {
                    selector = selector.substring(1);
                    return function (elm) {
                        return elm.className ? (elm.className.indexOf(selector) >= 0) : false;
                    };
                }

                /*匹配属性*/
                if (bracketNameReg.test(selector)) {
                    selector = selector.substring(1, selector.length - 1);
                    return function (elm) {
                        return (elm.getAttribute(selector));
                    };
                }

                /*匹配属性为某值*/
                else {
                    if (bracketValReg.test(selector)) {
                        selector = selector.substring(1, selector.length - 1);
                        var attrValue = selector.substring(selector.indexOf('=') + 1);
                        selector = selector.substring(0, selector.indexOf('='));
                        return function (elm) {
                            return (elm.getAttribute(selector) === attrValue);
                        };
                    }
                }

                /*不符合以上条件的话*/
                return function () {
                    return false;
                };

            })(selector, bracketNameReg, bracketValReg);

            /*如果是第一次匹配*/
            if (context === document) {

                /*匹配id选择器*/
                if (selector.charAt(0) === '#') {
                    elms.push(document.getElementById(selector.substring(1)));
                    return elms;
                }

                /*匹配标签选择器*/
                if (tagReg.test(selector)) {
                    return Array.prototype.slice.call(document.getElementsByTagName(selector));
                }

                /*取全部dom元素*/
                var allDom = document.getElementsByTagName('*');
                var allDomLen = allDom.length;

                /*匹配class或者属性选择器*/
                for (var k = 0; k < allDomLen; k++) {
                    if (judAttr(allDom[k])) {
                        elms.push(allDom[k]);
                    }
                }
                return elms;

            }

            /*对parentNode的循环匹配*/
            else {
                if (selector.charAt(0) === '#') {
                    selector = selector.substring(1);
                    while (context = context.parentNode) {
                        if (selector === context.id) {
                            return context;
                        }
                    }
                    return null;
                }

                if (tagReg.test(selector)) {
                    while (context = context.parentNode) {
                        if (context === document) {
                            return null;
                        }
                        if (selector.toUpperCase() === context.tagName.toUpperCase()) {
                            return context;
                        }
                    }
                    return null;
                }

                while (context = context.parentNode) {
                    if (context === document) {
                        return null;
                    }
                    if (judAttr(context)) {
                        return context;
                    }
                }
                return null;

            }
        }
    };


    // 判断arr是否为一个数组，返回一个bool值
    util.isArray = function (arr) {
        return Object.prototype.toString.call(arr).slice(8, -1) === 'Array';
    },
    // 判断fn是否为一个函数，返回一个bool值
    util.isFunction = function (fn) {
        return Object.prototype.toString.call(fn).slice(8, -1) === 'Function';
    },
    // 得到参数的类型
    util.getType = function (src) {
        return Object.prototype.toString.call(src).slice(8, -1);
    },
    // 使用递归来实现一个深度克隆，可以复制一个目标对象，返回一个完整拷贝
    // 被复制的对象类型会被限制为数字、字符串、布尔、日期、数组、Object对象。不会包含函数、正则对象等
    util.utilcloneObject = function (obj) {
        if (src === null) {
            return null;
        }
        if (src === undefined) {
            return undefined;
        }
        var key;
        var result;
        var srcClass = util.getType(src);
        if (srcClass === 'Object') {
            result = {};
        }
        else {
            if (srcClass === 'Array') {
                result = [];
            }
            else {
                if (srcClass === 'Date') {
                    return new Date(+src);
                }
                else {
                    if (srcClass === 'Number' || srcClass === 'String' || srcClass === 'Boolean') {
                        return src;
                    }
                }
            }
        }
        for (key in src) {
            var attr = src[key];
            if (util.getType(attr) === 'Object') {
                result[key] = arguments.callee(attr);
            }
            else {
                if (util.getType(attr) === 'Array') {
                    result[key] = arguments.callee(attr);
                }
                else {
                    result[key] = src[key];
                }
            }
        }
        return result;
    },
    // 对数组进行去重操作，只考虑数组中元素为数字或字符串，返回一个去重后的数组
    util.uniqArray = function (arr) {
        var result = [];
        var judObj = {};
        for (var i = 0, len = arr.length; i < len; i++) {
            var item = arr[i];
            if (!judObj[item]) {
                result.push(item);
                judObj[item] = true;
            }
        }
        return result;
    };

    // 对字符串头尾进行空格字符的去除、包括全角半角空格、Tab等，返回一个字符串
    util.trim = function (str) {
        if (str === null) {
            return null;
        }
        if (str === undefined) {
            return undefined;
        }

        /*chrome下’\s’可以匹配全角空格，但是考虑兼容的话，需要加上’\uFEFF\xA0’，去掉BOM头和全角空格。*/
        return str.replace(/(^[\s\uFEFF\xA0]+)|([\s\uFEFF\xA0]+$)/g, '');
    };

    // 实现一个遍历数组的方法，针对数组中每一个元素执行fn函数，并将数组索引和元素作为参赛传递
    util.each = function (arr, fn) {
        for (var i = 0, len = arr.length; i < len; i++) {
            fn.call(arr[i], arr[i], i);
        }
    };

    /**
    *   ，返回一个整数
    * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    *
    * @param {Object} obj
    * @return {number} 元素长度
    */
    util.getObjectLength = (function () {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var hasDontEnumBug = !({
                toString: null

            }).propertyIsEnumerable('toString');

        /*不可枚举bug*/
        var dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
        ];

        /*不可枚举的属性*/
        var dontEnumsLength = dontEnums.length;

        return function (obj) {

            /*如果不是Object*/
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('getObjectLength called on non-object');
            }

            var result = [];
            var prop;
            var i;

            for (prop in obj) {

                /*如果是自有属性*/
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            /*如果有不可枚举bug*/
            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result.length;
        };
    }());


    // 判断是否为邮箱地址
    util.isEmail = function (emailStr) {
        var mailReg = /^([\w\d])+\@([\w\d])+(\.([\w\d]{2,4}))+$/;
        return mailReg.test(emailStr);
    };

    // 判断是否为手机号
    util.isMobilePhone = function (phone) {
        var phoneReg = /^(\d{3,5}\-)?(\d{8,11})(\-\d{3,5})?$/;
        return phoneReg.test(phone);
    };

    /*转换常用字符为html字符实体*/
    util.htmlEscape = function (text) {
        return text.replace(/[<>\/"&']/g, function (match, position) {
            switch (match) {
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '&':
                    return '&amp;';
                case '\"':
                    return '&quot;';
                case '\'':
                    return '&apos;';
                case '\/':
                    return '&#x2F;';
            }

        });
    };

    /*转换html字符实体为字符*/
    util.htmlReturn = function (text) {
        return text.replace(/(&lt;|&gt;|&amp;|&quot;|&apos;|&#x2F;)/g, function (match, position) {
            switch (match) {
                case '&lt;':
                    return '<';
                case '&gt;':
                    return '>';
                case '&amp;':
                    return '&';
                case '&quot;':
                    return '\"';
                case '&apos;':
                    return '\'';
                case '&#x2F;':
                    return '\/';
            }

        });
    };

    // 判断是否为IE浏览器，返回-1或者版本号
    util.isIE = function () {
        // '\x241' 是八进制表示法 '\x24' 对应字符 '$' ，所以 '\x241'  等同于 '$1'
        // RegExp['$1'] ：是JS属性的另一种调用方式等同于 RegExp.$1。js中每个属性相当于一个数组元素。
        // + RegExp['\x241'] 就相当于 +RegExp.$1
        // RegExp.$1 是取出正则匹配的第一个捕获，+能够将后面的“整形字符串”转换成 “整形”
        return /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || +RegExp['\x241']) : -1;

    /*var userAgent = navigator.userAgent;
    var version = userAgent.indexOf("MSIE"); 
    if (version < 0) {
      return -1;
    }
    return parseFloat(userAgent.substring(version + 5, userAgent.indexOf(";", version)));*/
    };

    /*验证cookie命名是否合法*/
    util.isValidCookieName = function (cookieName) {
        // http://www.w3.org/Protocols/rfc2109/rfc2109
        // 以下是在cookie中不合法的命名
        // av-pairs = av-pair *(";" av-pair)
        // av-pair = attr ["=" value] ; optional value
        // attr = token
        // value = word
        // word = token | quoted-string
        // http://www.ietf.org/rfc/rfc2068.txt
        // token = 1*<any CHAR except CTLs or tspecials>
        // CHAR = <any US-ASCII character (octets 0 - 127)>
        // CTL = <any US-ASCII control character
        // (octets 0 - 31) and DEL (127)>
        // tspecials = "(" | ")" | "<" | ">" | "@"
        // | "," | ";" | ":" | "\" | <">
        // | "/" | "[" | "]" | "?" | "="
        // | "{" | "}" | SP | HT
        // SP = <US-ASCII SP, space (32)>
        // HT = <US-ASCII HT, horizontal-tab (9)>
        return (new RegExp('^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24')).test(cookieName);
    };

    // 设置cookie
    util.setCookie = function (cookieName, cookieValue, expiredays) {
        if (!cookieName || !util.isValidCookieName(cookieName)) {
            return;
        }
        cookieValue = cookieValue || '';
        expiredays = expiredays || 30;
        var date = new Date();
        date.setDate(date.getDate() + expiredays);

        /*if(!getCookie(cookieName)){*/
        document.cookie = cookieName + '=' + encodeURIComponent(cookieValue) + ';expires=' + date.toUTCString();

    /*}else{
      document.cookie.replace(getCookie(cookieName),cookieValue);
    }*/
    };

    // 获取cookie值
    util.getCookie = function (cookieName) {
        if (!cookieName || !util.isValidCookieName(cookieName)) {
            return;
        }

        var nameStart = document.cookie.indexOf(cookieName + '=');
        if (nameStart >= 0) {
            nameStart = nameStart + cookieName.length + 1;
            var nameEnd = document.cookie.indexOf(';', nameStart);
            if (nameEnd === -1) {
                nameEnd = document.cookie.length;
            }
            return decodeURLComponent(document.cookie.substring(nameStart, nameEnd));
        }
        return '';
    };

    // ajax 方法
    util.ajax = function (url, options) {

        /*配置获取XMLHTTPRequest对象的方法*/
        var getXMLRequest = (function () {
            if (typeof XMLHttpRequest !== undefined) {
                return function () {
                    return new XMLHttpRequest();
                };
            }
            else {
                return function () {
                    var xmlhttp = null;
                    var versions = [
                        'MSXML2.XMLHttp2.0',
                        'MSXML2.XMLHttp3.0',
                        'MSXML2.XMLHttp4.0',
                        'MSXML2.XMLHttp5.0',
                        'MSXML2.XMLHttp6.0',
                        'MSXML2.XMLHttp',
                        'Miscrosoft.XMLHTTP'
                    ];
                    for (var i = 0; i < versions.length; i++) {
                        try {
                            xmlhttp = new ActiveXObject(versions[i]);
                            return xmlhttp;
                        }
                        catch (ex) {
                            continue;
                        }
                    }
                    return null;
                };
            }
        })();

        /*验证用户输入*/
        var xhr = getXMLRequest();
        options = options || {};
        var type = options.type || 'GET';
        var data = options.data || {};

        /*配置onsuccess和onfail*/
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                if (options.onsuccess) {
                    options.onsuccess(xhr.responseText, xhr);
                }
            }
            else {
                if (xhr.readyState === 4 && xhr.status === 404) {
                    if (options.onfail) {
                        options.onfail(xhr.responseText, xhr);
                    }
                }
            }
        };

        /*发送GET请求*/
        if (type.toUpperCase() === 'GET') {
            var str = '?';
            for (var i in options.data) {
                var obj = options.data[i];
                str += i + '=';
                if (util.getType(obj) === 'Object') {
                    str += getAttr(obj) + '&';
                }
                else {
                    str += obj + '&';
                }

            }
            str = str.substring(0, str.length - 1);
            xhr.open('GET', url + str, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.send(null);
        }

        /*发送POST请求*/
        else {
            var str = '';
            for (var i in options.data) {
                var obj = options.data[i];
                str += i + '=';
                if (util.getType(obj) === 'Object') {
                    str += getAttr(obj) + '&';
                }
                else {
                    str += obj + '&';
                }

            }
            str = str.substring(0, str.length - 1);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.open('POST', url, true);
            xhr.send(str);
        }

        /*如果data中有json对象的话进行处理*/
        function getAttr(obj) {
            var str = '{';
            var type = util.getType(obj);

            if (type !== 'Object') {
                return obj;
            }

            for (var i in obj) {
                str += i + ':';
                if (util.getType(obj[i]) === 'Object') {
                    str += '{';
                    str += arguments.callee(obj[i]);
                    str += '},';
                }
                else {
                    str += obj[i] + ',';
                }
            }
            str = str.substring(0, str.length - 1) + '}';
            return str;
        }
    };

    // 检测dom是否具有名字为className的class
    util.hasClass = function (element, className) {
        if (!className || !element || !element.className) {
            return false;
        }
        var classNames = element.className.split(/\s+/);
        for (var i = 0, len = classNames.length; i < len; i++) {
            if (classNames[i] === className) {
                return true;
            }
        }
        return false;
    };

    // 为dom增加一个样式名为newClassName的新样式
    util.addClass = function (element, newClassName) {
        if (!newClassName || !element) {
            return;
        }
        if (!element.className) {
            element.className = newClassName;
        }
        else {
            if (!util.hasClass(element, newClassName)) {
                element.className = [
                    element.className,
                    newClassName
                ].join(' ');
            }
        }
    };

    // 移除dom中的样式oldClassName
    util.removeClass = function (element, oldClassName) {
        if (!oldClassName || !element || !element.className) {
            return;
        }
        if (oldClassName === '*') {
            return element.className = '';
        }
        var classNames = element.className.split(/\s+/);
        for (var i = 0, len = classNames.length; i < len; i++) {
            if (classNames[i] === oldClassName) {
                classNames.splice(i, 1);
            }
        }
        element.className = classNames.join(' ');
    };

    // toggleClass
    util.toggleClass = function (element, className) {
        if (util.hasClass(element, className)) {
            util.removeClass(element, className);
        }
        else {
            util.addClass(element, className);
        }
    };

    // 判断siblingNode和dom是否为同一个父元素下的同一级的元素，返回bool值
    util.isSiblingNode = function (element, siblingNode) {
        if (!siblingNode || !element) {
            return false;
        }
        return element.parentNode === siblingNode.parentNode;
    };

    // 获取dom相对于浏览器窗口的位置，返回一个对象
    util.getPosition = function (element) {
        if (!element) {
            return undefined;
        }
        var box = element.getBoundingClientRect();

        /*box.top,box.left,box.bottom,box.right,表示元素各边与页面上边和左边的距离*/
        return box;
    };

    /*获得元素的children集合*/
    util.getDomChildren = function (el) {
        var children = [];
        for (var i = el.children.length; i--;) {
            // 清除ie8bug
            if (el.children[i].nodeType !== 8) {
                children.unshift(el.children[i]);
            }
        }
        return children;
    };


    // 给一个dom绑定一个针对event事件的响应，响应函数为listener
    util.addEvent = function (element, event, listener) {
        if (!listener || !event || !element) {
            return;
        }

        /*由于匿名函数无法去除，所以把函数命名前和命名后都存放在元素里面*/
        element[event + 'Events'] = element[event + 'Events'] || [];

        /*把函数命名为_listener*/
        var _listener;

        if (element.addEventListener) {

            /*命名*/
            _listener = listener;

            /*把用户传入函数和包装后的函数保存*/
            element[event + 'Events'].push({
                raw: listener,
                wrap: _listener

            });

            element.addEventListener(event, _listener, false);
        }
        else {
            if (element.attachEvent) {
                _listener = function () {
                    listener.call(element);
                };

                element[event + 'Events'].push({
                    raw: listener,
                    wrap: _listener

                });

                element.attachEvent('on' + event, _listener);
            }
        }
    };


    // 移除dom对象对于event事件发生时执行listener的响应，当listener为空时，移除所有响应函数
    util.removeEvent = function (element, event, listener) {
        if (!event || !element) {
            return;
        }

        if (element.removeEventListener) {

            /*如果传入listener为空，移除所有该事件的响应函数*/
            if (!listener) {
                for (var i = 0; i < element[event + 'Events'].length; i++) {
                    element.removeEventListener(event, element[event + 'Events'][i].wrap, false);
                }
                return;
            }

            /*如果并不是通过util传入的事件*/
            if (!element[event + 'Events']) {
                element.removeEventListener(event, listener, false);
            }
            else {

                /*通过传入的函数找到包装函数来去除*/
                element.removeEventListener(event, util.findWrapEvent(element, event, listener), false);
            }

        }
        else {
            if (element.detachEvent) {
                if (!listener) {
                    for (var i = 0; i < element[event + 'Events'].length; i++) {
                        element.detachEvent('on' + event, element[event + 'Events'][i].wrap);
                    }
                    return;
                }

                if (!element[event + 'Events']) {
                    element.detachEvent('on' + event, listener);
                }
                else {
                    element.detachEvent('on' + event, util.findWrapEvent(element, event, listener));
                }
            }
        }
    };

    // 实现对click事件的绑定
    util.addClickEvent = function (element, listener) {
        if (!listener || !element) {
            return;
        }
        util.addEvent(element, 'click', listener);
    };

    // 实现对于按Enter键时的事件绑定
    util.addEnterEvent = function (element, listener) {
        if (!listener || !element) {
            return;
        }

        var _listener = function (event) {
            event = event || window.event;
            var keyCode = event.which || event.keyCode;
            if (keyCode === 13) {
                listener.call(element, event);
            }
        };

        util.addEvent(element, 'keyup', _listener);
    };

    // 事件委托
    util.delegateEvent = function (element, tag, event, listener) {
        if (!listener || !event || !tag || !element) {
            return;
        }

        var _listener = function (event) {
            event = event || window.event;
            var target = event.target || event.srcElement;
            if (target.tagName === tag.toUpperCase() || tag === '*') {
                listener.call(target, event);
            }
        };

        util.addEvent(element, event, _listener);

    };

    /*根据传入的用户定义函数找出真正添加的函数*/
    util.findWrapEvent = function (element, event, raw) {
        var i = 0;

        /*通过用户传入函数或遭到包装函数*/
        for (; i < element[event + 'Events'].length; i++) {
            if (element[event + 'Events'][i].raw.toString() === raw.toString()) {
                return element[event + 'Events'][i].wrap;
            }
        }

        return null;
    };

    util.on = function (selector, event, listener) {
        return util.addEvent(util(selector), event, listener);
    };

    util.click = function (selector, listener) {
        return util.addClickEvent(util(selector), listener);
    };

    util.un = function (selector, event, listener) {
        return util.removeEvent(util(selector), event, listener);
    };

    util.delegate = function (selector, tag, event, listener) {
        return util.delegateEvent(util(selector), tag, event, listener);
    };


    /*检测amd规范*/
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return util;
        });
    }
    else {
        window.util = util;
    }
})();
