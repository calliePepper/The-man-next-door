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
var deviceData = {};
deviceData['type'] = 0;
var emergencyStop;
var currentPage = 'feed';

var consoleData = [];

var baseLogFunction = console.log;
var actualInnerWidth = $("body").width();

var $canvas      = $('#canvasFront');
var canvas       = $canvas[0];

var loading = '<div id="loadingWrapper" class="timeline-wrapper feedObject"><div class="innerFeed"><div class="timeline-item"><div class="animated-background"><div class="background-masker header-top"></div><div class="background-masker header-left"></div><div class="background-masker header-right"></div><div class="background-masker header-bottom"></div><div class="background-masker subheader-left"></div><div class="background-masker subheader-right"></div><div class="background-masker subheader-bottom"></div><div class="background-masker content-top"></div><div class="background-masker content-first-end"></div><div class="background-masker content-second-line"></div><div class="background-masker content-second-end"></div><div class="background-masker content-third-line"></div><div class="background-masker content-third-end"></div></div></div><div class="feedControls"><span class="feedControl"><i class="fa fa-thumbs-up"></i>Like</span><span id="comment_1102" class="feedControl"><i class="fa fa-comment"></i>Comment</span></div></div></div>';

//canvas.width  = actualInnerWidth;
//canvas.height = window.innerHeight;

/*var $canvasB      = $('#canvasBack');
var canvasB      = $canvasB[0];

canvasB.width  = actualInnerWidth;
canvasB.height = $('body').height();*/


console.log = function() {
    baseLogFunction.apply(console,arguments);
    
    var args = Array.prototype.slice.call(arguments);
    for (var i=0;i<args.length;i++) {
        var node = createLogNode(args[i]);
        consoleData.unshift(node);
        if (consoleData.length > 200) {
            consoleData.pop();
        }
    }
}

function createLogNode(message) {
    if (typeof message === 'object') {
        var textNode = timestampify()+"Object detected";
        //textNode += JSON.stringify(message).replace(RegExp("\\n","g"), "\n").replace(/'/g, "\\'").replace(/"/g, "\\'");
    } else {
        var textNode = message;   
    }
    return textNode;
}

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

if (localStorage.getObject('dataCache') == undefined || localStorage.getObject('gameSettings') == undefined || localStorage.getObject('gameSettings').name == undefined || localStorage.getObject('gameSettings').startTime == undefined || localStorage.getObject('gameSettings').lastUpdate == undefined || localStorage.getObject('gameSettings').timezone == undefined) {
    window.location.replace('startup.html');
    cordova.plugins.notification.local.clearAll(function() {
        alert("done");
    }, this);
} 

var playerName = localStorage.getObject('gameSettings').name;

var saveRepo = [];
var currentSave = [];
var saving = 0;
var saveTimeout;

var debugData = [];
debugData[0] = {};
debugData[1] = {};
debugData[2] = {};
var debugCounter = 0;
var debugTotal = [];

function debugNotice(data,type) {
    debugData[type][debugCounter] = data;
    debugCounter++;
    console.log(data);
}


function sendDebug(errorDesc) {
    var errorData = '';
    var errorCounter = 0;
    $.each(consoleData.reverse(), function(revIndex,revVal) {
        if (errorCounter < 200) {
            errorData += revVal + escape('\r\n');
        }
        errorCounter++;
    })
    console.log('mailto:faedaunt@gmail.com?subject=Error report for TMND - '+errorDesc.substr(30)+'&body=There has been an error report from TMND.'+escape('\r\n')+errorDesc+escape('\r\n')+errorData);
    window.location.href = 'mailto:faedaunt@gmail.com?subject=Error report for TMND - '+errorDesc.substr(30)+'&body=There has been an error report from TMND.'+escape('\r\n')+errorDesc+escape('\r\n')+errorData;
    if (pageId == 'feed') {
      navigationControls.change('feed');
    } else if (pageId == 'messages') {
        if (getQueryVariable('id') != undefined) {
            var messageId = getQueryVariable('id');
        } else {
            var messageId = 0;
        }
        navigationControls.change('messages',messageId);
    } else if (pageId == 'robin') {
        navigationControls.change('robin');
    } else if (pageId == 'cal') {
        navigationControls.change('cal');
    } else {
        navigationControls.change('feed');
    }
}

function gameUpdate(type, saveType, data, dataType, extraData,choiceId) {
    var savePocket = {
        type: type,
        saveType: saveType,
        data: data,
        dataType: dataType,
        extraData: extraData,
        choiceId: choiceId
    }
    saveRepo.push(savePocket);
    triggerSave();
}

function triggerSave() {
    
    if (saving == 0) {
        saving = 1;
        currentSave = saveRepo;
        saveRepo = [];   
        processSave();
    } else {
        setTimeout(function() {
           triggerSave(); 
        },10);
        //debugNotice(timestampify()+'PAUSING TICK ----------');
    }
}

function removeUnread(user,id,date) {
    var tempData = localStorage.getObject('gameData');
    var dayValue = 0;
    var timeValue = 0;
    id = id.split('-')[1];
    $.each(tempData.messages[user], function(dayIndex,day) {
        $.each(day, function(index,msg) {    
            if (msg.msgId == id) {
                dayValue = dayIndex;
                timeValue = index;
            }
        });
    });
    debugNotice(timestampify()+localStorage.getObject('gameData')['messages'][user][dayValue][timeValue],0);
    gameUpdate('markRead', 'data', user, dayValue, timeValue,'');
}

function updateUnread() {
    if (localStorage.getObject('gameSettings').unread.messages == 0) {
        $('#messagesLink').find('.totalNew').html('');
    } else {
        $('#messagesLink').find('.totalNew').html(localStorage.getObject('gameSettings').unread.messages);
    }
}

