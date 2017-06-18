/* global jQuery ko mnd localStorage */

if (typeof(mnd) !== "object") mnd = {};

mnd.main = (function(jQuery, ko) {

    'use strict';
    
    var _self = new vmMain();

    
    function constructor() {
        //TODO:: CHECK BROWSER CAPABILITIES AND DEGRADE GRACFULLY
        
        //register components
        ko.components.register("feed", mnd.components.feed );

        ko.applyBindings(_self);

        postBinding(); 
    }
    
    function postBinding() {
       // Watch for hashchange events
        jQuery(window).on("hashchange", function(){
            routePage();
        });
        routePage();
    }
    
    function routePage() {

        // Check if there is a deep link
        var urlParams = mnd.utils.getUrlParamsObject();
        
        //before routing make sure there is no selection
        if (urlParams["page"] === "feed") {
            _self.pageRoute("feed");
        } else if (urlParams["page"] === "messaging") {
            _self.pageRoute("messaging");
        } 
    }
    
    function vmMain() {
        _self = this;
        
        // z-index of elements should go overlay, game state, page route.
        _self.overlayState = ko.observable("");     //"compatibility", "intro", "twaddleintro", "loading", ""
        _self.gameState = ko.observable("");        //"error", "fq", ""
        _self.pageRoute = ko.observable("feed");    //"feed", "pages", "messaging"
        
        //determine first run and show intro screen
        _self.firstRun = ko.computed( function () {
            if(localStorage.getObject('gameData') != undefined) {
                //build data
                return true;
            } else {
                return false;
            }
        });
    
    }
    
    /** Return public API */
    return {
        
        //make public functions
        //visibleFunction: visibleFunction,
        
        constructor: constructor()
    };


})(jQuery, ko);
