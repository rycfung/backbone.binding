define(['jquery',
    'underscore',
    'backbone',
    'router'
],
function($, _, Backbone, Router) {


    return {
        initialize: function() {
            var router = new Router();
//            router.navigate('home',{trigger: true});
            Backbone.history.start();
            router.navigate('home');
        }
    };

});