function processSave() {
    $.each(currentSave, function(index,value) {
        var type = value['type'];
        var saveType = value['saveType'];
        var data = value['data'];
        var dataType = value['dataType'];
        var extraData = value['extraData'];
        var choiceId = value['choiceId'];
        //debugNotice(timestampify()+'Processing a save tick --------- '+saveType+ ' ' +type);
        var tempData = localStorage.getObject('gameData');
        if (saveType == 'settings') {tempData = localStorage.getObject('gameSettings');}
        switch(type) {
            case 'firstLoad':
                tempData.firstLoad = 0;
                firstLoadTime = 1;
                break;
            case 'updateTime':
                if (data == undefined) {data = 0;}
                var currentTime = Math.floor(Date.now() / 1000 + data);
                tempData.lastUpdate = new Date();
                break;
            case 'updateFeed':
                tempData.lastFeed[data.toString()] = 1;
                break;
            case 'updateMessages':
                tempData.lastMessage[data] = 1;
                break;
            case 'messageWait':
                tempData.messageWait[data] = 1;
                break;
            case 'removeMessages':
                tempData.messageWait[data] = undefined;
                break;
            case 'updateComment':
                tempData.lastComment[data.toString()] = 1;
                break;
            case 'timerNull':
                tempData.timers[data] = undefined;
                break;
            case 'updateNotifications':
                if (dataType == '1') {
                    var newNumber = 0;
                } else {
                    var newNumber = localStorage.getObject('gameSettings').unread[data] + 1;
                }
                tempData.unread[data] = newNumber;
                break;
            case 'updateReturn':
                tempData.sendQueue[data] = [dataType,extraData];
                break;
            case 'removeReturn':
                tempData.sendQueue[data] = undefined;
                break;
            case 'addFriend':
                tempData.users[data].friended = 1;
                break;
            case 'markRead':
                tempData['messages'][data][dataType][extraData].unread = 0;
                var moreTemp = localStorage.getObject('gameSettings');
                if (localStorage.getObject('gameSettings').unread.messages > 0) {
                    moreTemp.unread.messages = parseInt(localStorage.getObject('gameSettings').unread.messages) - 1;
                }
                localStorage.setObject('gameSettings',moreTemp);
                setTimeout(function() {updateUnread();},300);
                break;
            case 'updateLocal':
                //debugNotice('Updating local data save');
                if (dataType == 'comment') {
                    $.each(tempData['posts'],function(day,value) {
                        $.each(value,function(time,value) {
                            if (extraData == value.postId) {
                                value.comments.push(data);         
                            }
                        });
                    });
                } else if (dataType == 'comments') {
                    var aim = 0;
                    $.each(tempData.posts, function(day, dayData) {
                        $.each(dayData, function(index,value) {
                           if (value.postId == extraData.comment.feedId) {
                                aim = index;
                                aimDay = day;
                            } 
                        });
                    });
                    $.each(data, function(index, value) {
                        if (tempData.posts[aimDay][aim].comments == 0) {
                            tempData.posts[aimDay][aim].comments = [];
                        }
                        tempData.posts[aimDay][aim].comments.push(value);
                    });
                } else if (dataType == 'choice') {
                    var cameFrom = extraData.split('_');
                    if (cameFrom[0] != 'message') {
                        $.each(tempData['posts'],function(day,value) {
                            $.each(value,function(time,value) {
                                if (extraData == value.postId) {
                                    value.commented = 1;         
                                }
                            });
                        });
                    }
                } else if (dataType == 'liked') {
                    var lookup = {};
                    $.each(tempData['posts'],function(day,value) {
                        $.each(value,function(time,value) {
                            if (extraData == value.postId) {
                                value.liked = 1;
                                value.likes += 1            
                            }
                        });
                    });
                } else if (dataType == 'messages') {
                    if (tempData['messages'][extraData[0]] == undefined) {
                        tempData['messages'][extraData[0]] = {};
                    }
                    if (tempData['messages'][extraData[0]][extraData[1]] == undefined) {
                        tempData['messages'][extraData[0]][extraData[1]] = {};
                    }
                    var targetTime = extraData[2];
                    var HOLYSHITEVERYTHINGISFUCKED = 0;
                    while (tempData['messages'][extraData[0]][extraData[1]][targetTime] != undefined) {
                        targetTime++;
                        HOLYSHITEVERYTHINGISFUCKED++
                        if (HOLYSHITEVERYTHINGISFUCKED > 300) {
                            break;
                        }
                    }
                    data.date = targetTime;
                    tempData['messages'][extraData[0]][extraData[1]][targetTime] = data;
                } else if (dataType == 'posts') {
                    tempData['posts'][extraData] = tempData['posts'][extraData] || {}; 
                    tempData['posts'][extraData][choiceId] = data;
                } else if (dataType == 'posts') {
                    tempData['messages'][extraData[0]][extraData[1]][extraData[2]].unread = 0;
                } else {
                    debugNotice(timestampify()+'Local update error. Type '+data+' not found',0);
                }
                break;
            case 'updateTimer':
                var updateTime = createTimestamp(dataType);
                var ttlData = {
                    time:updateTime,
                    target:extraData,
                    id:choiceId
                };
                tempData.timers[data] = ttlData;
                break;
            default:
                debugNotice(timestampify()+' >>>>>>ERROR<<<<<< Something went wrong with the save, datatype: '+dataType+' >>>>>>ERROR<<<<<<',0);
                debugNotice(type + ' - ' + saveType  + ' - ' + data + ' - ' + dataType + ' - ' + extraData + ' - ' + choiceId,0);
        //debugNotice(timestampify()+'Processing a save tick --------- '+saveType+ ' ' +type);
        var tempData = localStorage.getObject('gameData');
        }
        if (saveType == 'settings') {tempData = localStorage.setObject('gameSettings',tempData);}
        else {localStorage.setObject('gameData',tempData);}
    });
    saving = 0;
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

choiceControls.remove = function() {
    var counter = 0;
    $('.choiceBlock').each(function() {
        if ($(this).data("targettype") == 'comment') {
            if ($(this).data("remove") != '') {
                if ($('#'+$(this).data("remove")).hasClass('choiceBeing')) {
                    $('#'+$(this).data("remove")).removeClass('choiceBeing');
                }
            }
        }
        counter++
        $(this).remove();
    });
    console.log(timestampify() + counter + ' choice options removed');
}

choiceControls.create = function(choiceId,target,targetType,remove,choice1,choice2,choice3) {
    choiceControls.remove();
    $('.choice').unbind();
    debugNotice(timestampify()+'CREATING THE CHOICE CONTROLS',0);
    debugNotice(choiceId + ' - ' + target + ' - ' + targetType + ' - ' + remove + ' - ' + choice1 + ' - ' + choice2 + ' - ' + choice3,0)
    var choiceString = '';
    if (choice1!=0) {choiceString += '<div id="choice1" class="choice btn">'+choice1+'</div>';}
    if (choice2!=0) {choiceString += '<div id="choice2" class="choice btn">'+choice2+'</div>';}
    if (choice3!=0&&choice3!=undefined) {choiceString += '<div id="choice3" class="choice btn">'+choice3+'</div>';}
    $('#'+target).append('<div id="choiceBlock_'+choiceId+'" data-remove="'+remove+'" data-choiceId="'+choiceId+'" data-targetType="'+targetType+'" class="choiceBlock">'+choiceString+'</div>');
    $('#choiceBlock').css('max-height','300px');
    if ($('#messagesCont').length > 0) {
        var objDiv = document.getElementById("messagesCont");objDiv.scrollTop = objDiv.scrollHeight;
    }
}

choiceControls.choose = function(id,choice,targetType) {
    var theChoice = $('#choiceBlock_'+id).find('#'+choice).html();
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
        commentsString += '<div class="comment"><div class="commentAvatar"><img class="avatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><span class="commentBy userLink">'+usersFirstname+'</span><span class="commentContent">'+theChoice+'</span>'+imageComments+'<div class="commentFooter dateUpdate" data-date="'+now+'">'+commentSince+'</div></div>';
        //commentsString += '</div>';
        var choiceMade = choice.replace('choice','');
        var commentTarg = $('#choiceBlock_'+id).parent().find('.comments').attr('id').split('_')[1];
        $('#choiceBlock_'+id).parent().find('.comments').append(commentsString);
        additionalTarget = id;
        var newComment = new comment('',0,now,theChoice,'','',0);
        gameUpdate('updateLocal','data',newComment,'comment',commentTarg);
        gameUpdate('updateLocal','data',choiceMade,'choice','comment_'+commentTarg,id);
        
    } else if (targetType == 'message') {
        var date = time.date(Math.floor(Date.now() / 1000));
        var dataDate = Math.floor(Date.now() / 1000);
        var usersAvatar = localStorage.getObject('gameData')['users'][0]['avatar'];
        var usersFirstname = localStorage.getObject('gameData')['users'][0]['firstname'];
        var usersLastname = localStorage.getObject('gameData')['users'][0]['lastname'];
        var imageLink = '';
        var choiceMade = choice.replace('choice','');
        var newMessage = new message(0,currentlyViewing,Math.floor(Date.now() / 1000),theChoice,'','',deviceData['type'],0);
        //gameUpdate('updateMessages','settings',receivedMessages.messageItem.messageId);
        var commentTarg = currentlyViewing;
        //var fromText = '<i class="fa fa-desktop"></i><span class="sentFrom">Sent from desktop</span>';
        if (deviceData['type'] == 1){var fromText = '<i class="fa fa-mobile"></i><span class="sentFrom">Sent from mobile</span>';} else {var fromText = '<i class="fa fa-desktop"></i><span class="sentFrom">Sent from desktop</span>';}
        $('#messagesCont').append('<div class="messageCont"><img class="messageAvatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /><div class="sentOn">'+fromText+date+'</div><div class="messageName">'+usersFirstname+'</div><div class="messageContents">'+theChoice+'</div></div>');
        var objDiv = document.getElementById("messagesCont");objDiv.scrollTop = objDiv.scrollHeight;
        setTimeout(function() {objDiv.scrollTop = objDiv.scrollHeight;},100);
        gameUpdate('updateLocal','data',newMessage,'messages',[commentTarg,getPoint(localStorage.getObject('gameSettings').startTime,new Date(),localStorage.getObject('gameSettings').timezone).day,dataDate]);
        gameUpdate('updateLocal','data',choiceMade,'choice','message_'+commentTarg,id);
    }
    choiceControls.remove();
    gameUpdate('updateReturn','settings',id,choice.replace('choice',''),additionalTarget);
}

/*

          _______  _______  _______  _______ 
|\     /|(  ____ \(  ____ \(  ____ )(  ____ \
| )   ( || (    \/| (    \/| (    )|| (    \/
| |   | || (_____ | (__    | (____)|| (_____ 
| |   | |(_____  )|  __)   |     __)(_____  )
| |   | |      ) || (      | (\ (         ) |
| (___) |/\____) || (____/\| ) \ \__/\____) |
(_______)\_______)(_______/|/   \__/\_______       
                                 

*/

var users = {}

