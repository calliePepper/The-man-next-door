/*

 ______   _______  _______ _________ _______    _______           _        _______ __________________ _______  _        _______ 
(  ___ \ (  ___  )(  ____ \\__   __/(  ____ \  (  ____ \|\     /|( (    /|(  ____ \\__   __/\__   __/(  ___  )( (    /|(  ____ \
| (   ) )| (   ) || (    \/   ) (   | (    \/  | (    \/| )   ( ||  \  ( || (    \/   ) (      ) (   | (   ) ||  \  ( || (    \/
| (__/ / | (___) || (_____    | |   | |        | (__    | |   | ||   \ | || |         | |      | |   | |   | ||   \ | || (_____ 
|  __ (  |  ___  |(_____  )   | |   | |        |  __)   | |   | || (\ \) || |         | |      | |   | |   | || (\ \) |(_____  )
| (  \ \ | (   ) |      ) |   | |   | |        | (      | |   | || | \   || |         | |      | |   | |   | || | \   |      ) |
| )___) )| )   ( |/\____) |___) (___| (____/\  | )      | (___) || )  \  || (____/\   | |   ___) (___| (___) || )  \  |/\____) |
|/ \___/ |/     \|\_______)\_______/(_______/  |/       (_______)|/    )_)(_______/   )_(   \_______/(_______)|/    )_)\_______)
                                                                                                                                
                                                                                                                                
*/

var currentlyViewing = 0;
var socket = io('https://the-man-next-door-soldevifae.c9.io');
var updating = 0;

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

if (localStorage.getObject('gameSettings') == undefined || localStorage.getObject('gameSettings').name == undefined || localStorage.getObject('gameSettings').startTime == undefined || localStorage.getObject('gameSettings').lastUpdate == undefined || localStorage.getObject('gameSettings').timezone == undefined) {
    window.location.replace('index.html');
} 

var playerName = localStorage.getObject('gameSettings').name;

var gameUpdate = {};

gameUpdate.updateTime = function(varTime) {
    if (varTime == undefined) {varTime = 0;}
    var currentTime = Math.floor(Date.now() / 1000 + varTime);
    var tempData = localStorage.getObject('gameSettings');
    tempData.lastUpdate = new Date();
    localStorage.setObject('gameSettings',tempData);
}

gameUpdate.updateFeed = function(feedId) {
    var tempData = localStorage.getObject('gameSettings');
    if (tempData.lastFeed < feedId) {
        tempData.lastFeed = feedId;
    }
    localStorage.setObject('gameSettings',tempData);
}

gameUpdate.updateMessages = function(messageId) {
    var tempData = localStorage.getObject('gameSettings');
    if (tempData.lastMessage < messageId) {
        tempData.lastMessage = messageId;
    }
    localStorage.setObject('gameSettings',tempData);
}

gameUpdate.updateComment = function(commentId) {
    var tempData = localStorage.getObject('gameSettings');
    if (tempData.lastComment < commentId) {
        tempData.lastComment = commentId;
    }
    localStorage.setObject('gameSettings',tempData);
}

gameUpdate.updateNotifications = function(type,clear) {
    if (clear == '1') {
        var newNumber = 0;
    } else {
        var newNumber = localStorage.getObject('gameSettings').unread[type] + 1;
    }
    var tempData = localStorage.getObject('gameSettings');
    tempData.unread[type] = newNumber;
    localStorage.setObject('gameSettings',tempData);
}

gameUpdate.updateLocal = function(data,dataType,extraData,choiceId) {
    updating = 1;
    //console.log(timestampify()+'Have hit the update section. dataType is '+dataType+'. Data is '+data);
    var tempStorage = localStorage.getObject('gameData');
    if (dataType == 'comment') {
        var lookup = {};
        for (var i = 0, len = tempStorage['posts'].length; i < len; i++) {
            lookup[tempStorage['posts'][i].postId] = i;
        }
        tempStorage['posts'][lookup[extraData]].comments.push(data);
        localStorage.setObject('gameData',tempStorage);
    } else if (dataType == 'choice') {
        var cameFrom = extraData.split('_');
        if (cameFrom[0] == 'message') {
            
        } else {
            var lookup = {};
            for (var i = 0, len = tempStorage['posts'].length; i < len; i++) {
                lookup[tempStorage['posts'][i].postId] = i;
            }
            //console.log(cameFrom[1]);
            tempStorage['posts'][lookup[cameFrom[1]]].commented = 1;
        }
        localStorage.setObject('gameData',tempStorage);
    } else if (dataType == 'liked') {
        var lookup = {};
        for (var i = 0, len = tempStorage['posts'].length; i < len; i++) {
            lookup[tempStorage['posts'][i].postId] = i;
        }
        tempStorage['posts'][lookup[extraData]].liked = 1;
        tempStorage['posts'][lookup[extraData]].likes += 1;
        localStorage.setObject('gameData',tempStorage);
    } else if (dataType == 'messages') {
        tempStorage['messages'].push(data);
        localStorage.setObject('gameData',tempStorage);
        
    } else if (dataType == 'posts') {
        tempStorage['posts'].push(data);
        localStorage.setObject('gameData',tempStorage);
        gameUpdate.updateFeed(data.postId);
    }
    updating = 0;
}

/*

 _______           _______ _________ _______  _______  _______ 
(  ____ \|\     /|(  ___  )\__   __/(  ____ \(  ____ \(  ____ \
| (    \/| )   ( || (   ) |   ) (   | (    \/| (    \/| (    \/
| |      | (___) || |   | |   | |   | |      | (__    | (_____ 
| |      |  ___  || |   | |   | |   | |      |  __)   (_____  )
| |      | (   ) || |   | |   | |   | |      | (            ) |
| (____/\| )   ( || (___) |___) (___| (____/\| (____/\/\____) |
(_______/|/     \|(_______)\_______/(_______/(_______/\_______)
                                                               

*/

var choiceControls = {};

choiceControls.create = function(choiceId,target,targetType,remove,choice1,choice2,choice3) {
    $('.choice').unbind();
    var choiceString = '';
    if (choice1!=0) {choiceString += '<div id="choice1" class="choice btn">'+choice1+'</div>';}
    if (choice2!=0) {choiceString += '<div id="choice2" class="choice btn">'+choice2+'</div>';}
    if (choice3!=0) {choiceString += '<div id="choice3" class="choice btn">'+choice3+'</div>';}
    $('#'+target).append('<div id="choiceBlock_'+choiceId+'" class="choiceBlock">'+choiceString+'</div>');
    $('#choiceBlock').css('max-height','300px');
    if ($('#messagesCont').length > 0) {
        var objDiv = document.getElementById("messagesCont");objDiv.scrollTop = objDiv.scrollHeight;
    }
    $('.choice').on('click touch', function() {
        if (remove != '') {
            $('#'+remove).removeClass('choiceBeing').addClass('commented');
        }
        choiceControls.choose(choiceId,$(this).attr('id'),targetType);
    });
}

