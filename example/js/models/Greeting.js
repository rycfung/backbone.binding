/**
 * Created with JetBrains PhpStorm.
 * User: localadmin
 * Date: 4/14/12
 * Time: 11:02 PM
 * To change this template use File | Settings | File Templates.
 */

define([
    'underscore',
    'backbone',
    'jquery'
], function (_, Backbone, $) {

    var GreetingModel = Backbone.Model.extend({
        defaults: {
            x: 'Hello',
            y: 'World!'
        },

        initialize:function () {
        },

        world: function(val){
            if(typeof val == 'undefined'){
                return this.get('y');
            }
            this.set({y: val});
            alert("y is changed to : " + val);
        }
    });
    return GreetingModel;
});