users.load = function() {
    debugNotice(timestampify()+'loading users',1);
    $('#friendContainer').html('');
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

users.makeFriends = function(friend) {
    var userTarget = localStorage.getObject('gameData')['users'][friend];
    var friendData = '<div class="md-content"><h3>Friend request</h3><div><div class="friendAvatar"><img id="friendPortrait" src="'+userTarget['avatar']+'" alt="'+userTarget['firstname']+' avatar" /></div><p><span id="friendName" class="colouredText">'+userTarget['firstname']+' '+userTarget['lastname']+'</span> would like to be friends with you, click the button below to begin your journey of friendship!</p><div class="btnCont"><button id="acceptFriend" class="md-close btn">Add to friend list</button></div></div></div></div>';
    $('#overlayData').show().addClass('md-modal').addClass('md-friend-modal').addClass('md-effect-11').addClass('md-show').html(friendData);
    $('#overlay').show();
    $('#acceptFriend').on('click touch', function() {
        $('#acceptFriend').off();
        userPage = 0;
        $('#overlayData').removeClass();
        $('#overlayData').html('');
        $('#overlay').hide();
        //$('#overlay').hide();
        gameUpdate('addFriend','data',2);
        feed.create('feedContent',localStorage.getObject('gameData').posts,1,1);
        users.load(); 
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
    $.each(localStorage.getObject('gameData')['messages'], function(user,userData) {
        if (userData != null) {
            $.each(userData, function(day,dayData) {
                if (dayData != null) {
                    $.each(dayData, function(index,value) {
                        if (value['date'] != 'CHOICE' && value['image'] != 'CHOICE') {
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
                }

           });
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
    //debugNotice(orderedUsers);
}

messages.load = function(id) {
    $('#messagesCont').html('');
    var firstMessages = {};
    var thisUser = '';
    currentlyViewing = id;
    var isChoice = 0;
    var choiceId = 0;
    var choice1 = '';
    var choice2 = '';
    var choice3 = '';
    $.each(localStorage.getObject('gameData')['messages'][id], function(day,dayData) {
        $.each(dayData, function(index,value) {
            if (value.date != 'CHOICE' && value.image != 'CHOICE') { 
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
                var unread = '';
                if (value['unread'] == 1) { unread = ' unread'}
                if (value['from'] == 1){var fromText = '<i class="fa fa-mobile"></i><span class="sentFrom">Sent from mobile</span>';} else {var fromText = '<i class="fa fa-desktop"></i><span class="sentFrom">Sent from desktop</span>';}
                $('#messagesCont').append('<div class="messageCont'+unread+'" id="message-'+value.msgId+'"><img class="messageAvatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /><div class="sentOn" data-date="'+value['date']+'">'+fromText+date+'</div><div class="messageName">'+usersFirstname+' '+usersLastname+'</div><div class="messageContents">'+value['text']+'</div>'+videoLink+imageLink+'</div>');
                var objDiv = document.getElementById("messagesCont");objDiv.scrollTop = objDiv.scrollHeight;
                isChoice = 0;
            } else {
                isChoice = 1;
                choiceId = value.text.choiceId;
                choice1 = value.text.choice1;
                choice2 = value.text.choice2;
                choice3 = value.text.choice3;
            }
        });
    });
    if (isChoice == 1) {
        debugNotice(timestampify()+'Building a choice',1);
        choiceControls.create(choiceId,'messagesCont','message','',choice1,choice2,choice3);                
    }
    $('#messagesCont').prepend('<div class="messagesStart">Conversation started</div>');
    $('.messageTitle').html('&lt; '+thisUser);
    var objDiv = document.getElementById("messagesCont");objDiv.scrollTop = objDiv.scrollHeight;
    setTimeout(function() {objDiv.scrollTop = objDiv.scrollHeight;unreadDebouncer();},100);
}

messages.create = function(userId,time,content,image,from) {
    return new message(userId,time,content,image,from,1,1);
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
            $('.messageUserList').off();
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

messages.new.currentMsg = function(messageFrom,messageTo,cameIn,text,ttw,fullMessage,day) {
    choiceControls.remove();
    $('#messagesCont').append('<div id="typing" class="typing">'+localStorage.getObject('gameData').users[messageFrom].firstname+' is typing...</div>');
    var objDiv = document.getElementById("messagesCont");objDiv.scrollTop = objDiv.scrollHeight;
    var notificationNoise = new Audio("sounds/tapNote.mp3");
    var usersAvatar = localStorage.getObject('gameData')['users'][fullMessage['fromId']]['avatar'];
    var usersFirstname = localStorage.getObject('gameData')['users'][fullMessage['fromId']]['firstname'];
    var usersLastname = localStorage.getObject('gameData')['users'][fullMessage['fromId']]['lastname'];
    var thisUser = '';
    thisUser = usersFirstname + ' ' + usersLastname;
    var unixDate = Math.floor(Date.now() / 1000);
    var date = time.date(unixDate);
    var videoLink = '';
    if (fullMessage['video'] != '' && fullMessage['video'] != undefined) {
        videoLink = '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+fullMessage['video']+'" frameborder="0" allowfullscreen></iframe>';
    }
    var imageLink = '';
    if (fullMessage['image'] != '') {
        imageLink = '<img src="img/'+fullMessage['image']+'" alt="user image" class="feedImage" />';
    }
            if (fullMessage['from'] == 1){var fromText = '<i class="fa fa-mobile"></i><span class="sentFrom">Sent from mobile</span>';} else {var fromText = '<i class="fa fa-desktop"></i><span class="sentFrom">Sent from desktop</span>';}
    fullMessage.date = Math.floor(Date.now() / 1000);
    gameUpdate('updateLocal','data',fullMessage,'messages',[messageTo,day,unixDate]);
    setTimeout(function() {
        $('#typing').remove();
        if (currentlyViewing == messageFrom) {
            $('#messagesCont').append('<div class="messageCont" id="message-'+fullMessage.msgId+'"><img class="messageAvatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /><div class="sentOn">'+fromText+date+'</div><div class="messageName">'+usersFirstname+' '+usersLastname+'</div><div class="messageContents">'+fullMessage['text']+'</div>'+videoLink+imageLink+'</div>');
            var objDiv = document.getElementById("messagesCont");objDiv.scrollTop = objDiv.scrollHeight; 
        } else {
            notificationNoise.play();
        }
        if(text.length > 15) text = text.substring(0,15) + '...';
        var date2 = time.minidate(Math.floor(Date.now() / 1000));
        $('#messageList').prepend($('#messageLink_'+messageFrom));
        $('#messageLink_'+messageFrom).find('.sentOn').html(date2);
        $('#messageLink_'+messageFrom).find('.messageContents').html(text);
        $('#messageLink_'+messageFrom).addClass('pulse');
        setTimeout(function() {$('#messageLink_'+messageFrom).removeClass('pulse');},1000);
        if (!visibleChangeHandler()) {
            spawnNotification('You have a new message from '+localStorage.getObject('gameData').users[messageFrom].firstname,localStorage.getObject('gameData').users[messageFrom].avatar,'New Message');
        }
    },ttw);
}

messages.new.notCurrentMsg = function(messageFrom,messageTo,cameIn,text,ttw,fullMessage,day) {
    var notificationNoise = new Audio("../sounds/tapNote.mp3");
    fullMessage.date = Math.floor(Date.now() / 1000);
    gameUpdate('updateLocal','data',fullMessage,'messages',[messageTo,day,fullMessage.date]);
    setTimeout(function() {
        if(text.length > 15) text = text.substring(0,15) + '...';
        var date = time.minidate(cameIn);
        $('#messageList').prepend($('#messageLink_'+messageFrom));
        $('#messageLink_'+messageFrom).find('.sentOn').html(date);
        $('#messageLink_'+messageFrom).find('.messageContents').html(text);
        $('#messageLink_'+messageFrom).addClass('pulse');
        notificationNoise.play();
        setTimeout(function() {$('#messageLink_'+messageFrom).removeClass('pulse');},1000);
        if (!visibleChangeHandler()) {
            spawnNotification('You have a new message from '+localStorage.getObject('gameData').users[messageFrom].firstname,localStorage.getObject('gameData').users[messageFrom].avatar,'New Message');
        }
    },ttw);
}

messages.new.differentPage = function(messageFrom,messageTo,cameIn,text,ttw,fullMessage,day) {
    var notificationNoise = new Audio("../sounds/tapNote.mp3");
    notificationNoise.play();
    gameUpdate('updateNotifications','settings','messages');
    localStorage.getObject('gameSettings').unread.messages
    $('#messagesLink').find('.totalNew').html(localStorage.getObject('gameSettings').unread.messages);
    fullMessage.date = Math.floor(Date.now() / 1000);
    gameUpdate('updateLocal','data',fullMessage,'messages',[messageTo,day,fullMessage.date]);
}

messages.new.noNotification = function(messageFrom,messageTo,cameIn,text,ttw,fullMessage,difference,day) {
    fullMessage.date = createTimestamp(fullMessage['date'],difference);
    gameUpdate('updateLocal','data',fullMessage,'messages',[messageTo,day,fullMessage.date]);
    gameUpdate('updateNotifications','settings','messages');
    $('#messagesLink').find('.totalNew').html(localStorage.getObject('gameSettings').unread.messages);
}

var effectTimers = {};

messages.packed = function(messageArray,choices,noNote,nextOne,difference,day,noFighting) {
    var counter = 0;
    var userForMsg = 0;
    debugNotice(timestampify()+'Message pack',1);
    debugNotice(messageArray,1);
    var lastMessage = 0;
    function loopMessages() {
        if (messageArray[counter].type != undefined && messageArray[counter].type == 'delay' && noNote != 1) {
            timer = parseInt(messageArray[counter].time);
            console.log(timestampify+'Delay being run for '+timer);
            counter++;
        } else if (messageArray[counter].type != undefined && messageArray[counter].type == 'delay') {
            console.log(timestampify+'Delay being run, but nonote suppressing');
            var timer = 10;
            counter++;
        }  else if (messageArray[counter].type != undefined && messageArray[counter].type == 'effect') {
            console.log(timestampify+'Effect being run');
            var effectToRun = messageArray[counter].effect;
            var effectTimer = messageArray[counter].value;
            counter++;
            if (messageArray[counter].text != undefined) {
                var duration = (messageArray[counter].text.length * localStorage.getObject('gameData')['users'][messageArray[counter].fromId]['typingSpeed'] + localStorage.getObject('gameData')['users'][messageArray[counter].fromId]['waitTime']) / 2;
            } else {
                var duration = 1000;
            }
            if (effectToRun != undefined && effectToRun== 'static') {
                clearTimeout(effectTimers['staticStart']);
                clearTimeout(effectTimers['staticEnd']);
                effectTimers['staticStart'] = setTimeout(function() {
                    $('.staticOverlay').addClass('showStatic');
                    effectTimers['staticEnd'] = setTimeout(function() {
                        $('.staticOverlay').removeClass('showStatic');
                    },(effectTimer * 800));
                },duration);
            } else  if (effectToRun != undefined && effectToRun == 'lines') {
                clearTimeout(staticTimer['linesStart'])
                clearTimeout(staticTimer['linesEnd'])
                effectTimers['linesStart'] = setTimeout(function() {
                    $('#scratchCover .ng-scope').addClass('showEffect');
                    clearTimeout(staticTimer['lines'])
                    staticTimer['linesEnd'] = setTimeout(function() {
                        $('#scratchCover .ng-scope').removeClass('showEffect');
                    },(effectTimer * 800));
                },duration);
            } else  if (effectToRun != undefined && effectToRun == 'lowStatic') {
                $('.staticOverlay').removeClass('lowStatic_1').removeClass('lowStatic_2').removeClass('lowStatic_3').removeClass('lowStatic_4').removeClass('lowStatic_5').removeClass('lowStatic_6').removeClass('lowStatic_7');
                if (effectTimer != 0)    {
                    $('.staticOverlay').addClass('lowStatic_'+effectTimer);    
                } 
            }
            var timer = 0;
        } else {
            if (messageArray[counter].text == undefined) {
                console.log(timestampify()+'Something fucked up');
                console.log(messageArray[counter]);
            }
            var typingTime = messageArray[counter].text.length * localStorage.getObject('gameData')['users'][messageArray[counter].fromId]['typingSpeed'];
            var waitTime = localStorage.getObject('gameData')['users'][messageArray[counter].fromId]['waitTime'];
            debugNotice(timestampify()+'Looping through message of length '+messageArray[counter].text.length+' next message should send in '+typingTime+' with a noNote value of '+noNote+' for day '+day,1);
            debugNotice(messageArray[counter],1);
            userForMsg = messageArray[counter].toId;
            var thisMessage = messageArray[counter].msgId;
            gameUpdate('messageWait','settings',thisMessage);
            if (lastMessage != 0) {
                gameUpdate('removeMessages','settings',lastMessage);
            }
            if (noNote != undefined && noNote == 1) {
                //debugNotice(timestampify()+'Time for no notification!');
                messages.new.noNotification(messageArray[counter].fromId,messageArray[counter].toId,messageArray[counter].date,messageArray[counter].text,typingTime,messageArray[counter],difference,day);    
                typingTime = 100;
                //gameUpdate('markUnread', 'settings');
            } else {
                if ($(document).find("title").text() == 'Twaddle - Messages') {
                    if (currentlyViewing == userForMsg) {
                        messages.new.currentMsg(messageArray[counter].fromId,messageArray[counter].toId,messageArray[counter].date,messageArray[counter].text,typingTime,messageArray[counter],day);
                    } else {
                        messages.new.notCurrentMsg(messageArray[counter].fromId,messageArray[counter].toId,messageArray[counter].date,messageArray[counter].text,typingTime,messageArray[counter],day);         
                        //gameUpdate('markUnread', 'settings');
                    }            
                } else {
                    messages.new.differentPage(messageArray[counter].fromId,messageArray[counter].toId,messageArray[counter].date,messageArray[counter].text,typingTime,messageArray[counter],day);
                    //gameUpdate('markUnread', 'settings');
                }
                if (messageArray[counter] == undefined) {
                    if (messageArray.result != undefined) {
                        switch(messageArray.result) {
                            case "friend":
                                users.makeFriends(messageArray[counter].fromId)
                                break;
                            default:
                                debugNotice("Something went really fucking wrong",1);
                                break;
                        }
                    }
                }
            }
            var choiceTime = messageArray[counter].date;
            counter++;
            if (noNote == 1) {
                var timer = 0;
            } else {
                var timer = typingTime + waitTime;
            }
            if (timer > 10000) {
                timer = timer * 0.9;
            } else if (timer > 15000) {
                timer = timer * 0.8;
            } else if (timer > 20000) {
                timer = timer * 0.7;
            } else if (timer > 25000) {
                timer = timer * 0.6;
            } else if (timer > 30000) {
                timer = timer * 0.5;
            }
            lastMessage = thisMessage;
        }
        if (messageArray[counter] != undefined) {
           setTimeout(function() {
                loopMessages();
           },timer);
        } else if (choices != undefined && choices != '') {
            debugNotice(timestampify()+'Yay a choice found',1);
            debugNotice(choices,1);
            gameUpdate('removeMessages','settings',lastMessage);
            var newChoice = new choice(choices.choiceId,choices.choice1,choices.choice2,choices.choice3)
            //new choice(3,'Deal with the problem yourself','Ignore it, it will go away','Skin the cat. It\'s the only solution. Skin. The. Cat')
            var newMessage = new message(0,userForMsg,'CHOICE',newChoice,'CHOICE','',1,0,0);
            gameUpdate('updateLocal','data',newMessage,'messages',[userForMsg,day,choiceTime])
            setTimeout(function() {
                if (currentlyViewing == userForMsg) {
                    choiceControls.create(choices.choiceId,'messagesCont','message','',choices.choice1,choices.choice2,choices.choice3);
                }  
            },timer);
        } else if (nextOne != 0) {
            gameUpdate('removeMessages','settings',lastMessage);
            if (noFighting != 1) {
                setTimeout(function() {askForAnother(nextOne,noNote);},timer);
            }
        } else {
            gameUpdate('removeMessages','settings',lastMessage);
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
        if (Math.floor(difference) == 0) {
            return 'Recently';
        } else if (Math.floor(difference) == 1) {
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
    return date+'/'+month+'/'+year+' '+hours + ':' + minutes.substr(-2);
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
var feedCheck = [];
var feedRebuilder;

feed.create = function(target,objects,processNormal,rebuild) {
    feedCheck = [];
    if (rebuild == 1) {
        $('#'+target).html('');
    }
    var total = 0;
    debugNotice(timestampify()+'Feed.create was called. ' +target+ ', '+processNormal+ ', '+rebuild+ ', ',2);
    debugNotice(objects,2); 
    $.each(objects.reverse(), function(day,dayData) {
        if (total < 5) {
            var arr = [];
            for (var name in dayData) {
                arr[name] = dayData[name];
            }
            var len = arr.length;
            $.each(arr.reverse(), function(index,value) {
                if (total < 5) {
                    if (value != undefined && localStorage.getObject('gameData')['users'][value['user']]['friended'] == 1) {
                        if (userPage == 0 || value['user'] == userPage) {
                            feed.individualPost(value,processNormal,target,'append'); 
                            total++;
                        }
                    }
                }
            });
        }
    });
    $('#'+target).append(loading);
}

feed.individualPost = function(value,processNormal,target,direction) {
    debugNotice(timestampify()+'Triggering individual post. Id: '+value['postId']+', shortText: "'+value['text'].substring(0,40)+'"',2);
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
        if (value['likes'] == 0) {
            likedText = '<span class="colouredText"></span>No one likes this yet, be the first!';
        } else if (value['likes'] == 1) {
            likedText = '<span class="colouredText">'+value['likes']+'</span> person likes this';
        } else {
            likedText = '<span class="colouredText">'+value['likes']+'</span> people like this';
        }
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
    var possibleChoice = value['comments'][value['comments'].length-1];
    if (direction == 'append') {
        if (possibleChoice && possibleChoice.date == 'CHOICE') {
            $('#'+target).append('<div id="feed_'+value['postId']+'" class="feedObject" ><div class="innerFeed"><div class="feedHeader"><div class="feedAvatar avatar_'+value['user']+'"><img class="avatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><div class="postedBy userLink username_'+value['user']+'">'+usersFirstname+' '+usersLastname+'</div><div class="date dateUpdate" data-date="'+value['date']+'">'+sinceText+'</div></div><p>'+value['text']+'</p>'+videoLink+imageLink+'<div class="feedControls"><span class="feedControl likeControl usableControls '+likedCondition+'" id="like_'+value['postId']+'"><i class="fa fa-thumbs-up"></i>Like</span><span id="comment_'+value['postId']+'" class="feedControl commentControl '+commentCondition+' '+canComment+'" data-id="'+possibleChoice.text.choiceId+'" data-choice1="'+possibleChoice.text.choice1+'" data-choice2="'+possibleChoice.text.choice2+'" data-choice3="'+possibleChoice.text.choice3+'"><i class="fa fa-comment"></i>Comment</span></div></div><div class="likedSection">'+likedText+'</div>'+commentsString+'</div>');
        } else {
            $('#'+target).append('<div id="feed_'+value['postId']+'" class="feedObject" ><div class="innerFeed"><div class="feedHeader"><div class="feedAvatar avatar_'+value['user']+'"><img class="avatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><div class="postedBy userLink username_'+value['user']+'">'+usersFirstname+' '+usersLastname+'</div><div class="date dateUpdate" data-date="'+value['date']+'">'+sinceText+'</div></div><p>'+value['text']+'</p>'+videoLink+imageLink+'<div class="feedControls"><span class="feedControl likeControl usableControls '+likedCondition+'" id="like_'+value['postId']+'"><i class="fa fa-thumbs-up"></i>Like</span><span id="comment_'+value['postId']+'" class="feedControl commentControl '+commentCondition+' '+canComment+'"><i class="fa fa-comment"></i>Comment</span></div></div><div class="likedSection">'+likedText+'</div>'+commentsString+'</div>');
        }
    } else {
        if (possibleChoice && possibleChoice.date == 'CHOICE') {
            $('#'+target).prepend('<div id="feed_'+value['postId']+'" class="feedObject" ><div class="innerFeed"><div class="feedHeader"><div class="feedAvatar avatar_'+value['user']+'"><img class="avatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><div class="postedBy userLink username_'+value['user']+'">'+usersFirstname+' '+usersLastname+'</div><div class="date dateUpdate" data-date="'+value['date']+'">'+sinceText+'</div></div><p>'+value['text']+'</p>'+videoLink+imageLink+'<div class="feedControls"><span class="feedControl likeControl usableControls '+likedCondition+'" id="like_'+value['postId']+'"><i class="fa fa-thumbs-up"></i>Like</span><span id="comment_'+value['postId']+'" class="feedControl commentControl '+commentCondition+' '+canComment+'" data-id="'+possibleChoice.text.choiceId+'" data-choice1="'+possibleChoice.text.choice1+'" data-choice2="'+possibleChoice.text.choice2+'" data-choice3="'+possibleChoice.text.choice3+'"><i class="fa fa-comment"></i>Comment</span></div></div><div class="likedSection">'+likedText+'</div>'+commentsString+'</div>');
        } else {
            $('#'+target).prepend('<div id="feed_'+value['postId']+'" class="feedObject" ><div class="innerFeed"><div class="feedHeader"><div class="feedAvatar avatar_'+value['user']+'"><img class="avatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><div class="postedBy userLink username_'+value['user']+'">'+usersFirstname+' '+usersLastname+'</div><div class="date dateUpdate" data-date="'+value['date']+'">'+sinceText+'</div></div><p>'+value['text']+'</p>'+videoLink+imageLink+'<div class="feedControls"><span class="feedControl likeControl usableControls '+likedCondition+'" id="like_'+value['postId']+'"><i class="fa fa-thumbs-up"></i>Like</span><span id="comment_'+value['postId']+'" class="feedControl commentControl '+commentCondition+' '+canComment+'"><i class="fa fa-comment"></i>Comment</span></div></div><div class="likedSection">'+likedText+'</div>'+commentsString+'</div>');
        }
    }
    feedCheck.push(value['postId']);
    if (processNormal == 1) {
        if (commentsString != '') {
            var possibleChoice = value['comments'][value['comments'].length-1];
            if (possibleChoice && possibleChoice.date == 'CHOICE') {
                $('#comment_'+value['postId']).addClass('usableControls');
            }
        }
    } else {
        feed.commentPoster(value['comments'],value['postId']);
    }
}

feed.createComment = function(postId,possibleChoice) {
    $('#comment_'+postId).addClass('usableControls');
    $('#comment_'+postId).attr('data-id',possibleChoice.choiceId);
    $('#comment_'+postId).attr('data-choice1',possibleChoice.choice1);
    $('#comment_'+postId).attr('data-choice2',possibleChoice.choice2);
    $('#comment_'+postId).attr('data-choice3',possibleChoice.choice3);
}

feed.backlog = function(value) {
    var target = 'feedContent';
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
            if (value['likes'] == 0) {
                likedText = '<span class="colouredText"></span>No one likes this yet, be the first!';
            } else if (value['likes'] == 1) {
                likedText = '<span class="colouredText">'+value['likes']+'</span> person likes this';
            } else {
                likedText = '<span class="colouredText">'+value['likes']+'</span> people like this';
            }
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
        var possibleChoice = value['comments'][value['comments'].length-1];
        if (possibleChoice && possibleChoice.date == 'CHOICE') {
            $('#'+target).prepend('<div id="feed_'+value['postId']+'" class="feedObject" ><div class="innerFeed"><div class="feedHeader"><div class="feedAvatar avatar_'+value['user']+'"><img class="avatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><div class="postedBy userLink username_'+value['user']+'">'+usersFirstname+' '+usersLastname+'</div><div class="date dateUpdate" data-date="'+value['date']+'">'+sinceText+'</div></div><p>'+value['text']+'</p>'+videoLink+imageLink+'<div class="feedControls"><span class="feedControl likeControl usableControls '+likedCondition+'" id="like_'+value['postId']+'"><i class="fa fa-thumbs-up"></i>Like</span><span id="comment_'+value['postId']+'" class="feedControl commentControl '+commentCondition+' '+canComment+'" data-id="'+possibleChoice.text.choiceId+'" data-choice1="'+possibleChoice.text.choice1+'" data-choice2="'+possibleChoice.text.choice2+'" data-choice3="'+possibleChoice.text.choice3+'"><i class="fa fa-comment"></i>Comment</span></div></div><div class="likedSection">'+likedText+'</div>'+commentsString+'</div>');
        } else {
            $('#'+target).prepend('<div id="feed_'+value['postId']+'" class="feedObject" ><div class="innerFeed"><div class="feedHeader"><div class="feedAvatar avatar_'+value['user']+'"><img class="avatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><div class="postedBy userLink username_'+value['user']+'">'+usersFirstname+' '+usersLastname+'</div><div class="date dateUpdate" data-date="'+value['date']+'">'+sinceText+'</div></div><p>'+value['text']+'</p>'+videoLink+imageLink+'<div class="feedControls"><span class="feedControl likeControl usableControls '+likedCondition+'" id="like_'+value['postId']+'"><i class="fa fa-thumbs-up"></i>Like</span><span id="comment_'+value['postId']+'" class="feedControl commentControl '+commentCondition+' '+canComment+'"><i class="fa fa-comment"></i>Comment</span></div></div><div class="likedSection">'+likedText+'</div>'+commentsString+'</div>');
        }
        if (commentsString != '') {
            var possibleChoice = value['comments'][value['comments'].length-1];
            if (possibleChoice && possibleChoice.date == 'CHOICE') {
                $('#comment_'+value['postId']).addClass('usableControls');
            }
        }
    }
    clearTimeout(feedRebuilder);
    feedRebuilder = setTimeout(function() {feed.create('feedContent',localStorage.getObject('gameData').posts,1,1)},300);
}

feed.commentPoster = function(comments,postId) {
    var counter = 0;
    var timer = 10000;
    function postComment() {
        value = comments[counter];
        if (value['date'] != 'CHOICE') {
            var commentsString = '';
            var currentStamp = Math.floor(Date.now() / 1000)
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
            commentsString += '<div class="comment"><div class="commentAvatar avatar_'+value['user']+'"><img class="avatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><span class="commentBy username_'+value['user']+' userLink">'+usersFirstname+' '+usersLastname+'</span><span class="commentContent" data-date="'+value['date']+'">'+value['text']+'</span>'+imageComments+'<div class="commentFooter dateUpdate" data-date="'+currentStamp+'">'+commentSince+'</div></div>';
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
                $('#comment_'+postId).addClass('usableControls');
                $('#comment_'+postId).removeClass('commented');
                $('#comment_'+postId).attr('data-id',possibleChoice.text.choiceId);
                $('#comment_'+postId).attr('data-choice1',possibleChoice.text.choice1);
                $('#comment_'+postId).attr('data-choice2',possibleChoice.text.choice2);
                $('#comment_'+postId).attr('data-choice3',possibleChoice.text.choice3);
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
                commentsString += '<div class="comment"><div class="commentAvatar avatar_'+value['user']+'"><img class="avatar" src="'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><span class="commentBy username_'+value['user']+' userLink">'+usersFirstname+' '+usersLastname+'</span><span class="commentContent">'+value['text']+'</span>'+imageComments+'<div class="commentFooter dateUpdate" data-date="'+value['date']+'">'+commentSince+'</div></div>';
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
    gameUpdate('updateNotifications','settings','posts');
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

var userPage = 0

navigationControls.change = function(page) {
    $('#messagesCont').off();
    $('#userNav div').off();
    $('.aboutItem').off();
    $('.sponsored').html('');
    if (page != 'friendCal' && page != 'debug') {
        debugNotice(timestampify()+'Clearing feed, navigation click',0);
        $('#feedContent').html('');
    }
    $('#feedContent').addClass('noSponsored');
    $('.sideLink').removeClass('current');
    $('#feedContent').removeClass('navFlip');
    $('.sideBar').removeClass('navFlip');
     userPage = 0;
    window.scrollTo(0,0);
    $('body').removeClass('navFlip');
    if (page == 'restart') {
        if (deviceData['type'] == 1) {
            cordova.plugins.notification.local.cancelAll(function() {
                debugNotice('Cleared all notes',0);
            }, this);
        }
        var tempData = localStorage.getObject('dataCache');
        window.localStorage.clear();
        localStorage.setObject('dataCache',tempData)
        window.location.replace("startup.html");
    }
    //$('#contentAim').html('<object data="content/'+page+'.html">');
    $('#feedContent').fadeOut('fast', function() {
        $('body').attr('id','');
        if (page == 'messages') {
            currentPage = 'messages';
            $('#feedContent').html('<div class="messagesBox" id="messagesBox"><div class="messageList" id="messageList"></div><div class="messages" id="messages"><div class="mobile messageTitle"></div><div class="messagesCont" id="messagesCont"></div></div></div>');
            $('body').attr('id','messagesPage');
            //gameUpdate('updateNotifications','settings','messages',1);
            messages.init();
            history.pushState('', 'Twaddle - Messages', 'messages');
            document.title = 'Twaddle - Messages';
            $('#feedContent').fadeIn();
            $('#messagesCont').on('scroll', $.debounce(100,unreadDebouncer));
        } else if (page == 'feed') {
            currentPage = 'feed';
             userPage = 0;
            $('.sponsored').html('<div class="trending"><div class="sideHeader">Trending</div><div id="trendingSection"></div><div class="games"><div class="sideHeader">New games</div><div class="gameBlock"><div class="gameImg"></div></div><div class="gameBlock"><div class="gameImg"></div></div></div></div>')       
            $('#feedContent').removeClass('noSponsored');
            gameUpdate('updateNotifications','settings','posts',1);
            history.pushState('', 'Twaddle - A social media for the everyman', 'feed');
            document.title = 'Twaddle - A social media for the everyman';
            feed.create('feedContent',localStorage.getObject('gameData').posts,1,1);
            //setTimeout(function() {spawnNotification('This notification system will be used to let you know about new updates','img/samAvatar.png','Welcome to the man next door!');},3000);
            
            /*setTimeout(function() {
                visibleChangeHandler();
                glitchThis();
            }, 10000);*/
            
            trendingArray = localStorage.getObject('gameData').trending;
            
            buildTrending();
            buildTrending();
            buildTrending();
            
            $('.username_5').glitch({minint:1, maxint:3, maxglitch:15, hoffset:10, voffset:3, direction:'random'});
            $('#feedContent').fadeIn();
        } else if (page == 'friendCal') {
            $('#feedContent').fadeIn();
            users.makeFriends(2);
        } else if (page == 'debug') {
            var debugOverlay = '<div class="md-content"><h3>Send Debug Data</h3><div><p>Please describe what issues you are having</p><textarea id="debugText"></textarea><div class="btnCont"><button id="sendDebug" class="md-close btn">Send report</button></div></div></div></div>';
            $('#overlayData').show().addClass('md-modal').addClass('md-friend-modal').addClass('md-effect-11').addClass('md-show').html(debugOverlay);
            $('#overlay').show();
            $('#sendDebug').on('click touch', function() {
                $('#sendDebug').off();
                sendDebug($('#debugText').val());
                $('#overlayData').removeClass();
                $('#overlayData').html('');
                $('#overlay').hide();
                
            });
        } else {
            $('#feedContent').html('<div id="userHeader" class="userHeader noHero"><div class="userHero"></div><div class="userAvatar"><img class="avatar" id="aboutAvatar" src="" alt="User\'s Avatar" /></div><div class="userName" id="aboutUsername"></div><div class="userNav" id="userNav"><div id="posts">Wall</div><div id="about">About</div></div></div><div id="userBody"></div><div id="aboutBody" class="aboutBody"><div class="cardTitle">About</div><div class="aboutNav"><div class="aboutItem current" id="overview">Overview</div><div class="aboutItem" id="family">Family and Relationships</div><div class="aboutItem" id="events">Life Events</div></div><div class="outerAbout"><div id="aboutContent" class="aboutContent"><div class="aboutContents overview"><div class="aboutSection"><div class="miniHeader">General Information</div><table class="infoTable" id="generalTable"></table></div><div class="aboutSection"><div class="miniHeader">Favourite Quote</div><p id="userQuote"></p></div></div><div class="aboutContents family">                <div class="aboutSection"><div class="miniHeader">Relationship</div><div id="relationshipData"></div></div><div class="aboutSection"><div class="miniHeader">Family</div><table class="infoTable" id="familyData"></table></div></div><div class="aboutContents events"><div class="miniHeader">Life events</div><table class="infoTable" id="lifeEvents"></table></div></div></div></div></div>');
             if (page == 'robin') {
                currentPage = 'robin'
                 userPage = 1;
                  history.pushState('', 'Twaddle - Robin Creed', 'robin');
                  document.title = 'Twaddle - Robin Creed';
                   $('#aboutUsername').html('Robin Creed');
                   $("#aboutAvatar").attr('src','img/samAvatar.png');
                   $('.userHero').addClass('robinHero');
                   $('#generalTable').html('<tr><td class="labelTd">Date of Birth</td><td>1 April</td></tr><tr><td class="labelTd">Gender</td><td class="hiddenInfo">Not shared</td></tr>');
                   $('#userQuote').html('And now I see with eye serene,<br>The very pulse of the machine.<br>-Wordsworth)');
                   $('#relationshipData').html('<p>Not shared<p>');
                   $('#familyData').html('<tr><td><img src="" class="aboutAvatar" alt="family avatar"/><div class="aboutFamilyName">James Creed</div><div class="aboutFamilyRel">Brother</div></td></tr>');
                   $('#lifeEvents').html('<tr><td class="labelTd">2015</td><td>Robin is in an open relationship</td></tr><tr><td class="labelTd">2014</td><td>Graduated from Elridge Private School</td></tr><tr><td class="labelTd">1997</td><td>James Creed was born</td></tr><tr><td class="labelTd">1995</td><td>Born on 1 April</td></tr>');
                    $('#posts').click();   
                    $('#feedContent').fadeIn();
                    
            } else if (page == 'cal') {
                 userPage = 2;
                 currentPage = 'cal';
                 history.pushState('', 'Twaddle - Calliope Ransom', 'cal');
                 document.title = 'Twaddle - Calliope Ransom';
                   $('#aboutUsername').html('Calliope Ransom');
                   $("#aboutAvatar").attr('src','img/calAvatar.jpg');
                   $('.userHero').addClass('calHero');
                   $('#generalTable').html('<tr><td class="labelTd">Date of Birth</td><td>1 April</td></tr><tr><td class="labelTd">Gender</td><td class="hiddenInfo">Not shared</td></tr>');
                   $('#userQuote').html('And now I see with eye serene,<br>The very pulse of the machine.<br>-Wordsworth)');
                   $('#relationshipData').html('<p>Not shared<p>');
                   $('#familyData').html('<tr><td><img src="" class="aboutAvatar" alt="family avatar"/><div class="aboutFamilyName">James Creed</div><div class="aboutFamilyRel">Brother</div></td></tr>');
                   $('#lifeEvents').html('<tr><td class="labelTd">2015</td><td>Robin is in an open relationship</td></tr><tr><td class="labelTd">2014</td><td>Graduated from Elridge Private School</td></tr><tr><td class="labelTd">1997</td><td>James Creed was born</td></tr><tr><td class="labelTd">1995</td><td>Born on 1 April</td></tr>');
                    $('#posts').click();   
                    $('#feedContent').fadeIn();
                   
            } 
        
        }
        
        navigationControls.setUp();

    });
}

navigationControls.setUp = function() {
    if (localStorage.getObject('gameSettings').unread.messages > 0) {$('#messagesLink').find('.totalNew').html(localStorage.getObject('gameSettings').unread.messages);}
    if (localStorage.getObject('gameSettings').unread.posts > 0) {$('#newsFeedLink').find('.totalNew').html(localStorage.getObject('gameSettings').unread.posts);}
};

users.load(); 

$(document).on('click touch', '#mobileNav', function() {
    $('#feedContent').toggleClass('navFlip');
    $('.sideBar').toggleClass('navFlip');
    window.scrollTo(0,0);
    $('body').toggleClass('navFlip');
});  

var glitch = 0;

$(document).on('click touch', '.sideLink', function(ev) {
     ev.preventDefault();
     if ($(this).attr('id') == 'newsFeedLink') {
         navigationControls.change('feed');
     } else if ($(this).attr('id') == 'messagesLink') {
         navigationControls.change('messages');
     } else if ($(this).attr('id') == 'Robin') {
         navigationControls.change('robin');
     } else if ($(this).attr('id') == 'Cal') {
         navigationControls.change('cal');
     } else if ($(this).attr('id') == 'restartLink') {
         navigationControls.change('restart');
     } else if ($(this).attr('id') == 'addCal') {
         navigationControls.change('friendCal');
     } else if ($(this).attr('id') == 'debugLink') {
         navigationControls.change('debug');
     } else if ($(this).attr('id') == 'crackLink') {
         $('#canvasFront').removeClass('cracked');
         $('.sideBar').removeClass('navFlip');
        window.scrollTo(0,0);
        $('body').removeClass('navFlip');
        $('#feedContent').removeClass('navFlip');
         if (glitch == 0) {
            $('#canvasFront').addClass('cracked');
            glitch = 1;
         } else if (glitch == 1) {
             glitchThis('night');
             glitch = 2;
         } else if (glitch == 2) {
             glitchThis('marcel');
             glitch = 3;
         } else if (glitch == 3) {
             glitchThis('backyard');
             glitch = 0;
         }
     }
});

$(document).on('touch tap click', '.likeControl', function(){
    if (!$(this).hasClass('liked')) {
        var postId = $(this).attr('id').split('_')[1];
        $('#like_'+postId).addClass('liked');
        if ($('#feed_'+postId+' .likedSection').html() == '') {
            $('#feed_'+postId+' .likedSection').html('<span class="colouredText">1</span> person likes this');
        } else {
            likedText = '<span class="colouredText">'+(parseInt($('#feed_'+postId+' .likedSection .colouredText').html()) + 1)+'</span> people like this';
            $('#feed_'+postId+' .likedSection').html(likedText);   
        }
        gameUpdate('updateLocal','data','1','liked',postId);
    }
});

$(document).on('touch tap click', '.commentControl.usableControls:not(.choiceBeing)', function(){
    var postId = $(this).attr('id').split('_')[1];
    $('#comment_'+postId).addClass('choiceBeing');
    choiceControls.create($(this).attr('data-id'),'feed_'+postId,'comment','comment_'+postId,$(this).attr('data-choice1'),$(this).attr('data-choice2'),$(this).attr('data-choice3'));                
});

$(document).on('touch tap click', '.objectError', function(){
    $(this).find('.hiddenObjectData').toggle();
});

$(document).on('click touch', '#userNav div', function() {
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

$(document).on('click touch', '.aboutItem', function() {
    $('.aboutItem').removeClass('current');
    $(this).addClass('current');
    $('.aboutContents').hide();
    $('.'+$(this).attr('id')).show();
});

$(document).on('touch tap click', '.userLink', function(e) {
    var classList = $(this).attr('class').split(/\s+/);
    $.each(classList, function(index, item) {
        if (item.indexOf("username_") >= 0) {
            var userid = item.split('_')[1];
            if (userid == "1") {
                $("#Robin").click();
            } else if (userid == "2" && localStorage.getObject('gameData')['users'][2]['friended'] == 1) {
                $("#Cal").click();
            }  else if (userid == "3") {
               // $("#Ambrose").click();
               notificationTimers.add(3,22,"God damnit it\'s a bloopel",5);
            }
        }
    });
});

$(document).on('touch tap click', '.choice:not(.choiceProcessing)', function(e) {
    var parentNode = $(this).parent();
    debugNotice(timestampify() + ' - CHOICE CLICKED - ' + parentNode.data("choiceid") + ' - ' + parentNode.attr('id') + ' - ' + parentNode.data("targettype"),0);
    parentNode.children().each(function() {
        $(this).addClass('choiceProcessing');  
    })
    if (parentNode.data("remove") != '') {
        $('#'+parentNode.data("remove")).removeClass('choiceBeing').addClass('commented');
    }
    choiceControls.choose(parentNode.data("choiceid"),$(this).attr('id'),parentNode.data("targettype"));
});
    
var range = {};

$(window).on('scroll', $.debounce(100,scrollDebouncer));

function scrollDebouncer() {
    if (Math.floor($(document).height() - $(document).scrollTop() - $(window).height()) < 600) {
        loadInfinite(currentPage,1);
    } else if ($(document).scrollTop() < 600) {
        loadInfinite(currentPage,0);
    }
}


function unreadDebouncer() {
    if ($(document).find("title").text() == 'Twaddle - Messages') {
        var windowTop = Math.max($('body').scrollTop(), $('html').scrollTop());
        var windowBottom = $(window).height() + windowTop;
        $('.messageCont').each(function() {
            if ($(this).position().top > windowTop && $(this).position().top < windowBottom ) {
                if ($(this).hasClass('unread')) {
                    $(this).removeClass('unread');
                    var msgId = $(this).attr('id');
                    removeUnread(currentlyViewing,msgId,$(this).find('.sentOn').attr('data-date'));
                }
            }
        });
    }
}

function loadInfinite(page, direction) {
    if (direction == 1 && page == 'feed' || direction == 1 && page == 'robin' || direction == 1 && page == 'cal') {
        debugNotice(timestampify()+'Building more feed based off infinite scroll',0);
        if (Math.floor($(document).height() - $(document).scrollTop() - $(window).height()) == 0) {
            $(document).scrollTop($(document).height());
        }
        var user = 0
        if (page == 'robin') {
            user = 1;
        } else if (page == 'cal') {
            user = 2;
        }
        debugNotice(user + ' - ' + page,0);
        var total = 0;
        var loop = 0;
        $.each(localStorage.getObject('gameData').posts.reverse(), function(day,dayData) {
            if (total < 5) {
                //debugNotice(dayData);
                var arr = [];
                for (var name in dayData) {
                    if (feedCheck.indexOf(dayData[name]['postId']) < 0) {
                        arr[name] = dayData[name];
                    }
                }
                var len = arr.length;
                $.each(arr.reverse(), function(index,value) {
                    if (total < 5) {
                        if (value != undefined && localStorage.getObject('gameData')['users'][value['user']]['friended'] == 1) {
                            if (user == 0 || user == value['user']) {
                                feed.individualPost(value,1,'feedContent','append'); 
                                total++;
                            }
                        }
                        loop++;
                    }
                });
            }
        });
        $('#loadingWrapper').remove();
        $('.loadingFeed').remove();
        if (total == 5) {
            debugNotice('Adding loading',0);
            $('#feedContent').append(loading);
        }
    } else {
        //Maybe put something in here later, do some tests
    }
}

/*

 _______ _________ _______  _______ 
(       )\__   __/(  ____ \(  ____ \
| () () |   ) (   | (    \/| (    \/
| || || |   | |   | (_____ | |      
| |(_)| |   | |   (_____  )| |      
| |   | |   | |         ) || |      
| )   ( |___) (___/\____) || (____/\
|/     \|\_______/\6_______)(_______/
                        

*/

// Notifications section

// Determine the correct object to use
var notification = window.Notification || window.mozNotification || window.webkitNotification;

var webNotifications = 0;
var mobNotifications = 0;

// The user needs to allow this
if ('undefined' !== typeof notification) {
    notification.requestPermission(function(permission){});
    webNotifications = 1;
}

var ua = navigator.userAgent.toLowerCase();
var isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

if(isAndroid && app) {
    mobNotifications = 1;
    deviceData['type'] = 1;
} else if (isAndroid) {
    deviceData['type'] = 1;
}

// A function handler
function spawnNotification(theBody,theIcon,theTitle)
{
    if (webNotifications == 1) {
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
        return true;
    } 
}

var notificationTimers = [];

var notificationEvents = [];

notificationTimers.add = function(user,id,message,time,type) {
   var now = new Date().getTime();
   var soon = new Date(now + time * 1000);
   var shortData = message;
    if (type == 'message') {
        var typeId = 100;
        var title = 'New Messages';
        var notId = typeId.toString()+id.toString();
        notificationEvents[notId] = 'message_'+user;
    } else if (type == 'post') {
        var typeId = 200;
        var notId = typeId.toString()+id.toString();
        var title = 'New Posts';
        notificationEvents[notId] = 'feed_'+user;
    }
    if (shortData.length > 30) {
        shortData = shortData.substr(0,30) + '...';
    }
    debugNotice(timestampify()+'Adding notification '+notId+' ('+typeId+' '+id+') for '+user+' with '+type+' '+message+' to be done at '+soon+ ' ('+time+')',0);
    var body = localStorage.getObject('gameData')['users'][user]['firstname'] + ': ' + shortData;
    if (deviceData['type'] == 1) {
        cordova.plugins.notification.local.isPresent(notId, function (present) {
            if (present) {
                debugNotice('Duplicate '+notId+'! Listing notifications',0);
                cordova.plugins.notification.local.getAll(function (notifications) {
                    debugNotice(notifications,0);
                });
            } else {
                cordova.plugins.notification.local.schedule({
                    id:notId,
                    text: body,
                    at: soon,
                    title: title,
                    icon: "file://"+ localStorage.getObject('gameData')['users'][user]['avatar'],
                    smallIcon: "res://ic_stat_notif",
               });
            }
        });
    } else {
        debugNotice(timestampify()+'Blocking notification because Desktop',0);
    }

}

notificationTimers.remove = function(id) {
    cordova.plugins.notification.local.cancel(id, function() {
        alert("Message "+id+" cancellend");
    });
}

notificationTimers.trigger = function() {
    cordova.plugins.notification.local.on("click", function (notification, state) {
        var notificationData = notificationEvents[notification.id].split('_');
        if (notificationData[1] == 'feed') {
            window.location.href = 'index.html?page=feed';
        } else {
            window.location.href = 'index.html?page=messages?id='+notificationData[2];
        }
    }, this);   
    
    cordova.plugins.notification.local.on("schedule", function(notification) {
        debugNotice(timestampify()+'Scheduled '+notification.id,0);
        debugNotice(notification,0);
    });
    cordova.plugins.notification.local.on("trigger", function(notification) {
        debugNotice(timestampify()+'Triggered '+notification.id,0);
        debugNotice(notification,0);
    });
};

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

function createTimestamp(timeFrom, dayDif) {
    var d = new Date();
    d.setHours(0,0,0,0);
    if (dayDif != undefined && dayDif != 0) {
        var newDateObj = new Date(d.getTime() + (timeFrom*60000) - (dayDif * 86400000));
    } else {
        var newDateObj = new Date(d.getTime() + (timeFrom*60000));   
    }
    return newDateObj.getTime() / 1000;
}
emergencyStop = setInterval(
    function() {
        updateTheDateTime()
    },60000);

function updateTheDateTime() {
    $('.dateUpdate').each(function() {
        $(this).html(time.wordify($(this).attr('data-date')));
    });
}

sendQueue = setInterval(
    function() {
        updateQueue();
    },3000);

function updateQueue() {
    $.each(localStorage.getObject('gameSettings').sendQueue, function(index,value) {
        emitChoice(index,value[0],value[1]); 
    });
}

$('.resetLoading').on('click touch', function() {
    window.localStorage.clear();
    window.location.replace("startup.html?connection=error");   
})

function timestampify() {
    var currentdate = new Date(); 
    currentdate = new Date(currentdate.getTime())
    var datetime = "[" + currentdate.getDate() + "/"
                       + (currentdate.getMonth()+1) +' @ '
                       + currentdate.getHours() + ":"  
                       + currentdate.getMinutes() + ":" 
                       + currentdate.getSeconds() + "] ";  
                       
    return datetime;
}
/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else {
  // browser global
  window.classie = classie;
}

})( window );

$(document).on("pagecontainerbeforechange", function (e, data) {
    if (typeof data.toPage == "string" && data.options.direction == "back" && document.title != 'Twaddle - A social media for the everyman') {
        return false;
        $('#newsFeedLink').click();
    } else if (typeof data.toPage == "string" && data.options.direction == "back" && document.title == 'Twaddle - A social media for the everyman') {
        return true;
    }
});

function getQueryVariable(variable)
{
   var query = window.location.search.substring(1);
   var vars = query.split("&");
   for (var i=0;i<vars.length;i++) {
           var pair = vars[i].split("=");
           if(pair[0] == variable){return pair[1];}
   }
   return(false);
}

function vibrateTest() {
    if (deviceData['type'] == 1) {
        navigator.vibrate([100, 100, 100]);
    }
}

function beepTest() {
    if (deviceData['type'] == 1) {
        debugNotice(timestampify()+'I WAS MEANT TO BEEEEEP',0);
        navigator.notification.beep();
    }
}

function onSuccess(contacts) {
    alert('Found ' + contacts.length + ' contacts.');
    debugNotice(timestampify()+contacts,0);
};

function onError(contactError) {
    alert('onError!');
};

function getContacts() {
    if (deviceData['type'] == 1) {
        // find all contacts with 'Bob' in any name field
        var options      = new ContactFindOptions();
        options.filter   = "*";
        options.multiple = true;
        options.desiredFields = [navigator.contacts.fieldType.id];
        options.hasPhoneNumber = true;
        var fields       = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name];
        navigator.contacts.find(fields, onSuccess, onError, options);
    }
}

var rotTest;
var rotTimeout;
var rotReset = Date.now() + 400000;
var rotBeen = 0;

function handleOrientation(event) {
    var absolute = event.absolute;
    var alpha = event.alpha;
    var beta = event.beta;
    var gamma = event.gamma;


    var text = 'Orientation: ' + absolute


    if (!alpha) {
        text += '<br>Your device has no compass ';
    } else {
        text += '<br>alpha: ' + alpha
        text += '<br>beta: ' + beta
        text += '<br>gamma: ' + gamma + '<br>'
            // Do stuff with the new orientation data
        if (Math.abs(beta) + Math.abs(gamma) < 4) {
            if (rotBeen == 0 && Date.now() > rotReset) {
                rotTimeout = setTimeout(function() {glitchThis('marcel');rotReset = Date.now() + 400000;},1000);
                rotBeen = 1;
            }
            text += 'Your Device is probably laying on a Table';
        } else {
            clearTimeout(rotTimeout);
            rotBeen = 0;
            text += 'Your Device is probably in your Hands';
        }
    }
    
    rotTest = text;
}

if (window.DeviceOrientationEvent) {
  // Listen for the event and handle DeviceOrientationEvent object
  window.addEventListener('deviceorientation', $.debounce(100,handleOrientation), false);
}

if(canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    ctx.strokeStyle = 'rgba(174,194,224,0.5)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    
    
    var init = [];
    var maxParts = 20;
    for(var a = 0; a < maxParts; a++) {
      init.push({
        x: Math.random() * w,
        y: Math.random() * h,
        l: Math.random() * 1,
        xs: -4 + Math.random() * 4 + 2,
        ys: Math.random() * 10 + 10
      })
    }
    
    var particles = [];
    for(var b = 0; b < maxParts; b++) {
      particles[b] = init[b];
    }
    
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for(var c = 0; c < particles.length; c++) {
        var p = particles[c];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
        ctx.stroke();
      }
      move();
    }
    
    function move() {
      for(var b = 0; b < particles.length; b++) {
        var p = particles[b];
        p.x += p.xs;
        p.y += p.ys;
        if(p.x > w || p.y > h) {
          p.x = Math.random() * w;
          p.y = -20;
        }
      }
    }
    
     $(document).on('touch tap click', '.username_2', function(e) {
         setInterval(draw, 30);
    });

}
