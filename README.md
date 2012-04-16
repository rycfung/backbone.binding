# About Backbone Model Binding

This is a model binding plugin made for Backbone.js. This plugin is inspired by the [Derick Bailey's
Backbone.ModelBinding](https://github.com/derickbailey/backbone.modelbinding), and
[Knockout.js](http://knockoutjs.com/)). Both of these plugins are super awesome, and I suggest that you take a look at
and try out both of them if you have time. While fiddling with the two plugins for my projects,
I saw that Knockout.js wasn't playing well with Backbone, due to the two different paradigm the libraries
set out to identify themselves as. Backbone.js, following the MVC pattern, tends to be flexible and in my opinion is
suitable for large projects. Knockout.js, on the other hand takes the
[MVVM approach](http://knockoutjs.com/documentation/introduction.html) which omits the usual controller layer
that handles a lot of the business logic in your applications.

One of the places where Knockout.js breaks down in Backbone.js is the way a Model is fundamentally handled. Backbone
keeps track of its model's attribute in an `attirubtes` field inside the model. Setting and getting model attributes
requires the caller to go through the `get()` and `set()` methods. Knockout.js, on the other hand,
implements its Model by declaring all attribute as the root of the object. Furthermore, the attributes must all be
declared with `ko.observable` in order for is Views to be aware of their changes.

# Usage

If you have been using Knockout.js, the usage of this library will be no stranger to you.

The library requires the following prerequisites:

* Backbone.js v0.9.1
* jQuery v1.7.1
* Underscore v1.3.1

These are recent versions of the libraries at the time of this plugins, and I haven't really tested it with earlier
version. If you find it to work with earlier versions, you're a happy rider. Otherwise, please inform me and I'll
try to patch it up if they're reasonable fixes. Better yet, send a pull request ;).


##Setting up

In order to get started, all you need is to include the `backbone.binding.js` library after its prerequisites.

When binding, just call

```
Backbone.ModelBinding.bind({model: myModel}, bindingElement);
```


The bind method in ModelBinding simply takes two parameters:

* data: An object containing all the variables to be made callable from within the template
* bindingElement: The binding element defines the scope of the binding. All elements having the binding attribute
 `model-bind` will be invoked.


### AMD Setup

The example source code has an easy to follow example showing how the plugins can be used in an AMD setting.

In particular, you will need to include the library in a view where binding in needed. Also, here is an example
of how to include the library if you use [require.js](http://http://requirejs.org).

```javascript
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
                '<span model-bind="text : greeting.world()"></span>'
                );

            var greeting = new GreetingModel();
            ModelBinding.bind({
                greeting: greeting
            }, this.$el);
        }
    });
    return HomeView;
});
```

## Bind!

Model Binding follows the convention that is used in Knockout.js. All bindings will be specified in the attribute
`model-bind` in the format `bindingType : bindingValue`.

* bindingType - can be one of the specified types in Binding Types
* bindingValue - can be one of an attribute in a Backbone Model, or a function.

Currently, the plugin supports only one type of binding per DOM element.

### Binding Types

Currently this plugin supports a 3 types of bindings:

* text binding - Bind the text of the element (as in the .text() function in jQuery)
* select binding - Bind the value of the select box
* attribute binding (anything other than the above bindings) - Binds an attribute



### Binding Attributes

You can bind a DOM element to an attribute that you specified in `data` in the `bind` function.

For example, given the following HTML template
```html
<div id='myDiv'>
    <div model-bind="text : greeting.x"/>
 </div>
```

And the following bind method:
```javascript
ModelBinding.bind({
                        greeting: Backbone.Model.extend({
                                    defaults: {x : 'hello_word'}})
                    , $('#myDiv'));
```

The binding will result in the following:
```html
<div id='myDiv'>
    <div model-bind="text : greeting.x">hello_world</div>
 </div>
```

Given an attribute, Model Binding will automatically seek out the attribute inside the Backbone Model. Now, your `div`
is binded to the value of x in greeting. You may also bind more than one Backbone Model.


You may also want to bind the div's id instead of its text. Assuming the same binding function, consider the following
template:

```html
<div id='myDiv'>
    <div model-bind="id: greeting.x"/>
 </div>
```

The result will be the following:

```html
<div id='myDiv'>
    <div id='hello_world' model-bind="id: greeting.x"/>
 </div>
```

Because you are binding to a Backbone Model, Model Binding piggy-backs on the 'change:x' events in Backbone's Model,
 and updates your bindings automatically.


###Binding Functions

You may also want to a function, much like the `ko.computed` bindings in Knockout.js. Function bindings simply invokes
a function in an object in `data` from the `bind` method. The result is that the DOM elements gets populated with the
function's return value.

For example, given the following HTML template
```html
<div id='myDiv'>
    <div model-bind="text : greeting.x()"/>
    <div model-bind="text : greeting:y()"/>
 </div>
```

And the following bind method:
```javascript
ModelBinding.bind({
                        greeting: Backbone.Model.extend({
                                        defaults: { x: 'hello', y: 'world'},
                                        a: function(){
                                            return this.get('x');
                                        },
                                        b: function(){
                                            return this.get('y')
                                        }
                                    }), $('#myDiv'));
```

The binding will result in the following:
```html
<div id='myDiv'>
    <div model-bind="text : greeting.a()">hello</div>
    <div model-bind="text : greeting.b()">world</div>
 </div>
```


Unfortunately, the function binding currently do not update the view automatically. However, what it does currently
provide is a one-way synchronization from the view to the model.

Consider the following example:
```html
<div id='myDiv'>
    <div model-bind="text : greeting.x"/>
    <input model-bind="text : greeting.z()">
</div>
```


And the following Backbone Model:

```javascript
var Greeting = Backbone.Model.extend({
                defaults: {x : 'hello'},
                z: function(val){
                    if(typeof val == 'undefined'){
                        return this.get('y');
                    }
                    this.set({y: val});
                    alert("y is changed to : " + val);
                }
        });
```


This Backbone Model is a little more elaborated than the previous examples. Here, we use Greeting.z() as the binding
 function to an input. It is similar to the previous example except this time the function takes in a `val` parameter.
 This parameter will be passed to the function should the binding DOM element changes its value.

For example, if the user enters '123' into the input that is binded to greeting.z(). The function call
`greeting.z('123') will be invoked, and the value in 'x' will be updated.


The function binding is especially helpful when dealing with complex values that aggregates multiple attributes from
the Model. In addition, complex business logic may also reside in the function to transform the data as user enters
values into the form inputs.



# Release Notes

## v0.1.0
* added model-bind
* added select binding


# Legal (MIT License)

Copyright (c) 2012 Ronald Fung

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

