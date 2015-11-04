/* 
            
               global comment
               global post
               global trending
               global message
               global user
               
            */

socket.on('requestStatus', function() {
    requestStatusReply();  
});      

function requestStatusReply() {
   var lastUpdate = localStorage.getObject('gameSettings').lastUpdate;
    if (localStorage.getObject('gameSettings').firstLoad == 1) {
        console.log('omg first load');
        lastUpdate = 1440;
        var tempData = localStorage.getObject('gameSettings');
        tempData.firstLoad = 0;
        localStorage.setObject('gameSettings',tempData);
    }
    console.log('Retrieving data');
    socket.emit('pageLoad', {
        page:$(document).find("title").text(),
        playerName:playerName,
        startTime:localStorage.getObject('gameSettings').startTime,
        lastUpdate:lastUpdate,
        currentTime:new Date(),
        timezone:localStorage.getObject('gameSettings').timezone,
        lastFeed:localStorage.getObject('gameSettings').lastFeed,
        lastMessage:localStorage.getObject('gameSettings').lastMessage,
    });   
}

socket.on('updateData', function(updateData) {
    console.log('Backlog received');
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
    $('#loadingLine').hide();
    $('#leftLoad').css('left','-50%');
    $('#rightLoad').css('right','-50%');
    setTimeout(function() {
        $('#loadingSection').hide();
    },1000)
});

socket.on('newMessage', function(receivedMessages) {
    processMessage(receivedMessages,0);
    gameUpdate.updateTime(80);
    setTimeout(function(){
        requestStatusReply();
    },10000);
});

function processMessage(receivedMessages,nonote) {
    console.log('New message!');
    console.log(receivedMessages);
    var messageGroup = [];
    var updatePause;
    function process() {
        gameUpdate.updateTime(80);
        $.each(receivedMessages.messageItem.messages, function(index,value) {
            console.log('Reading through');
            console.log(value);
            var incomingMessage =  new message(value.fromId,value.toId,value.timestamp,value.message,value.image,value.video,value.from,value.msgId);
            messageGroup.push(incomingMessage);
            //gameUpdate.updateLocal(incomingMessage,'messages');
        });
        messages.packed(messageGroup,receivedMessages.messageItem.choices,nonote);
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
    processFeed(receivedFeed,0);
    gameUpdate.updateTime(80);
    setTimeout(function(){
        requestStatusReply();
    },10000);
});

function processFeed(receivedFeed,nonote) {
    console.log('new feed item retrieved');
    console.log(receivedFeed);
    function process() {
        var commentBuilder = [];
        gameUpdate.updateTime(80);
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
        var currentFeed = new post(receivedFeed.feedItem.postId,receivedFeed.feedItem.fromId,createTimestamp(receivedFeed.feedItem['date']),receivedFeed.feedItem.text,receivedFeed.feedItem.image,receivedFeed.feedItem.video,receivedFeed.feedItem.likes,commentBuilder,0);
        gameUpdate.updateLocal(currentFeed,'posts');
        if (nonote == 1) {
            feed.backlog(currentFeed);
        } else {
            feed.create('feedContent',currentFeed,0);
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
    processComment(receivedFeed,0);
    gameUpdate.updateTime(80);
    setTimeout(function(){
        requestStatusReply();
    },10000);
});

function processComment(receivedComment,nonote) {
        console.log(receivedComment);
        if (nonote == 1) {
            var now = createTimestamp(value['date'])
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
        $.each(tempComments, function(index, value) {
            tempData.posts[aim].comments.push(value);    
        });
        localStorage.setObject('gameData',tempData);
        if (nonote == 1) {
            feed.commentBuilder(tempComments,receivedComment.comment.feedId) 
        } else {
            feed.commentPoster(tempComments,receivedComment.comment.feedId) 
        }
}

function emitChoice(choiceId,choiceMade) {
    socket.emit('choiceMade', {playerName:playerName,currentTime:new Date(),timezone:localStorage.getObject('gameSettings').timezone,choiceId:choiceId,choiceMade:choiceMade});    
}