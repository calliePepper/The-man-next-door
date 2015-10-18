            Storage.prototype.setObject = function(key, value) {
                this.setItem(key, JSON.stringify(value));
            }
            
            Storage.prototype.getObject = function(key) {
                var value = this.getItem(key);
                return value && JSON.parse(value);
            }
            
            var gameUpdate = {};
            
            gameUpdate.updateTime = function() {
                var currentTime = Math.floor(Date.now() / 1000);
                var tempData = localStorage.getObject('gameData');
                tempData.lastUpdate = currentTime;
                localStorage.setObject('gameData',tempData);
            }

            var choiceControls = {};
            
            choiceControls.create = function(choiceId,target,targetType,remove,choice1,choice2,choice3) {
                $('.choice').unbind();
                var choiceString = '';
                if (choice1!=0) {choiceString += '<div id="choice1" class="choice btn">'+choice1+'</div>';}
                if (choice2!=0) {choiceString += '<div id="choice2" class="choice btn">'+choice2+'</div>';}
                if (choice3!=0) {choiceString += '<div id="choice3" class="choice btn">'+choice3+'</div>';}
                $('#'+target).append('<div id="choiceBlock" class="choiceBlock">'+choiceString+'</div>');
                $('#choiceBlock').css('max-height','300px');
                $('.choice').on('click touch', function() {
                    choiceControls.choose(choiceId,$(this).attr('id'),targetType);
                    if (remove != '') {
                        $('#'+remove).removeClass('choiceBeing');
                    }
                });
            }

            choiceControls.choose = function(id,choice,targetType) {
                var theChoice = $('#'+choice).html();
                if (targetType == 'comment') {
                    commentsString = '<div class="comments">';
                    var commentSince = time.wordify(Math.floor(Date.now() / 1000));
                    var usersAvatar = totalData['users'][0]['avatar'];
                    var usersFirstname = totalData['users'][0]['firstname'];
                    var usersLastname = totalData['users'][0]['lastname'];
                    var imageComments = '';
                    var likedComments = '';
                    commentsString += '<div class="comment"><div class="commentAvatar"><img class="avatar" src="img/'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><span class="commentBy">'+usersFirstname+'</span><span class="commentContent">'+theChoice+'</span>'+imageComments+'<div class="commentFooter">'+likedComments+commentSince+'</div></div>';
                    commentsString += '</div>';
                    $('#choiceBlock').parent().find('.comments').append(commentsString);
                    $('#choiceBlock').remove();
                } else if (targetType == 'message') {
                    var date = time.date(Math.floor(Date.now() / 1000));
                    var usersAvatar = totalData['users'][0]['avatar'];
                    var usersFirstname = totalData['users'][0]['firstname'];
                    var usersLastname = totalData['users'][0]['lastname'];
                    var imageLink = '';
                    var fromText = '<i class="fa fa-desktop"></i><span class="sentFrom">Sent from desktop</span>';
                    //if (value['from'] == 1){var fromText = '<i class="fa fa-mobile"></i><span class="sentFrom">Sent from mobile</span>';} else {var fromText = '<i class="fa fa-desktop"></i><span class="sentFrom">Sent from desktop</span>';}
                    $('#messagesCont').append('<div class="messageCont"><img class="messageAvatar" src="img/'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /><div class="sentOn">'+fromText+date+'</div><div class="messageName">'+usersFirstname+'</div><div class="messageContents">'+theChoice+'</div></div>');
                    $('#messages').scrollTop($('#messages')[0].scrollHeight); 
                    $('#choiceBlock').remove();
                }
            }
            
            var users = {}
            
            users.load = function() {
                $.each(totalData['users'], function(index, value) {
                    if (index != 0 && value['friended'] == 1) {
                        var isCurrent ='';
                        if ($(document).find("title").text() == value['firstname'] + ' ' + value['lastname']) {
                            isCurrent = 'current';
                        }
                        $('#sideBar').append('<a id="'+value['firstname']+'" href="'+value['firstname']+'" class="friend sideLink '+isCurrent+'"><img src="img/'+value['avatar']+'" class="navAvatar mobile" alt="Navigation avatar" /><i id="userIcon" class="desktop fa fa-user"></i>'+value['firstname']+' '+value['lastname']+'</a>');    
                    }
                });
            }
            
            var messages = {}
            
            messages.init = function() {
                var firstMessages = {};
                var orderedUsers = [];
                var thisUser = '';
                var firstUser = 0;
                var firstMessage = 0;
                $.each(totalData['messages'], function(index,value) {
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
                console.log(orderedUsers);
            }
            
            messages.load = function(id) {
                $('#messagesCont').html('');
                var firstMessages = {};
                var thisUser = '';
                currentlyViewing = id;
                $.each(totalData['messages'], function(index,value) {
                    if (value['toId'] == id) {
                        var usersAvatar = totalData['users'][value['fromId']]['avatar'];
                        var usersFirstname = totalData['users'][value['fromId']]['firstname'];
                        var usersLastname = totalData['users'][value['fromId']]['lastname'];
                        thisUser = usersFirstname + ' ' + usersLastname;
                        var date = time.date(value['date']);
                        var imageLink = '';
                        if (value['image'] != '') {
                            imageLink = '<img src="img/'+value['image']+'" alt="user image" class="feedImage" />';
                        }
                        if (value['from'] == 1){var fromText = '<i class="fa fa-mobile"></i><span class="sentFrom">Sent from mobile</span>';} else {var fromText = '<i class="fa fa-desktop"></i><span class="sentFrom">Sent from desktop</span>';}
                        $('#messagesCont').append('<div class="messageCont"><img class="messageAvatar" src="img/'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /><div class="sentOn">'+fromText+date+'</div><div class="messageName">'+usersFirstname+' '+usersLastname+'</div><div class="messageContents">'+value['text']+'</div>'+imageLink+'</div>');
                        $('#messages').scrollTop($('#messages')[0].scrollHeight); 
                    }
                });
                $('#messagesCont').prepend('<div class="messagesStart">Conversation started</div>');
                $('.messageTitle').html('&lt; '+thisUser);
                $('#messagesCont').scrollTop($('#messagesCont')[0].scrollHeight);
            }
            
            messages.create = function(userId,time,content,image,from) {
                return new message(userId,time,content,image,from);
            }
            
            messages.users = function(firstMessages) {
                 $('#messageList').html('');
                 var counter = 1;
                 $.each(firstMessages, function(index,value) {
                    var usersAvatar = totalData['users'][value['index']]['avatar'];
                    var usersFirstname = totalData['users'][value['index']]['firstname'];
                    var usersLastname = totalData['users'][value['index']]['lastname'];
                    if(value['text'].length > 15) value['text'] = value['text'].substring(0,15) + '...';
                    $('#messageList').append('<div class="messageUserList" id="messageLink_'+value['index']+'"><img class="messageAvatar" src="img/'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /><div class="sentOn">'+value['dateTime']+'</div><div class="messageName">'+usersFirstname+' '+usersLastname+'</div><div class="messageContents">'+value['text']+'</div></div>');
                    if (counter == 1) {
                        $('#messageLink_'+value['index']).addClass('current');
                        counter++;
                    }
                });
                var mq = window.matchMedia('screen and (max-width:900px)');
                    if(mq.matches) {
                        $('.messageUserList').on('click touch', function() {
                            var userId = $(this).attr('id').split('_')[1];
                            messages.load(userId);
                            $('.messageList').toggleClass('flipped');
                            $('.messages').toggleClass('flipped');
                            $('#messagesCont').scrollTop($('#messagesCont')[0].scrollHeight);
                        });
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
                                $('#messagesCont').scrollTop($('#messagesCont')[0].scrollHeight);
                            }
                        });
                    }
            }
            
            var messageQueue = [];
            
            messages.new = function(messageFrom,messageTo,cameIn,text,ttw,fullMessage) {
                console.log(messageFrom);
                console.log('New message from '+totalData.users[messageFrom].firstname+' at '+cameIn);
                if ($(document).find("title").text() == 'Twaddle - Messages') {
                    if (currentlyViewing == messageFrom) {
                        $('#messagesCont').append('<div id="typing" class="typing">'+totalData.users[messageFrom].firstname+' is typing...</div>');
                        setTimeout(function() {
                            $('#typing').remove();
                            if (currentlyViewing == messageFrom) {
                                var usersAvatar = totalData['users'][fullMessage['fromId']]['avatar'];
                                var usersFirstname = totalData['users'][fullMessage['fromId']]['firstname'];
                                var usersLastname = totalData['users'][fullMessage['fromId']]['lastname'];
                                thisUser = usersFirstname + ' ' + usersLastname;
                                var date = time.date(fullMessage['date']);
                                var imageLink = '';
                                if (fullMessage['image'] != '') {
                                    imageLink = '<img src="img/'+fullMessage['image']+'" alt="user image" class="feedImage" />';
                                }
                                if (fullMessage['from'] == 1){var fromText = '<i class="fa fa-mobile"></i><span class="sentFrom">Sent from mobile</span>';} else {var fromText = '<i class="fa fa-desktop"></i><span class="sentFrom">Sent from desktop</span>';}
                                $('#messagesCont').append('<div class="messageCont"><img class="messageAvatar" src="img/'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /><div class="sentOn">'+fromText+date+'</div><div class="messageName">'+usersFirstname+' '+usersLastname+'</div><div class="messageContents">'+fullMessage['text']+'</div>'+imageLink+'</div>');
                                $('#messages').scrollTop($('#messages')[0].scrollHeight); 
                            }
                            if(text.length > 15) text = text.substring(0,15) + '...';
                            var date = time.minidate(cameIn);
                            $('#messageLink_'+messageFrom).find('.sentOn').html(date);
                            $('#messageLink_'+messageFrom).find('.messageContents').html(text);
                            $('#messageLink_'+messageFrom).addClass('pulse');
                            setTimeout(function() {$('#messageLink_'+messageFrom).removeClass('pulse');},1000);
                            if (!visibleChangeHandler()) {
                                spawnNotification('You have a new message from '+totalData.users[messageFrom].firstname,'img/'+totalData.users[messageFrom].avatar,'New Message');
                            }
                        },ttw);
                    } else {
                        setTimeout(function() {
                            if(text.length > 15) text = text.substring(0,15) + '...';
                            var date = time.minidate(cameIn);
                            $('#messageLink_'+messageFrom).find('.sentOn').html(date);
                            $('#messageLink_'+messageFrom).find('.messageContents').html(text);
                            $('#messageLink_'+messageFrom).addClass('pulse');
                            setTimeout(function() {$('#messageLink_'+messageFrom).removeClass('pulse');},1000);
                            if (!visibleChangeHandler()) {
                                spawnNotification('You have a new message from '+totalData.users[messageFrom].firstname,'img/'+totalData.users[messageFrom].avatar,'New Message');
                            }
                        },ttw);
                    }
                } else {
                    if ($('#messagesLink').find('.totalNew').html() == '') {
                        $('#messagesLink').find('.totalNew').html('1');
                    } else {
                        $('#messagesLink').find('.totalNew').html(parseInt($('#messagesLink .totalNew').html()) + 1);   
                    }
                }
            }
            
            messages.packed = function(messageArray,choices) {
                var counter = 0;
                var userForMsg = 0;
                function loopMessages() {
                    var typingTime = messageArray[counter].text.length * totalData['users'][messageArray[counter].fromId]['typingSpeed'];
                    console.log('Looping through message of length '+messageArray[counter].text.length+' next message should send in '+typingTime);
                    messages.new(messageArray[counter].fromId,messageArray[counter].toId,messageArray[counter].date,messageArray[counter].text,typingTime,messageArray[counter]);
                    userForMsg = messageArray[counter].toId;
                    counter++;
                    if (messageArray[counter] != undefined) {
                       setTimeout(function() {
                            loopMessages();
                       },typingTime + totalData['users'][messageArray[counter].fromId]['waitTime']);
                    } else if (choices != undefined) {
                        setTimeout(function() {
                            choiceControls.create(choices.choiceId,'messagesCont','message','',choices.choice1,choices.choice2,choices.choice3);
                        },typingTime + totalData['users'][userForMsg]['waitTime']);
                    }
                }
                loopMessages()
            }
            
            var time = {}
            
            time.wordify = function(newTimes) {
                var currentTime = Math.floor(Date.now() / 1000);
                var difference = (currentTime - newTimes) / 60;
                if (difference < 60) {
                    return Math.floor(difference)+' minutes ago';
                } else if (difference / 60 < 24) {
                    return Math.floor(difference/60)+' hours ago';
                } else {
                    return Math.floor(difference/60/24)+' days ago';
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

            var feed = {};

            feed.create = function(target,objects) {
                $.each(objects, function(index,value) {
                    if (totalData['users'][value['user']]['friended'] == 1) {
                        var imageLink = '';
                        if (value['image'] != '') {
                            imageLink = '<img src="img/'+value['image']+'" alt="user image" class="feedImage" />';
                        }
                        var likedText = '';
                        if (value['likes'] != '') {
                            likedText = '<span class="colouredText">'+value['likes']+'</span> people like this';
                        }
                        var sinceText = time.wordify(value['date']);
                        var usersAvatar = totalData['users'][value['user']]['avatar'];
                        var usersFirstname = totalData['users'][value['user']]['firstname'];
                        var usersLastname = totalData['users'][value['user']]['lastname'];
                        var commentsString = '';
                        if (value['comments'].length > 0) {
                            commentsString = '<div class="comments" id="comments_'+index+'">';
                            $.each(value['comments'], function(index,value) {
                                var commentSince = time.wordify(value['date']);
                                var usersAvatar = totalData['users'][value['user']]['avatar'];
                                var usersFirstname = totalData['users'][value['user']]['firstname'];
                                var usersLastname = totalData['users'][value['user']]['lastname'];
                                var imageComments = '';
                                if (value['image'] != '') {
                                    imageComments = '<img src="img/'+value['image']+'" alt="user image" class="feedImage" />';
                                }
                                var likedComments = '';
                                if (value['likes'] != '') {
                                    likedComments = '<span class="colouredText commentLikes"><i class="fa fa-thumbs-up"></i>'+value['likes']+'</span>';
                                }
                                commentsString += '<div class="comment"><div class="commentAvatar"><img class="avatar" src="img/'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><span class="commentBy">'+usersFirstname+' '+usersLastname+'</span><span class="commentContent">'+value['text']+'</span>'+imageComments+'<div class="commentFooter">'+likedComments+commentSince+'</div></div>';
                            });
                            commentsString += '</div>';
                        }
                        $('#'+target).append('<div id="feed_'+index+'" class="feedObject" ><div class="innerFeed"><div class="feedHeader"><div class="feedAvatar"><img class="avatar" src="img/'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><div class="postedBy">'+usersFirstname+' '+usersLastname+'</div><div class="date">'+sinceText+'</div></div><p>'+value['text']+'</p>'+imageLink+'<div class="feedControls"><span class="feedControl likeControl" id="like_'+index+'"><i class="fa fa-thumbs-up"></i>Like</span><span id="comment_'+index+'" class="feedControl commentControl"><i class="fa fa-comment"></i>Comment</span></div></div><div class="likedSection">'+likedText+'</div>'+commentsString+'</div>');
                    }
                });
            }      
            
            feed.new = function() {
                if ($(document).find("title").text() == 'Twaddle - A social media for the everyman') {
                    $('#feedContent').prepend('<div id="feed_news" class="feedObject"><div class="innerFeed newObject"><i class="fa fa-refresh"></i>New feed posts, reload to see them</div></div>');
                }
                if ($('#newsFeedLink').find('.totalNew').html() == '') {
                    $('#newsFeedLink').find('.totalNew').html('1');
                } else {
                    $('#newsFeedLink').find('.totalNew').html(parseInt($('#newsFeedLink .totalNew').html()) + 1);   
                }
            }
            

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
                    console.log('notification.Click');
                };
                noty.onerror = function () {
                    console.log('notification.Error');
                };
                noty.onshow = function () {
                    console.log('notification.Show');
                };
                noty.onclose = function () {
                    console.log('notification.Close');
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
            
            
            //Mobile navigation binding
        
            $('#mobileNav').on('click touch', function() {
                $('#feedContent').toggleClass('navFlip');
                $('.sideBar').toggleClass('navFlip');
            });
            
            
            var socket = io();
        
            
