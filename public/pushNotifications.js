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
            if (localStorage.getObject('gameSettings').firstLoad == 1) {
                console.log(timestampify()+'omg first load');
                lastUpdate = 1440;
                var tempData = localStorage.getObject('gameSettings');
                tempData.firstLoad = 0;
                firstLoadTime = 1;
                localStorage.setObject('gameSettings',tempData);
            }
            console.log(timestampify()+'Retrieving data');
            socket.emit('pageLoad', {
                page:$(document).find("title").text(),
                playerName:playerName,
                startTime:localStorage.getObject('gameSettings').startTime,
                lastUpdate:lastUpdate,
                currentTime:new Date(),
                users:localStorage.getObject('gameData').users,
                timezone:localStorage.getObject('gameSettings').timezone,
                lastFeed:localStorage.getObject('gameSettings').lastFeed,
                lastMessage:localStorage.getObject('gameSettings').lastMessage,
                lastComment:localStorage.getObject('gameSettings').lastComment,
                firstLoad:firstLoadTime,
                firstRun:firstRun,
                reg:deviceData['reg'],
                mob: deviceData['type']
            });
        });

        push.on('notification', function(data) {
            console.log("notification event");
            console.log(JSON.stringify(data));
            
            push.finish(function () {
                console.log('finish successfully called');
            });
        });

        push.on('error', function(e) {
            console.log("push error");
        });
    }
};