choiceControls.choose = function(id,choice,targetType) {
    var theChoice = $('#'+choice).html();
    var additionalTarget = '';
    if (targetType == 'comment') {
        commentsString = '';
        //commentsString = '<div class="comments">';
        var commentSince = time.wordify(Math.floor(Date.now() / 1000));
        var now = Math.floor(Date.now() / 1000);
        var usersAvatar = localStorage.getObject('gameData')['users'][0]['avatar'];
        var usersFirstname = localStorage.getObject('gameData')['users'][0]['firstname'];
        var usersLastname = localStorage.getObject('gameData')['users'][0]['lastname'];
        var imageComments = '';
        var likedComments = '';
        commentsString += '<div class="comment"><div class="commentAvatar"><img class="avatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><span class="commentBy">'+usersFirstname+'</span><span class="commentContent">'+theChoice+'</span>'+imageComments+'<div class="commentFooter dateUpdate" data-date="'+now+'">'+commentSince+'</div></div>';
        //commentsString += '</div>';
        var choiceMade = choice.replace('choice','');
        var commentTarg = $('#choiceBlock_'+id).parent().find('.comments').attr('id').split('_')[1];
        $('#choiceBlock_'+id).parent().find('.comments').append(commentsString);
        $('#choiceBlock_'+id).remove();
        additionalTarget = id;
        var newComment = new comment('',0,now,theChoice,'','',0);
        //console.log(timestampify()+'Submitting comment data. '+newComment+ '. '+commentTarg);
        gameUpdate.updateLocal(newComment,'comment',commentTarg);
        //console.log(timestampify()+'Submitting choice data. '+choiceMade+ '. '+commentTarg);
        gameUpdate.updateLocal(choiceMade,'choice','comment_'+commentTarg,id);
    } else if (targetType == 'message') {
        var tempStorage = localStorage.getObject('gameData');
        tempStorage.messages.pop();
        localStorage.setObject('gameData',tempStorage);
        var date = time.date(Math.floor(Date.now() / 1000));
        var usersAvatar = localStorage.getObject('gameData')['users'][0]['avatar'];
        var usersFirstname = localStorage.getObject('gameData')['users'][0]['firstname'];
        var usersLastname = localStorage.getObject('gameData')['users'][0]['lastname'];
        var imageLink = '';
        var choiceMade = choice.replace('choice','');
        var newMessage = new message(0,currentlyViewing,Math.floor(Date.now() / 1000),theChoice,'','',1);
        var commentTarg = currentlyViewing;
        var fromText = '<i class="fa fa-desktop"></i><span class="sentFrom">Sent from desktop</span>';
        //if (value['from'] == 1){var fromText = '<i class="fa fa-mobile"></i><span class="sentFrom">Sent from mobile</span>';} else {var fromText = '<i class="fa fa-desktop"></i><span class="sentFrom">Sent from desktop</span>';}
        $('#messagesCont').append('<div class="messageCont"><img class="messageAvatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /><div class="sentOn">'+fromText+date+'</div><div class="messageName">'+usersFirstname+'</div><div class="messageContents">'+theChoice+'</div></div>');
        var objDiv = document.getElementById("messagesCont");objDiv.scrollTop = objDiv.scrollHeight;
        $('#choiceBlock_'+id).remove();
        gameUpdate.updateLocal(newMessage,'messages');
        gameUpdate.updateLocal(choiceMade,'choice','message_'+commentTarg,id);
    }
    emitChoice(id,choice.replace('choice',''),additionalTarget);
}

/*

          _______  _______  _______  _______ 
|\     /|(  ____ \(  ____ \(  ____ )(  ____ \
| )   ( || (    \/| (    \/| (    )|| (    \/
| |   | || (_____ | (__    | (____)|| (_____ 
| |   | |(_____  )|  __)   |     __)(_____  )
| |   | |      ) || (      | (\ (         ) |
| (___) |/\____) || (____/\| ) \ \__/\____) |
(_______)\_______)(_______/|/   \__/\_______)
                                 

*/

var users = {}

users.load = function() {
    console.log(timestampify()+'loading users');
    $.each(localStorage.getObject('gameData')['users'], function(index, value) {
        if (index != 0 && value['friended'] == 1) {
            var isCurrent ='';
            if ($(document).find("title").text() == value['firstname'] + ' ' + value['lastname']) {
                isCurrent = 'current';
            }
            $('#friendContainer').append('<a id="'+value['firstname']+'" class="friend sideLink '+isCurrent+'"><img src="'+value['avatar']+'" class="navAvatar mobile" alt="Navigation avatar" /><i id="userIcon" class="desktop fa fa-user"></i>'+value['firstname']+' '+value['lastname']+'</a>');    
        }
    });
}

/*

 _______  _______  _______  _______  _______  _______  _______  _______ 
(       )(  ____ \(  ____ \(  ____ \(  ___  )(  ____ \(  ____ \(  ____ \
| () () || (    \/| (    \/| (    \/| (   ) || (    \/| (    \/| (    \/
| || || || (__    | (_____ | (_____ | (___) || |      | (__    | (_____ 
| |(_)| ||  __)   (_____  )(_____  )|  ___  || | ____ |  __)   (_____  )
| |   | || (            ) |      ) || (   ) || | \_  )| (            ) |
| )   ( || (____/\/\____) |/\____) || )   ( || (___) || (____/\/\____) |
|/     \|(_______/\_______)\_______)|/     \|(_______)(_______/\_______)
                                                            

*/

var messages = {}

