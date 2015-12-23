/*

               global comment
               global post
               global trending
               global message
               global user
               global app
               global socket
               global mobNotifications
               global timestampify
               global gameUpdate

            */
            
var firstRun = 1;          
var connected = 0;
            
var rebootIfError = setTimeout(function() {
    window.localStorage.clear();
    window.location.replace("index.html?connection=error");    
},20000);


socket.on('requestStatus', function(data) {
    clearTimeout(rebootIfError);
    if (mobNotifications == 1) {
        app.initialize();
    } else {
        requestStatusReply();
    }
    var waitCount = 0;
    for (var prop in localStorage.getObject('gameSettings').messageWait) {
        if (localStorage.getObject('gameSettings').messageWait.hasOwnProperty(prop)) {
            waitCount++;
        }
    }
    if (firstRun == 1 && waitCount > 0) {
        console.log(timestampify()+'Uh oh, there is a messageWait');
        console.log(localStorage.getObject('gameSettings').messageWait);
        socket.emit('messageWait', {messageWait:localStorage.getObject('gameSettings').messageWait});
    }
});

var retrieveTimer;

function requestStatusReply() {
    clearTimeout(retrieveTimer);
    clearTimeout(emergencyStop);
    emergencyStop = setInterval(
    function() {
        updateTheDateTime()
    },60000);
    var timerSet = 4000;
    if (firstRun == 1) {
        timerSet = 200;
        introScreen();
    }
    retrieveTimer = setTimeout(function() {
       var lastUpdate = localStorage.getObject('gameSettings').lastUpdate;
       var firstLoadTime = 0
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
        firstRun = 0;
    }, timerSet);
}

socket.on('playerReceived', function() {
    connected = 1;
    $('#reconnect').fadeOut();
});

function introScreen() {
    
}

socket.on('receivedChoice', function(data) {
    console.log(timestampify()+'Received a choice');
    console.log(data);
    gameUpdate.removeReturn(data.choiceId);
});

socket.on('updateData', function(updateData) {
    console.log(timestampify()+'Backlog received');
    console.log(updateData);
    if (updateData['message'].length > 0) {
        $.each(updateData['message'], function(index,value) {
            processMessage(value,1);
        });
    };
    if (updateData['feed'].length > 0) {
        $.each(updateData['feed'], function(index,value) {
            processFeed(value,1);
        });
    }
    if (updateData['comment'].length > 0) {
        $.each(updateData['comment'], function(index,value) {
            processComment(value,1);
        });
    }
    hideLoad();
});

socket.on('hideLoad', function() {
    hideLoad();
})

function hideLoad() {
     $('#loadingLine').hide();
    $('#leftLoad').css('left','-50%');
    $('#rightLoad').css('right','-50%');
    setTimeout(function() {
        $('#loadingSection').fadeOut();
    },1000);
}

socket.on('newMessage', function(receivedMessages) {
    console.log(timestampify()+'PING - New message');
    console.log(receivedMessages);
    processMessage(receivedMessages,receivedMessages.noNote);
    gameUpdate.updateTime(80);
    setTimeout(function(){
        requestStatusReply();
    },20000);
});

