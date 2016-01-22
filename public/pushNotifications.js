var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        var push = PushNotification.init({
            "android": {
                "senderID": "840758201462",
                "icon": "ic_stat_notif",
                "iconColor": "#910101"
            },
            "ios": {"alert": "true", "badge": "true", "sound": "true"}, 
            "windows": {} 
        });
        
        push.on('registration', function(data) {
            console.log("registration event");
            console.log(JSON.stringify(data.registrationId));
            console.log('Registering '+data);
            if ( data.registrationId.length > 0 )
            {
                deviceData['reg'] = data.registrationId;
            }
            triggerCheck();
            setTimeout(function() {askForNotes()},5000);
        });

        push.on('notification', function(data) {
            console.log("notification event");
            console.log(JSON.stringify(data));
            setTimeout(function() {askForNotes()},5000);
            push.finish(function () {
                console.log('finish successfully called');
            });
        });

        push.on('error', function(e) {
            console.log("push error");
        });
    }
};