messages.init = function() {
    var firstMessages = {};
    var orderedUsers = [];
    var thisUser = '';
    var firstUser = 0;
    var firstMessage = 0;
    $.each(localStorage.getObject('gameData')['messages'], function(index,value) {
        if (value['date'] != 'CHOICE') {
            if (typeof firstMessages[value['toId']]  === 'undefined'){
                firstMessages[value['toId']] = {};
                firstMessages[value['toId']].index = value['toId'];
                firstMessages[value['toId']].posted = 0;
            }
            if (value['date'] > firstMessages[value['toId']].posted) {
                firstMessages[value['toId']].posted = value['date'];
                firstMessages[value['toId']].dateTime = time.minidate(value['date']);
                firstMessages[value['toId']].text = value['text'];
            }
            if (value['date'] > firstMessage) {
                firstMessage = value['date'];
                firstUser = index;
            }
        }
    });
    $.each(firstMessages, function(index,value) {
         orderedUsers.push(value);
    });
    function compare(a,b) {
      if (a.posted > b.posted)
        return -1;
      if (a.posted < b.posted)
        return 1;
      return 0;
    }
    orderedUsers.sort(compare);
    messages.users(orderedUsers);
    messages.load(orderedUsers[0].index);
    //console.log(orderedUsers);
}

messages.load = function(id) {
    $('#messagesCont').html('');
    var firstMessages = {};
    var thisUser = '';
    currentlyViewing = id;
    $.each(localStorage.getObject('gameData')['messages'], function(index,value) {
        if (value['toId'] == id) {
            //console.log(Object.keys(value).length);
            if (value.date == 'CHOICE') {
                console.log(timestampify()+'Building a choice');
                choiceControls.create(value.text.choiceId,'messagesCont','message','',value.text.choice1,value.text.choice2,value.text.choice3);                
            } else {
                var usersAvatar = localStorage.getObject('gameData')['users'][value['fromId']]['avatar'];
                var usersFirstname = localStorage.getObject('gameData')['users'][value['fromId']]['firstname'];
                var usersLastname = localStorage.getObject('gameData')['users'][value['fromId']]['lastname'];
                thisUser = usersFirstname + ' ' + usersLastname;
                var date = time.date(value['date']);
                var videoLink = '';
                if (value['video'] != '' && value['video'] != undefined) {
                    videoLink = '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+value['video']+'" frameborder="0" allowfullscreen></iframe>';
                }
                var imageLink = '';
                if (value['image'] != '' && value['image'] != undefined) {
                    imageLink = '<img src="img/'+value['image']+'" alt="user image" class="feedImage" />';
                }
                if (value['from'] == 1){var fromText = '<i class="fa fa-mobile"></i><span class="sentFrom">Sent from mobile</span>';} else {var fromText = '<i class="fa fa-desktop"></i><span class="sentFrom">Sent from desktop</span>';}
                $('#messagesCont').append('<div class="messageCont"><img class="messageAvatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /><div class="sentOn" data-date="'+value['date']+'">'+fromText+date+'</div><div class="messageName">'+usersFirstname+' '+usersLastname+'</div><div class="messageContents">'+value['text']+'</div>'+videoLink+imageLink+'</div>');
                var objDiv = document.getElementById("messagesCont");objDiv.scrollTop = objDiv.scrollHeight;
            }
        }
    });
    $('#messagesCont').prepend('<div class="messagesStart">Conversation started</div>');
    $('.messageTitle').html('&lt; '+thisUser);
    var objDiv = document.getElementById("messagesCont");objDiv.scrollTop = objDiv.scrollHeight;
}

messages.create = function(userId,time,content,image,from) {
    return new message(userId,time,content,image,from);
}

messages.users = function(firstMessages) {
     $('#messageList').html('');
     var counter = 1;
     $.each(firstMessages, function(index,value) {
        var usersAvatar = localStorage.getObject('gameData')['users'][value['index']]['avatar'];
        var usersFirstname = localStorage.getObject('gameData')['users'][value['index']]['firstname'];
        var usersLastname = localStorage.getObject('gameData')['users'][value['index']]['lastname'];
        if(value['text'].length > 15) value['text'] = value['text'].substring(0,15) + '...';
        $('#messageList').append('<div class="messageUserList" id="messageLink_'+value['index']+'"><img class="messageAvatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /><div class="sentOn">'+value['dateTime']+'</div><div class="messageName">'+usersFirstname+' '+usersLastname+'</div><div class="messageContents">'+value['text']+'</div></div>');
        if (counter == 1) {
            $('#messageLink_'+value['index']).addClass('current');
            counter++;
        }
    });
    var mq = window.matchMedia('screen and (max-width:900px)');
        if(mq.matches) {
            $('.messageUserList').off();
            $('.messageUserList').on('click touch', function() {
                var userId = $(this).attr('id').split('_')[1];
                messages.load(userId);
                $('.messageList').toggleClass('flipped');
                $('.messages').toggleClass('flipped');
                var objDiv = document.getElementById("messagesCont");objDiv.scrollTop = objDiv.scrollHeight;
            });
            $('.messageTitle').off();
            $('.messageTitle').on('click touch', function() {
                $('.messageList').toggleClass('flipped');
                $('.messages').toggleClass('flipped');
            });
        } else {
            $('.messageUserList').on('click touch', function() {
                if ($(this).hasClass('current')) {
                    
                } else {
                    var userId = $(this).attr('id').split('_')[1];
                    messages.load(userId);
                    $('.messageUserList').removeClass('current');
                    $(this).addClass('current');
                    var objDiv = document.getElementById("messagesCont");objDiv.scrollTop = objDiv.scrollHeight;
                }
            });
        }
}

var messageQueue = [];

messages.new = [];