function processMessage(receivedMessages,nonote) {
    if (receivedMessages.fromChoice  != undefined && receivedMessages.fromChoice != 'NA') {
        gameUpdate.removeReturn(receivedMessages.fromChoice);
    }
    console.log(timestampify()+'New message with a nonote value of '+nonote);
    console.log(receivedMessages);
    var messageGroup = [];
    var updatePause;
    function process() {
        gameUpdate.updateTime(300);
        $.each(receivedMessages.messageItem.messages, function(index,value) {
            console.log(timestampify()+'Reading through');
            console.log(value);
            var incomingMessage =  new message(value.fromId,value.toId,value.timestamp,value.message,value.image,value.video,deviceData['type'],value.msgId);
            messageGroup.push(incomingMessage);
            //gameUpdate.updateLocal(incomingMessage,'messages');
        });
        /*if (receivedMessages.choices && receivedMessages.choices != '') {
            console.log(timestampify()+'Message answers!');
            console.log(receivedMessages.choices);
            var newChoice = new choice(receivedMessages.choices.choiceId,receivedMessages.choices.choice1,receivedMessages.choices.choice2,receivedMessages.choices.choice3);
            var currentComment = new comment(0,0,'CHOICE',newChoice,'','',0);
            messageGroup.push(currentComment);
        }*/
        if (receivedMessages.messageItem.autoTarget == 'message') {
            var nextMsg = receivedMessages.messageItem.autoId;
        } else {
            var nextMsg = 0;
        }
        messages.packed(messageGroup,receivedMessages.choices,nonote,nextMsg);
        //messages.new(message.userId,message.timestamp,message.message,typingTime);
        gameUpdate.updateMessages(receivedMessages.messageItem.messageId);
    }
    if (updating == 1) {
        while (updating == 1) {
            clearTimeout(updatePause);
            updatePause = setTimeout(function() {
                process();
            },3000);
        }
    } else {
        process();
    }
}

socket.on('newFeed', function(receivedFeed) {
    processFeed(receivedFeed,receivedFeed.noNote);
    gameUpdate.updateTime(80);
    setTimeout(function(){
        requestStatusReply();
    },20000);
});

function processFeed(receivedFeed,nonote) {
    gameUpdate.updateFeed(receivedFeed.feedItem.postId);
    console.log(timestampify()+'new feed item retrieved');
    console.log(receivedFeed);
    function process() {
        var commentBuilder = [];
        gameUpdate.updateTime(300);
        var dac = 0
        if (receivedFeed.comments && receivedFeed.comments.comments != '') {
            $.each(receivedFeed.comments.comments, function(index, value) {
                var currentComment = new comment(value['order'],value['user'],createTimestamp(value['date'],receivedFeed.queueDay),value['text'],value['image'],value['video'],value['likes']);
                commentBuilder.push(currentComment);
                dac += 4;
            });
        }
        if (receivedFeed.choices && receivedFeed.choices != '') {
            var newChoice = new choice(receivedFeed.choices.choiceId,receivedFeed.choices.choice1,receivedFeed.choices.choice2,receivedFeed.choices.choice3);
            var currentComment = new comment(0,0,'CHOICE',newChoice,'','',0);
            commentBuilder.push(currentComment);
        }
        var currentFeed = new post(receivedFeed.feedItem.postId,receivedFeed.feedItem.fromId,createTimestamp(receivedFeed.feedItem['date'],receivedFeed.queueDay),receivedFeed.feedItem.text,receivedFeed.feedItem.image,receivedFeed.feedItem.video,receivedFeed.feedItem.likes,commentBuilder,0,receivedFeed.feedItem.caption);
        gameUpdate.updateLocal(currentFeed,'posts');
        if ($(document).find("title").text() == 'Twaddle - A social media for the everyman') {
            if (nonote == 1) {
                feed.backlog(currentFeed);
            } else {
                var tempFeed = [];
                tempFeed.push(currentFeed);
                feed.create('feedContent',tempFeed,0);
            }
        }
    }
    var updatePause;
    if (updating == 1) {
        while (updating == 1) {
            clearTimeout(updatePause);
            updatePause = setTimeout(function() {
            process();
            },3000);
        }
    } else {
        process();
    }
}

socket.on('newComment', function(receivedFeed) {
    console.log(timestampify()+'New comment');
    console.log(receivedFeed);
    processComment(receivedFeed,receivedFeed.noNote);
    gameUpdate.updateTime(80);
    setTimeout(function(){
        requestStatusReply();
    },20000);
});

