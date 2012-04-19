/**
 * Created with JetBrains PhpStorm.
 * User: localadmin
 * Date: 4/14/12
 * Time: 10:50 PM
 * To change this template use File | Settings | File Templates.
 */

define([
    'underscore',
    'backbone',
    'jquery',
    'models/Greeting',
    'modelBinding'
], function (_, Backbone, $, GreetingModel, ModelBinding) {

    var HomeView = Backbone.View.extend({
        el: 'body',

        initialize:function () {
        },

        render: function(){
            this.$el.html('' +
                '<span model-bind="text : greeting.x"></span> ' +
                '<span model-bind="text : greeting.world()"></span>' +
                '<br/>' +
                '<input model-bind="value: greeting.x">' +
                '<input model-bind="value: greeting.world()">' +
                '<br/>' +
                "<select model-bind='select : greeting.x'>" +
                    "<option value=''>Select</option>"+
                    "<option value='Hello'>Hello</option>"+
                    "<option value='GoodBye'>GoodBye</option>"+
                "</select>" +
                '<br/>' +
                "<label>Hello: <input type='checkbox' value='Hello' model-bind='checkbox: greeting.x'></label>"+
                '<br/>' +
                "<label>Foo: <input type='checkbox' model-bind='checkbox: checker.foo'></label>" +
                "<br/>" +
                "<span model-bind='text : checker.foo'/>" +
                "<br/>" +
                "<label>Bar: <input type='checkbox' model-bind='checkbox: checker.bar'></label>" +
                "<br/>" +
                "<span model-bind='text : checker.bar'/>"
                );

            var greeting = new GreetingModel();
            var checker = new (Backbone.Model.extend({
                defaults: {
                    foo: true,
                    bar: false
                },
                initialize: function(){}
            }))();
            ModelBinding.bind({
                greeting: greeting,
                checker:  checker
            }, this.$el);

            setTimeout(function(){
                greeting.set({x : 'GoodBye'});
            }, 2000)
        }
    });
    return HomeView;
});