messages.new.currentMsg = function(messageFrom,messageTo,cameIn,text,ttw,fullMessage) {
    $('#messagesCont').append('<div id="typing" class="typing">'+localStorage.getObject('gameData').users[messageFrom].firstname+' is typing...</div>');
    var objDiv = document.getElementById("messagesCont");objDiv.scrollTop = objDiv.scrollHeight;
    var notificationNoise = new Audio("../sounds/tapNote.mp3");
    console.log(timestampify()+'New message from '+localStorage.getObject('gameData').users[messageFrom].firstname+' at '+cameIn);
    setTimeout(function() {
        var thisUser = '';
        $('#typing').remove();
        if (currentlyViewing == messageFrom) {
            var usersAvatar = localStorage.getObject('gameData')['users'][fullMessage['fromId']]['avatar'];
            var usersFirstname = localStorage.getObject('gameData')['users'][fullMessage['fromId']]['firstname'];
            var usersLastname = localStorage.getObject('gameData')['users'][fullMessage['fromId']]['lastname'];
            thisUser = usersFirstname + ' ' + usersLastname;
            var date = time.date(fullMessage['date']);
            var videoLink = '';
            if (fullMessage['video'] != '' && fullMessage['video'] != undefined) {
                videoLink = '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+fullMessage['video']+'" frameborder="0" allowfullscreen></iframe>';
            }
            var imageLink = '';
            if (fullMessage['image'] != '') {
                imageLink = '<img src="img/'+fullMessage['image']+'" alt="user image" class="feedImage" />';
            }
            if (fullMessage['from'] == 1){var fromText = '<i class="fa fa-mobile"></i><span class="sentFrom">Sent from mobile</span>';} else {var fromText = '<i class="fa fa-desktop"></i><span class="sentFrom">Sent from desktop</span>';}
            $('#messagesCont').append('<div class="messageCont"><img class="messageAvatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /><div class="sentOn">'+fromText+date+'</div><div class="messageName">'+usersFirstname+' '+usersLastname+'</div><div class="messageContents">'+fullMessage['text']+'</div>'+videoLink+imageLink+'</div>');
            var objDiv = document.getElementById("messagesCont");objDiv.scrollTop = objDiv.scrollHeight; 
        } else {
            notificationNoise.play();
        }
        if(text.length > 15) text = text.substring(0,15) + '...';
        var date = time.minidate(cameIn);
        $('#messageLink_'+messageFrom).find('.sentOn').html(date);
        $('#messageLink_'+messageFrom).find('.messageContents').html(text);
        $('#messageLink_'+messageFrom).addClass('pulse');
        setTimeout(function() {$('#messageLink_'+messageFrom).removeClass('pulse');},1000);
        if (!visibleChangeHandler()) {
            spawnNotification('You have a new message from '+localStorage.getObject('gameData').users[messageFrom].firstname,localStorage.getObject('gameData').users[messageFrom].avatar,'New Message');
        }
        fullMessage.date = Math.floor(Date.now() / 1000);
        gameUpdate.updateLocal(fullMessage,'messages');
    },ttw);
}

messages.new.notCurrentMsg = function(messageFrom,messageTo,cameIn,text,ttw,fullMessage) {
    var notificationNoise = new Audio("../sounds/tapNote.mp3");
    console.log(timestampify()+'New message from '+localStorage.getObject('gameData').users[messageFrom].firstname+' at '+cameIn);
    setTimeout(function() {
        if(text.length > 15) text = text.substring(0,15) + '...';
        var date = time.minidate(cameIn);
        $('#messageLink_'+messageFrom).find('.sentOn').html(date);
        $('#messageLink_'+messageFrom).find('.messageContents').html(text);
        $('#messageLink_'+messageFrom).addClass('pulse');
        notificationNoise.play();
        setTimeout(function() {$('#messageLink_'+messageFrom).removeClass('pulse');},1000);
        if (!visibleChangeHandler()) {
            spawnNotification('You have a new message from '+localStorage.getObject('gameData').users[messageFrom].firstname,localStorage.getObject('gameData').users[messageFrom].avatar,'New Message');
        }
        fullMessage.date = Math.floor(Date.now() / 1000);
        gameUpdate.updateLocal(fullMessage,'messages');
    },ttw);
}

messages.new.differentPage = function(messageFrom,messageTo,cameIn,text,ttw,fullMessage) {
    var notificationNoise = new Audio("../sounds/tapNote.mp3");
    console.log(timestampify()+'New message from '+localStorage.getObject('gameData').users[messageFrom].firstname+' at '+cameIn);
    notificationNoise.play();
    gameUpdate.updateNotifications('messages');
    localStorage.getObject('gameSettings').unread.messages
    $('#messagesLink').find('.totalNew').html(localStorage.getObject('gameSettings').unread.messages);
    fullMessage.date = Math.floor(Date.now() / 1000);
    gameUpdate.updateLocal(fullMessage,'messages');
}

messages.new.noNotification = function(messageFrom,messageTo,cameIn,text,ttw,fullMessage) {
    console.log(timestampify()+'New message with no notification from '+localStorage.getObject('gameData').users[messageFrom].firstname+' at '+cameIn);
    fullMessage.date = createTimestamp(fullMessage['date']);
    gameUpdate.updateLocal(fullMessage,'messages');

    gameUpdate.updateNotifications('messages');
    $('#messagesLink').find('.totalNew').html(localStorage.getObject('gameSettings').unread.messages);
}

messages.packed = function(messageArray,choices,noNote,nextOne) {
    var counter = 0;
    var userForMsg = 0;
    console.log(timestampify()+'Message pack');
    console.log(messageArray);
    function loopMessages() {
        var typingTime = messageArray[counter].text.length * localStorage.getObject('gameData')['users'][messageArray[counter].fromId]['typingSpeed'];
        var waitTime = localStorage.getObject('gameData')['users'][messageArray[counter].fromId]['waitTime'];
        console.log(timestampify()+'Looping through message of length '+messageArray[counter].text.length+' next message should send in '+typingTime+' with a noNote value of '+noNote);
        userForMsg = messageArray[counter].toId;
        if (noNote != undefined && noNote == 1) {
            //console.log(timestampify()+'Time for no notification!');
            messages.new.noNotification(messageArray[counter].fromId,messageArray[counter].toId,messageArray[counter].date,messageArray[counter].text,typingTime,messageArray[counter]);    
            typingTime = 100;
        } else {
            if ($(document).find("title").text() == 'Twaddle - Messages') {
                if (currentlyViewing == userForMsg) {
                    messages.new.currentMsg(messageArray[counter].fromId,messageArray[counter].toId,messageArray[counter].date,messageArray[counter].text,typingTime,messageArray[counter]);
                } else {
                    messages.new.notCurrentMsg(messageArray[counter].fromId,messageArray[counter].toId,messageArray[counter].date,messageArray[counter].text,typingTime,messageArray[counter]);         
                }            
            } else {
                messages.new.differentPage(messageArray[counter].fromId,messageArray[counter].toId,messageArray[counter].date,messageArray[counter].text,typingTime,messageArray[counter]);
            }
        }
        counter++;
        if (noNote == 1) {
            var timer = 0;
        } else {
            var timer = typingTime + waitTime;
        }
        if (messageArray[counter] != undefined) {
           setTimeout(function() {
                loopMessages();
           },timer);
        } else if (choices != undefined && choices != '') {
            console.log(timestampify()+'Yay a choice found');
            setTimeout(function() {
                var newChoice = new choice(choices.choiceId,choices.choice1,choices.choice2,choices.choice3)
                new choice(3,'Deal with the problem yourself','Ignore it, it will go away','Skin the cat. It\'s the only solution. Skin. The. Cat')
                if (currentlyViewing == userForMsg) {
                    choiceControls.create(choices.choiceId,'messagesCont','message','',choices.choice1,choices.choice2,choices.choice3);
                    var newMessage = new message(0,userForMsg,'CHOICE',newChoice,'','',1);
                    gameUpdate.updateLocal(newMessage,'messages');
                } else {
                    var newMessage = new message(0,userForMsg,'CHOICE',newChoice,'','',1);
                    gameUpdate.updateLocal(newMessage,'messages');
                }
            },timer);
        } else if (nextOne != 0) {
            setTimeout(function() {askForAnother(nextOne);},timer);
        }
    }
    loopMessages()
}

