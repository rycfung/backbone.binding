// Backbone.Binding v0.1.0
//
// Copyright (C) 2012 Ronald Fung
// Distributed Under MIT Liscene
//
// Documentation and Full Licence Availabe at:
// http://github.com/rycfung/backbone.binding
//
// ----------------------------
// Backbone.Binding
// ----------------------------
;(function(root){

    var modelbinding = (function(Backbone, _, $){

        var ModelBinding = {
            version: "0.1.0",

            parseBinding:function (bindingComponent, dataWrapper) {
                if (bindingComponent[1].indexOf('.') > 0) {
                    // this is dot notation
                    var matches = bindingComponent[1].match(/(.*)\.([^\.]*)$/);
                    var bindingParam = dataWrapper.get(matches[1].trim());
                    var bindingValue = matches[2].trim();
                }
                return {bindingParam:bindingParam, bindingValue:bindingValue};
            },

            bind: function(params, scope){
                var dataWrapper = new DataWrapper(params);
                var bindingName = "model-bind";

                var modelBind = this;
                $('['+bindingName+']', scope).each(function(ind, el){
                    var binding = $(el).attr(bindingName);
                    var bindingComponent = binding.split(':');
                    var bindingAttr = bindingComponent[0].trim();

                    var valueComponent = modelBind.parseBinding(bindingComponent, dataWrapper);

                    if(valueComponent.bindingValue.indexOf('()')>0) {
                        Modules[bindingAttr].bindFunc(bindingAttr, valueComponent.bindingValue, valueComponent.bindingParam, el);
                    }
                    else {
                        Modules[bindingAttr].bindAttr(bindingAttr, valueComponent.bindingValue, valueComponent.bindingParam, el);
                    }

                });
            }
        };


        var JQM = {
            _refreshSelect: function(el) {
                $(el).selectmenu('refresh');
            },
            _refreshText:$.noop,
            _refreshCheckboxRadio : function(el){
                $(el).checkboxradio('refresh');
            },
            _refreshSlider : function(el){
                $(el).slider('refresh');
            },

            refresh: function(el){
                if(typeof $.mobile !== "undefined"){
                    var type;
                    var tagName = $(el).prop('tagName').toLowerCase()
                    if(tagName == 'select'){
                        if($(el).attr('data-role') == 'slider'){
                            type = 'slider';
                        }
                        else {
                            type = 'select';
                        }
                    }
                    else if(tagName == 'input'){
                        type = $(el).attr('type');
                        if(typeof type == 'undefined' || type == null){
                            // the type if not specified, assume text input
                            type = 'text'
                        }
                    }

                    switch(type) {
                        case 'select': this._refreshSelect(el); break;
                        case 'text':   this._refreshText(el); break;
                        case 'radio':
                        case 'checkbox':
                            this._refreshCheckboxRadio(el); break;
                        case 'range':
                        case 'slider':
                            this._refreshSlider(el); break;
                        default:
                            break;
                    }
                }
            }
        };


        var StandardBinding = function(options){
            if(options.elementSetter && _.isFunction(options.elementSetter)){
                this.setOnElement = options.elementSetter;
            }
        };
        StandardBinding.prototype = {
            bindFunc: function(bindingAttr, bindingValue, params, el){
                // this is a function
                // bind the values to element now
                var bindingFunc = bindingValue.substr(0, bindingValue.indexOf('()'));
                this.setOnElement(el, bindingAttr, params[bindingFunc].call(params));

                // now we bind to the change event of the model
                params.on('change', _.bind(function(options){
                    // nothing really to check here, just run everytime
                    this.setOnElement(el, bindingAttr, params[bindingFunc].call(params));
                }, this));

                // now we bind to the change event of the element
                $(el).on('change', _.bind(function(event){
                    // pass the value to the method
                    params[bindingFunc].call(params, $(event.target).val())
                },this));
            },
            bindAttr: function(bindingAttr, bindingValue, params, el){
                // this is an attribute
                // bind the values to element now
                this.setOnElement(el, bindingAttr, params.get(bindingValue));

                // now we bind to the change event of the model
                params.on('change:'+bindingValue, _.bind(function(options){
                    // first check what is changed
                    // if the changed property matches our attribute
                    this.setOnElement(el, bindingAttr, params.get(bindingValue));
                },this));

                // now we bind to the change event of the element
                $(el).on('change', function(event){
                    var data = {};
                    data[bindingValue] = $(event.target).val();
                    params.set(data);
                })
            }
        };


        var DataWrapper = function(params){
            this.params = params;

            if ($.isArray(this.params) || _.isObject(this.params)){
                for(var key in this.params){
                    if (!(this.params[key] instanceof Backbone.Model)){
                        // this is not a backbone model, wrap it inside DataWrapper
                        var wrapped = new DataWrapper(this.params[key]);
                        this.params[key] = wrapped;
                    }
                }
            }
        };

        DataWrapper.prototype = {
            get: function(key){
                if(key.indexOf('.')>0)
                {
                    var matches = key.match(/^([^\.]*)\.*(.*)/);

                    return this.params[matches[1]].get(matches[2]);
                }
                else {
                    // no embedding
                    return this.params[key];
                }
            },

            set: function(key){
                if(key.indexOf('.')>0)
                {
                    var matches = key.match(/^([^\.]*)\.*(.*)/);

                    return this.params[matches[1]].set(matches[2]);
                }
                //note that we'll never have a key with no '.'. Only Backbone Models would arrive at this
            }
        };

        var ElementSetter = {
            select: function(el, attr, val){
                if(val!= null && typeof val !== 'undefined'){
                    if($('option[value="'+val+'"]', el).length > 0)
                    {
                        $('option[value="'+val+'"]', el).attr('selected', 'selected');
                    }
                    else {
                        $(el).val("");
                    }
                }
                else {
                    $(el).val('');
                }
                JQM.refresh(el);
            },
            text: function(el, attr, val){
                if (typeof val !== 'undefined')
                {
                    $(el).text(val);
                }
                else {
                    // nothing
                }
                JQM.refresh(el);
            },
            standard: function(el, attr, val){
                if (typeof val !== 'undefined')
                {
                    $(el).attr(attr, val);
                }
                else {
                    if($(el).attr(attr)){
                        $(el).removeAttr(attr);
                    }
                }
                JQM.refresh(el);
            }
        }

        var Modules =  {
            'value': new StandardBinding({elementSetter: ElementSetter.standard}),
            'select': new StandardBinding({elementSetter: ElementSetter.select}),
            'text': new StandardBinding({elementSetter: ElementSetter.text})
        }


        return ModelBinding;
    });

    // Backbone.Modelbinding AMD wrapper with namespace fallback
    if (typeof define === 'function' && define.amd) {
        // AMD support
        define([
            'backbone',    // use Backbone 0.5.3-optamd3 branch (https://github.com/jrburke/backbone/tree/optamd3)
            'underscore',  // AMD supported
            'jquery'       // AMD supported
        ], function (Backbone, _, jQuery) {
            return modelbinding(Backbone, _, jQuery);
        });
    } else {
        // No AMD, use Backbone namespace
        root.Backbone = Backbone || {};
        root.Backbone.ModelBinding = modelbinding(Backbone, _, jQuery);
    }

})(this);