function processComment(receivedComment,nonote) {
    if (receivedComment.fromChoice != undefined && receivedComment.fromChoice != 'NA') {
        gameUpdate.removeReturn(receivedComment.fromChoice);
    }
    console.log(receivedComment);
    gameUpdate.updateComment(receivedComment.comment.commentId);
    if (nonote == 1) {
        var now = createTimestamp(receivedComment.comment.comments[0].date,receivedComment.queueDay)
    } else {
        var later = createTimestamp(receivedComment.comment.comments[0].date,receivedComment.queueDay)
        var now = Math.floor(Date.now() / 1000);
        if ((now - later) > 960) {
            now = later;
        }
    }
    var tempComments = [];
    $.each(receivedComment.comment.comments, function(index, value) {
        var currentComment = new comment(value['order'],value['user'],now,value['text'],value['image'],value['video'],value['likes']);
        tempComments.push(currentComment);
    });
    if (receivedComment.choices && receivedComment.choices != '') {
        var newChoice = new choice(receivedComment.choices.choiceId,receivedComment.choices.choice1,receivedComment.choices.choice2,receivedComment.choices.choice3);
        var currentComment = new comment(0,0,'CHOICE',newChoice,'','',0);
        tempComments.push(currentComment);
    }

    var tempData = localStorage.getObject('gameData');
    var aim = 0;
    $.each(tempData.posts, function(index, value) {
        if (value.postId == receivedComment.comment.feedId) {
            aim = index;
        }
    });
    console.log(timestampify()+'Applying to '+aim);
    $.each(tempComments, function(index, value) {
        if (tempData.posts[aim].comments == 0) {
            tempData.posts[aim].comments = [];
        }
        console.log(tempData.posts[aim]);
        tempData.posts[aim].comments.push(value);
    });
    localStorage.setObject('gameData',tempData);
    if (nonote == 1) {
        var tempAppend = feed.commentBuilder(tempComments,receivedComment.comment.feedId,1);
        $('#comments_'+receivedComment.comment.feedId).append(tempAppend);
        if (receivedComment.choices && receivedComment.choices != '') {
            feed.createComment(receivedComment.comment.feedId, receivedComment.choices);   
        }
    } else {
        feed.commentPoster(tempComments,receivedComment.comment.feedId)
    }
}

var choiceTimeout = [];

function emitChoice(choiceId,choiceMade) {
    if (choiceTimeout[choiceId] != undefined) {
        clearTimeout(choiceTimeout[choiceId]);
    }
    if (!socket.connected) {
        connected = 0;
        $('#reconnect').fadeIn();
        socket.reconnect();
    }
    if (connected == 1) {
        socket.emit('choiceMade', {playerName:playerName,currentTime:new Date(),timezone:localStorage.getObject('gameSettings').timezone,choiceId:choiceId,choiceMade:choiceMade});
    } else {
        console.log(timestampify()+'Not connected during emit function');
        choiceTimeout[choiceId] = setTimeout(function() {emitChoice(choiceId,choiceMade);},500);
    }
}

var afaTimeout = [];

function askForAnother(nextOne) {
    if (afaTimeout[nextOne] != undefined) {
        clearTimeout(afaTimeout[nextOne]);
    }
    if (!socket.connected) {
        connected = 0;
        $('#reconnect').fadeIn();
        socket.reconnect();
    }
    if (connected == 1) {
        socket.emit('anotherMessage', {playerName:playerName,currentTime:new Date(),timezone:localStorage.getObject('gameSettings').timezone,nextId:nextOne});
    } else {
        console.log(timestampify()+'Not connected during emit function');
        afaTimeout[nextOne] = setTimeout(function() {askForAnother(nextOne);},500);
    }
}

var emitTimeout;

function emitReg() {
    clearTimeout(emitTimeout);
    if (!socket.connected) {
        connected = 0;
        $('#reconnect').fadeIn();
        socket.reconnect();
    }
    if (connected == 1) {
        socket.emit('deviceReg', {playerName:playerName,currentTime:new Date(),device:deviceData});   
    } else {
        console.log(timestampify()+'Not connected during emit function');
        emitTimeout = setTimeout(function() {emitReg;},500);
    }
}

if (mobNotifications == 1) {
    console.log('Binding resume event');
    document.addEventListener('resume',onResume, false);
    document.addEventListener('pause',onPause, false);
    
    function onResume() {
        console.log('Resuming');
        updateTheDateTime();
    }
    
    function onPause() {
        console.log('Application paused');
    }
}