/*

__________________ _______  _______    _______  _______  _       _________ _______  _______  _        _        _______ 
\__   __/\__   __/(       )(  ____ \  (  ____ \(  ___  )( (    /|\__   __/(  ____ )(  ___  )( \      ( \      (  ____ \
   ) (      ) (   | () () || (    \/  | (    \/| (   ) ||  \  ( |   ) (   | (    )|| (   ) || (      | (      | (    \/
   | |      | |   | || || || (__      | |      | |   | ||   \ | |   | |   | (____)|| |   | || |      | |      | (_____ 
   | |      | |   | |(_)| ||  __)     | |      | |   | || (\ \) |   | |   |     __)| |   | || |      | |      (_____  )
   | |      | |   | |   | || (        | |      | |   | || | \   |   | |   | (\ (   | |   | || |      | |            ) |
   | |   ___) (___| )   ( || (____/\  | (____/\| (___) || )  \  |   | |   | ) \ \__| (___) || (____/\| (____/\/\____) |
   )_(   \_______/|/     \|(_______/  (_______/(_______)|/    )_)   )_(   |/   \__/(_______)(_______/(_______/\_______)
                                                                                                                       

*/

var time = {}

time.wordify = function(newTimes) {
    var currentTime = Math.floor(Date.now() / 1000);
    var difference = (currentTime - newTimes) / 60;
    if (difference < 60) {
        if (Math.floor(difference) == 1) {
            return Math.floor(difference)+' minute ago';
        } else {
            return Math.floor(difference)+' minutes ago';
        }
    } else if (difference / 60 < 24) {
        if (Math.floor(difference/60) == 1) {
            return Math.floor(difference/60)+' hour ago';
        } else {
            return Math.floor(difference/60)+' hours ago';
        }
    } else {
        if (Math.floor(difference/60/24) == 1) {
            return Math.floor(difference/60/24)+' day ago';   
        } else {
            return Math.floor(difference/60/24)+' days ago';
        }
    }
}

