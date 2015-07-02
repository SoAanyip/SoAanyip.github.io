require.config({
    baseUrl: 'js',
    paths: {
        util: 'util',
        gtd: 'index'

    }
});

require([
    'gtd'
], function (gtd) {
    gtd()();
});
