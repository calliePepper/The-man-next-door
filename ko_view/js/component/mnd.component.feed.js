/* global jQuery ko mnd localStorage */

if (typeof(mnd) !== "object") mnd = {};
if (typeof(mnd.components) !== "object") mnd.components = {};

mnd.components.feed = (function(jQuery, ko) {

    var _self;

    function setup() {
        ko.applyBindings(_self);
        postBinding(); 
    }
    
    function postBinding() {
       
    }
    
    function viewModel(params) {
        _self = this;
    
    }
    
    /** Return public API */
    return {
        setup: setup,
        viewModel: viewModel,
        template: { element: 'feed' },
        synchronous: true

    };


})(jQuery, ko);