time.date = function(newTimes) {
    var date = new Date(newTimes*1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var date = date.getDate();
    return date+'/'+month+'/'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

time.minidate = function(newTimes) {
    var date = new Date(newTimes*1000);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var date = date.getDate();
    return date+'/'+month+'/'+year;
}

/*
 _______  _______  _______  ______     _______  _______  _       _________ _______  _______  _        _______ 
(  ____ \(  ____ \(  ____ \(  __  \   (  ____ \(  ___  )( (    /|\__   __/(  ____ )(  ___  )( \      (  ____ \
| (    \/| (    \/| (    \/| (  \  )  | (    \/| (   ) ||  \  ( |   ) (   | (    )|| (   ) || (      | (    \/
| (__    | (__    | (__    | |   ) |  | |      | |   | ||   \ | |   | |   | (____)|| |   | || |      | (_____ 
|  __)   |  __)   |  __)   | |   | |  | |      | |   | || (\ \) |   | |   |     __)| |   | || |      (_____  )
| (      | (      | (      | |   ) |  | |      | |   | || | \   |   | |   | (\ (   | |   | || |            ) |
| )      | (____/\| (____/\| (__/  )  | (____/\| (___) || )  \  |   | |   | ) \ \__| (___) || (____/\/\____) |
|/       (_______/(_______/(______/   (_______/(_______)|/    )_)   )_(   |/   \__/(_______)(_______/\_______)

*/

var feed = {};

feed.create = function(target,objects,processNormal) {
    console.log(objects);
    $.each(objects, function(index,value) {
        if (localStorage.getObject('gameData')['users'][value['user']]['friended'] == 1) {
            var videoLink = '';
            if (value['video'] != '' && value['video'] != undefined) {
                videoLink = '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+value['video']+'" frameborder="0" allowfullscreen></iframe>';
            }
            var imageLink = '';
            if (value['image'] != '' && value['image'] != undefined) {
                imageLink = '<img src="img/'+value['image']+'" alt="user image" class="feedImage" />';
                if (value['caption'] != '' && value['caption'] != undefined) {
                    imageLink = '<div class="feedImageCont">' + imageLink + '<div class="captionCont"> ' + value['caption'] + '</div></div>';
                }
            }
            var likedText = '';
            if (value['likes'] != '' && value['likes'] != undefined) {
                likedText = '<span class="colouredText">'+value['likes']+'</span> people like this';
            }
            var sinceText = time.wordify(value['date']);
            var usersAvatar = localStorage.getObject('gameData')['users'][value['user']]['avatar'];
            var usersFirstname = localStorage.getObject('gameData')['users'][value['user']]['firstname'];
            var usersLastname = localStorage.getObject('gameData')['users'][value['user']]['lastname'];
            var commentCondition = '';var likedCondition = '';var canComment = '';
            if (value['choices'] != undefined && value['commented'] == 1) {commentCondition = 'commented';}
            if (value['liked'] != undefined && value['liked'] == 1) {likedCondition = 'liked';}
            if (value['choices'] != undefined && value['choices'] != '' && value['commented'] == 0) {canComment = 'usableControls';}
            var commentsString = '<div class="comments" id="comments_'+value['postId']+'"></div>';
            if (processNormal == 1) {
                var commentsString = feed.commentBuilder(value['comments'],value['postId'],0);
            }
            $('#'+target).prepend('<div id="feed_'+value['postId']+'" class="feedObject" ><div class="innerFeed"><div class="feedHeader"><div class="feedAvatar"><img class="avatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><div class="postedBy">'+usersFirstname+' '+usersLastname+'</div><div class="date dateUpdate" data-date="'+value['date']+'">'+sinceText+'</div></div><p>'+value['text']+'</p>'+videoLink+imageLink+'<div class="feedControls"><span class="feedControl likeControl usableControls '+likedCondition+'" id="like_'+value['postId']+'"><i class="fa fa-thumbs-up"></i>Like</span><span id="comment_'+value['postId']+'" class="feedControl commentControl '+commentCondition+' '+canComment+'"><i class="fa fa-comment"></i>Comment</span></div></div><div class="likedSection">'+likedText+'</div>'+commentsString+'</div>');
            if (value['liked'] == 0) {
                $('#like_'+value['postId']).on('click touch', function() {
                    $('#like_'+value['postId']).unbind('click touch');
                    $('#like_'+value['postId']).off('click touch');
                    $('#like_'+value['postId']).addClass('liked');
                    if ($('#feed_'+value['postId']+' .likedSection').html() == '') {
                        $('#feed_'+value['postId']+' .likedSection').html('<span class="colouredText">1</span> people like this');
                    } else {
                        $('#feed_'+value['postId']+' .likedSection .colouredText').html(parseInt($('#feed_'+value['postId']+' .likedSection .colouredText').html()) + 1);   
                    }
                    gameUpdate.updateLocal('1','liked',value['postId']);
                });
            }
            if (processNormal == 1) {
                if (commentsString != '') {
                    var possibleChoice = value['comments'][value['comments'].length-1];
                    if (possibleChoice && possibleChoice.date == 'CHOICE') {
                        $('#comment_'+value['postId']).addClass('usableControls');
                        $('#comment_'+value['postId']).on('click touch', function() {
                            $('#comment_'+value['postId']).unbind();
                            $('#comment_'+value['postId']).addClass('choiceBeing');
                            choiceControls.create(possibleChoice.text.choiceId,'feed_'+value['postId'],'comment','comment_'+value['postId'],possibleChoice.text.choice1,possibleChoice.text.choice2,possibleChoice.text.choice3);                
                        });
                    }
                }
            } else {
                console.log(timestampify()+'Triggering the commentPoster!');
                feed.commentPoster(value['comments'],value['postId']);
            }
        }
    });
}      

feed.createComment = function(postId,possibleChoice) {
    $('#comment_'+postId).addClass('usableControls');
    $('#comment_'+postId).on('click touch', function() {
        $('#comment_'+postId).unbind();
        $('#comment_'+postId).addClass('choiceBeing');
        choiceControls.create(possibleChoice.choiceId,'feed_'+postId,'comment','comment_'+postId,possibleChoice.choice1,possibleChoice.choice2,possibleChoice.choice3);                
    });
}

feed.backlog = function(value) {
    var target = 'feedContent';
    console.log(timestampify()+'Feed backlog with feedId ' +value['postId']);
    console.log(value);
    if (localStorage.getObject('gameData')['users'][value['user']]['friended'] == 1) {
        var videoLink = '';
        if (value['video'] != '' && value['video'] != undefined) {
            videoLink = '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+value['video']+'" frameborder="0" allowfullscreen></iframe>';
        }
        var imageLink = '';
        if (value['image'] != '' && value['image'] != undefined) {
            imageLink = '<img src="img/'+value['image']+'" alt="user image" class="feedImage" />';
            if (value['caption'] != '' && value['caption'] != undefined) {
                imageLink = '<div class="feedImageCont">' + imageLink + '<div class="captionCont"> ' + value['caption'] + '</div></div>';
            }
        }
        var likedText = '';
        if (value['likes'] != '' && value['likes'] != undefined) {
            likedText = '<span class="colouredText">'+value['likes']+'</span> people like this';
        }
        var sinceText = time.wordify(value['date']);
        var usersAvatar = localStorage.getObject('gameData')['users'][value['user']]['avatar'];
        var usersFirstname = localStorage.getObject('gameData')['users'][value['user']]['firstname'];
        var usersLastname = localStorage.getObject('gameData')['users'][value['user']]['lastname'];
        var commentCondition = '';var likedCondition = '';var canComment = '';
        if (value['choices'] != undefined && value['commented'] == 1) {commentCondition = 'commented';}
        if (value['liked'] != undefined && value['liked'] == 1) {likedCondition = 'liked';}
        if (value['choices'] != undefined && value['choices'] != '' && value['commented'] == 0) {canComment = 'usableControls';}
        var commentsString = feed.commentBuilder(value['comments'],value['postId']);
        $('#'+target).prepend('<div id="feed_'+value['postId']+'" class="feedObject" ><div class="innerFeed"><div class="feedHeader"><div class="feedAvatar"><img class="avatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><div class="postedBy">'+usersFirstname+' '+usersLastname+'</div><div class="date">'+sinceText+'</div></div><p>'+value['text']+'</p>'+videoLink+imageLink+'<div class="feedControls"><span class="feedControl likeControl usableControls '+likedCondition+'" id="like_'+value['postId']+'"><i class="fa fa-thumbs-up"></i>Like</span><span id="comment_'+value['postId']+'" class="feedControl commentControl '+commentCondition+' '+canComment+'"><i class="fa fa-comment"></i>Comment</span></div></div><div class="likedSection">'+likedText+'</div>'+commentsString+'</div>');
        if (commentsString != '') {
            var possibleChoice = value['comments'][value['comments'].length-1];
            console.log(possibleChoice);
            if (possibleChoice && possibleChoice.date == 'CHOICE') {
                $('#comment_'+value['postId']).addClass('usableControls');
                $('#comment_'+value['postId']).on('click touch', function() {
                    $('#comment_'+value['postId']).unbind();
                    $('#comment_'+value['postId']).addClass('choiceBeing');
                    choiceControls.create(possibleChoice.text.choiceId,'feed_'+value['postId'],'comment','comment_'+value['postId'],possibleChoice.text.choice1,possibleChoice.text.choice2,possibleChoice.text.choice3);                
                });
            }
        }
        if (value['liked'] == 0) {
            $('#like_'+value['postId']).on('click touch', function() {
                $('#like_'+value['postId']).unbind();
                $('#like_'+value['postId']).addClass('liked');
                $('#feed_'+value['postId']+' .likedSection .colouredText').html(parseInt($('#feed_'+value['postId']+' .likedSection .colouredText').html()) + 1);
                gameUpdate.updateLocal('1','liked',value['postId']);
            });
        }
    }
}

feed.commentPoster = function(comments,postId) {
    var counter = 0;
    console.log(timestampify()+'Posting comment');
    //console.log(comments);
    var timer = 10000;
    function postComment() {
        value = comments[counter];
        if (value['date'] != 'CHOICE') {
            var commentsString = '';
            var commentSince = time.wordify(value['date']);
            var usersAvatar = localStorage.getObject('gameData')['users'][value['user']]['avatar'];
            var usersFirstname = localStorage.getObject('gameData')['users'][value['user']]['firstname'];
            var usersLastname = localStorage.getObject('gameData')['users'][value['user']]['lastname'];
            var imageComments = '';
            if (value['image'] != '') {
                imageComments = '<img src="img/'+value['image']+'" alt="user image" class="feedImage" />';
            }
            var likedComments = '';
            if (value['likes'] != '') {
                likedComments = '<span class="colouredText commentLikes"><i class="fa fa-thumbs-up"></i>'+value['likes']+'</span>';
            }
            commentsString += '<div class="comment"><div class="commentAvatar"><img class="avatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><span class="commentBy">'+usersFirstname+' '+usersLastname+'</span><span class="commentContent" data-date="'+value['date']+'">'+value['text']+'</span>'+imageComments+'<div class="commentFooter dateUpdate" data-date="'+value['date']+'">'+commentSince+'</div></div>';
            $('#comments_'+postId).append(commentsString);
            counter++;
        }
        if (comments[counter] != undefined && comments[counter].date != 'CHOICE') {
           setTimeout(function() {
                postComment();
           },timer);
        } else if (comments[counter] != undefined && comments[counter].date == 'CHOICE') {
            var possibleChoice = comments[comments.length-1];
            if (possibleChoice.date == 'CHOICE') {
                console.log(timestampify()+'There is a choice on #comment_'+postId);
                $('#comment_'+postId).addClass('usableControls');
                $('#comment_'+postId).removeClass('commented');
                $('#comment_'+postId).on('click touch', function() {
                    $('#comment_'+postId).unbind();
                    $('#comment_'+postId).addClass('choiceBeing');
                    choiceControls.create(possibleChoice.text.choiceId,'feed_'+postId,'comment','comment_'+postId,possibleChoice.text.choice1,possibleChoice.text.choice2,possibleChoice.text.choice3);                
                });
            }
        }
    }
    if (comments.length > 0) {
        setTimeout(function() {
            postComment();
       },timer);
    } 
}

feed.commentBuilder = function(comments,postId,noNote) {
    var commentsString = '';    
    if (noNote == undefined || noNote != 1) {
        commentsString = '<div class="comments" id="comments_'+postId+'">';
    }
    if (comments.length > 0) {
        $.each(comments, function(index,value) {
            if (value['date'] != 'CHOICE') {
                var commentSince = time.wordify(value['date']);
                var usersAvatar = localStorage.getObject('gameData')['users'][value['user']]['avatar'];
                var usersFirstname = localStorage.getObject('gameData')['users'][value['user']]['firstname'];
                var usersLastname = localStorage.getObject('gameData')['users'][value['user']]['lastname'];
                var imageComments = '';
                if (value['image'] != '') {
                    imageComments = '<img src="img/'+value['image']+'" alt="user image" class="feedImage" />';
                }
                var likedComments = '';
                if (value['likes'] != '') {
                    likedComments = '<span class="colouredText commentLikes"><i class="fa fa-thumbs-up"></i>'+value['likes']+'</span>';
                }
                commentsString += '<div class="comment"><div class="commentAvatar"><img class="avatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><span class="commentBy">'+usersFirstname+' '+usersLastname+'</span><span class="commentContent">'+value['text']+'</span>'+imageComments+'<div class="commentFooter dateUpdate" data-date="'+value['date']+'">'+commentSince+'</div></div>';
            }
        });
    }
    if (noNote != undefined && noNote != 1) {
        commentsString += '</div>';
    }
    return commentsString;
}

feed.new = function() {
    var notificationNoise = new Audio("../sounds/tapNote.mp3");
    notificationNoise.play();
    gameUpdate.updateNotifications('posts');
    $('#newsFeedLink').find('.totalNew').html(localStorage.getObject('gameSettings').unread.messages);
}

/*

_________ _______  _______  _        ______  _________ _        _______ 
\__   __/(  ____ )(  ____ \( (    /|(  __  \ \__   __/( (    /|(  ____ \
   ) (   | (    )|| (    \/|  \  ( || (  \  )   ) (   |  \  ( || (    \/
   | |   | (____)|| (__    |   \ | || |   ) |   | |   |   \ | || |      
   | |   |     __)|  __)   | (\ \) || |   | |   | |   | (\ \) || | ____ 
   | |   | (\ (   | (      | | \   || |   ) |   | |   | | \   || | \_  )
   | |   | ) \ \__| (____/\| )  \  || (__/  )___) (___| )  \  || (___) |
   )_(   |/   \__/(_______/|/    )_)(______/ \_______/|/    )_)(_______)
                                                                        

*/

var trendingArray = {};

function buildTrending() {
    var desiredIndex = Math.floor(Math.random() * trendingArray.length);
	if (trendingArray[desiredIndex] != undefined) {
		var desiredStudent = trendingArray[desiredIndex];
		delete trendingArray[desiredIndex];
		createTrender(desiredStudent);
	} else {
		buildTrending();
	}
}

function createTrender(data) {
    $('#trendingSection').append('<div class="trender"><span class="colouredText">'+data['title']+':</span> '+data['content']+'</div>');
}

/*

 _        _______             _______  _______  _       _________ _______  _______  _        _______ 
( (    /|(  ___  )|\     /|  (  ____ \(  ___  )( (    /|\__   __/(  ____ )(  ___  )( \      (  ____ \
|  \  ( || (   ) || )   ( |  | (    \/| (   ) ||  \  ( |   ) (   | (    )|| (   ) || (      | (    \/
|   \ | || (___) || |   | |  | |      | |   | ||   \ | |   | |   | (____)|| |   | || |      | (_____ 
| (\ \) ||  ___  |( (   ) )  | |      | |   | || (\ \) |   | |   |     __)| |   | || |      (_____  )
| | \   || (   ) | \ \_/ /   | |      | |   | || | \   |   | |   | (\ (   | |   | || |            ) |
| )  \  || )   ( |  \   /    | (____/\| (___) || )  \  |   | |   | ) \ \__| (___) || (____/\/\____) |
|/    )_)|/     \|   \_/     (_______/(_______)|/    )_)   )_(   |/   \__/(_______)(_______/\_______)
                                                                                                     

*/

var navigationControls = {};

navigationControls.change = function(page) {
    $('#mobileNav').off();
    $('.sideLink').off();
    $('#userNav div').off();
    $('.aboutItem').off();
    if (page == 'restart') {
            window.localStorage.clear();
            window.location.replace("index.html");
    }
    $('#contentAim').load('content/'+page+'.html', null, function() {
        users.load(); 
        $('body').attr('id','');
        //console.log(timestampify()+'Going to '+page);
        if (page == 'messages') {
            $('body').attr('id','messagesPage');
            gameUpdate.updateNotifications('messages',1);
            messages.init();
            document.title = 'Twaddle - Messages';
        } else if (page == 'robin') {
            $('#userNav div').on('click touch', function() {
                if ($(this).attr('id') != 'about') {
                    $('#aboutBody').hide();
                    $('#userBody').html('');
                    $('#userHeader').addClass('noHero');
                    $('#userNav div').removeClass('current');
                    $('#posts').addClass('current');
                    feed.create('userBody',localStorage.getObject('gameData').posts,1);
                } else{
                    $('#userBody').html('');
                    $('#userHeader').removeClass('noHero');
                    $('#userNav div').removeClass('current');
                    $('#about').addClass('current');
                    $('#aboutBody').show();
                    $('.overview').show();
                }
            });
            document.title = 'Robin Creed';
            $('.aboutItem').on('click touch', function() {
                $('.aboutItem').removeClass('current');
                $(this).addClass('current');
                $('.aboutContents').hide();
                $('.'+$(this).attr('id')).show();
            });
            
            $('#posts').click();            
        } else if (page == 'feed') {
            gameUpdate.updateNotifications('posts',1);
            document.title = 'Twaddle - A social media for the everyman';
            feed.create('feedContent',localStorage.getObject('gameData').posts,1);
            //setTimeout(function() {spawnNotification('This notification system will be used to let you know about new updates','img/samAvatar.png','Welcome to the man next door!');},3000);
            
            /*setTimeout(function() {
                visibleChangeHandler();
                glitchThis();
            }, 10000);*/
            
            trendingArray = localStorage.getObject('gameData').trending;
            
            buildTrending();
            buildTrending();
            buildTrending();
        } 
        navigationControls.setUp();
    });
}

navigationControls.setUp = function() {
    $('#mobileNav').on('click touch', function() {
        $('#feedContent').toggleClass('navFlip');
        $('.sideBar').toggleClass('navFlip');
        window.scrollTo(0,0);
        $('body').toggleClass('navFlip');
    });  
    $('.sideLink').on('click touch', function(ev) {
         ev.preventDefault();
         if ($(this).attr('id') == 'newsFeedLink') {
             navigationControls.change('feed');
         } else if ($(this).attr('id') == 'messagesLink') {
             navigationControls.change('messages');
         } else if ($(this).attr('id') == 'Robin') {
             navigationControls.change('robin');
         } else if ($(this).attr('id') == 'restartLink') {
             navigationControls.change('restart');
         }
    });
    if (localStorage.getObject('gameSettings').unread.messages > 0) {$('#messagesLink').find('.totalNew').html(localStorage.getObject('gameSettings').unread.messages);}
    if (localStorage.getObject('gameSettings').unread.posts > 0) {$('#newsFeedLink').find('.totalNew').html(localStorage.getObject('gameSettings').unread.posts);}
};

/*

 _______ _________ _______  _______ 
(       )\__   __/(  ____ \(  ____ \
| () () |   ) (   | (    \/| (    \/
| || || |   | |   | (_____ | |      
| |(_)| |   | |   (_____  )| |      
| |   | |   | |         ) || |      
| )   ( |___) (___/\____) || (____/\
|/     \|\_______/\_______)(_______/
                        

*/

// Notifications section

// Determine the correct object to use
var notification = window.Notification || window.mozNotification || window.webkitNotification;

// The user needs to allow this
if ('undefined' === typeof notification)
    alert('Web notification not supported');
else
    notification.requestPermission(function(permission){});

// A function handler
function spawnNotification(theBody,theIcon,theTitle)
{
    if ('undefined' === typeof notification)
        return false;       //Not supported....
    var noty = new notification(
        theTitle, {
            body: theBody,
            dir: 'auto', // or ltr, rtl
            lang: 'EN', //lang used within the notification.
            tag: 'notificationPopup', //An element ID to get/set the content
            icon: theIcon //The URL of an image to be used as an icon
        }
    );
    
    setTimeout(function(){ 
        noty.close() 
    },5000); 
    /*noty.onclick = function () {
        console.log(timestampify()+'notification.Click');
    };
    noty.onerror = function () {
        console.log(timestampify()+'notification.Error');
    };
    noty.onshow = function () {
        console.log(timestampify()+'notification.Show');
    };
    noty.onclose = function () {
        console.log(timestampify()+'notification.Close');
    };*/
    return true;
}

// Page visibility

var hidden, visibilityChange;
if (typeof document.hidden !== 'undefined') {
    // Opera 12.10, Firefox >=18, Chrome >=31, IE11
    hidden = 'hidden';
    visibilityChangeEvent = 'visibilitychange';
} else if (typeof document.mozHidden !== 'undefined') {
    // Older firefox
    hidden = 'mozHidden';
    visibilityChangeEvent = 'mozvisibilitychange';
} else if (typeof document.msHidden !== 'undefined') {
    // IE10
    hidden = 'msHidden';
    visibilityChangeEvent = 'msvisibilitychange';
} else if (typeof document.webkitHidden !== 'undefined') {
    // Chrome <31 and Android browser (4.4+ !)
    hidden = 'webkitHidden';
    visibilityChangeEvent = 'webkitvisibilitychange';
}

// Event handler: log change to browser console
function visibleChangeHandler() {
    if (document[hidden]) {
        return false;
        //var audio = new Audio("../sounds/roar.wav");
        //audio.play();
    } else {
        return true;
    }
}

function createTimestamp(timeFrom) {
    var d = new Date();
    d.setHours(0,0,0,0);
    var newDateObj = new Date(d.getTime() + (timeFrom*60000));
    return newDateObj.getTime() / 1000;
}

var emergencyStop = setInterval(
    function updateTheDateTime() {
        $('.dateUpdate').each(function() {
            $(this).html(time.wordify($(this).attr('data-date')));
        });
    },
    60000
);

function timestampify() {
	var currentdate = new Date(); 
	currentdate = new Date(currentdate.getTime() + 10*60*60000)
	var datetime = "[" + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds()+'] ';
    return datetime;
}