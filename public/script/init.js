/*

               global comment
               global post
               global trending
               global message
               global user

            */
            
var firstRun = 1;            
            
var rebootIfError = setTimeout(function() {
    window.localStorage.clear();
    window.location.replace("index.html?connection=error");    
},20000);


socket.on('requestStatus', function() {
    clearTimeout(rebootIfError);
    requestStatusReply();
});

var retrieveTimer;

function requestStatusReply() {
    clearTimeout(retrieveTimer);
    var timerSet = 4000;
    if (firstRun == 1) {
        timerSet = 0;
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
            timezone:localStorage.getObject('gameSettings').timezone,
            lastFeed:localStorage.getObject('gameSettings').lastFeed,
            lastMessage:localStorage.getObject('gameSettings').lastMessage,
            lastComment:localStorage.getObject('gameSettings').lastComment,
            firstLoad:firstLoadTime,
            firstRun:firstRun
        });
        firstRun = 0;
    }, timerSet);
}

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
        $('#loadingSection').hide();
    },1000);
}

socket.on('newMessage', function(receivedMessages) {
    console.log(timestampify()+'PING - New message');
    processMessage(receivedMessages,receivedMessages.noNote);
    gameUpdate.updateTime(80);
    setTimeout(function(){
        requestStatusReply();
    },20000);
});

function processMessage(receivedMessages,nonote) {
    gameUpdate.updateMessages(receivedMessages.messageItem.messageId);
    console.log(timestampify()+'New message with a nonote value of '+nonote);
    console.log(receivedMessages);
    var messageGroup = [];
    var updatePause;
    function process() {
        gameUpdate.updateTime(300);
        $.each(receivedMessages.messageItem.messages, function(index,value) {
            console.log(timestampify()+'Reading through');
            console.log(value);
            var incomingMessage =  new message(value.fromId,value.toId,value.timestamp,value.message,value.image,value.video,value.from,value.msgId);
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
                var currentComment = new comment(value['order'],value['user'],createTimestamp(value['date']),value['text'],value['image'],value['video'],value['likes']);
                commentBuilder.push(currentComment);
                dac += 4;
            });
        }
        if (receivedFeed.choices && receivedFeed.choices != '') {
            var newChoice = new choice(receivedFeed.choices.choiceId,receivedFeed.choices.choice1,receivedFeed.choices.choice2,receivedFeed.choices.choice3);
            var currentComment = new comment(0,0,'CHOICE',newChoice,'','',0);
            commentBuilder.push(currentComment);
        }
        var currentFeed = new post(receivedFeed.feedItem.postId,receivedFeed.feedItem.fromId,createTimestamp(receivedFeed.feedItem['date']),receivedFeed.feedItem.text,receivedFeed.feedItem.image,receivedFeed.feedItem.video,receivedFeed.feedItem.likes,commentBuilder,0,receivedFeed.feedItem.caption);
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
    console.log(receivedComment);
    gameUpdate.updateComment(receivedComment.comment.commentId);
    if (nonote == 1) {
        var now = createTimestamp(receivedComment.comment.comments[0].date)
    } else {
        var now = Math.floor(Date.now() / 1000);
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

function emitChoice(choiceId,choiceMade) {
    socket.emit('choiceMade', {playerName:playerName,currentTime:new Date(),timezone:localStorage.getObject('gameSettings').timezone,choiceId:choiceId,choiceMade:choiceMade});
}

function askForAnother(nextOne) {
    socket.emit('anotherMessage', {playerName:playerName,currentTime:new Date(),timezone:localStorage.getObject('gameSettings').timezone,nextId:nextOne});
}