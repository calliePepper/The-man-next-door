/* global jQuery ko mnd Storage */

if (mnd === undefined) var mnd = {};

mnd.utils = (function(jQuery, ko) {

    'use strict';
    //no vm because this is a utils object
    
    function constructor() {
        hijackErrors();
        extendLocalstorage();   
    }
    
    //hijack errors and use application to display errors all fancy like 
    function hijackErrors () {
        window.onerror = function (message, file, line, col, error) {
           console.log("Error occured: " + error.message);
           return false;
        };
        
        window.addEventListener("error", function (e) {
            console.log("Error occured: " + e.error.message);
            return false;
        });
    }
    
    //localstorage needs more functions for what we want to do
    function extendLocalstorage () {
        Storage.prototype.setObject = function(key, value) {
            //debugNotice('Saving to '+key);
            this.setItem(key, JSON.stringify(value));
        }
        
        Storage.prototype.getObject = function(key) {
            var value = this.getItem(key);
            return value && JSON.parse(value);
        }
    }
    
    function getUrlParamsObject() {
        var params = {};
        var hashArray = window.location.hash.substr(1).split('&');

        for (var i = 0, len = hashArray.length; i < len; i++) {
            var paramsArray = hashArray[i].split('=');
            params[paramsArray[0]] = paramsArray[1];
        }

        return params;
    }
    
    /** Return public API */
    return {
        getUrlParamsObject: getUrlParamsObject,
        constructor: constructor()
    };


})(jQuery, ko);
