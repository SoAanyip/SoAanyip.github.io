
// 开起 autuload, 好处是，依赖自动加载。
fis.config.set('modules.postpackager', 'autoload');
fis.config.set('settings.postpackager.autoload.type', 'requirejs');

/*fis.config.merge({
    pack: {
        'pkg/lib.js': [
            './js/index.js',
            './js/util.js'
        ]
    },
    modules : {
        //打包后调用fis-postpackager-xx插件进行处理
        postpackager : 'simple'
    }
}); */

/*fis.config.set('pack',{
    'pkg/lib.js': [
        '/js/index.js',
        '/js/util.js'
    ]
});

fis.config.set('modules.postpackager','simple');*/