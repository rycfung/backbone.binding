define(['jquery',
    'underscore',
    'backbone',
    'views/Home'
], function($, _, Backbone, HomeView) {

    var Router = Backbone.Router.extend({
        routes: {
            'home': 'showHome'
        },

        showHome: function(){
            new HomeView().render();
        }
    });


    return Router;
});