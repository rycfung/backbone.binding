require.config({
    paths: {
        jquery:     'libs/jquery',
        underscore: 'libs/underscore',
        backbone:   'libs/backbone',
        modelBinding: 'libs/backbone.binding'
    }

});

require(['app'], function(app) {
    app.initialize();
});