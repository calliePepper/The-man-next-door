
var data = localStorage.getObject('dataCache');

clientData = {};
var sendQueue = [];

function triggerCheck(backlog) {
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
            debugNotice(timestampify()+'omg first load',0);
            lastUpdate = 1440;
            var tempData = localStorage.getObject('gameSettings');
            tempData.firstLoad = 0;
            firstLoadTime = 1;
            localStorage.setObject('gameSettings',tempData);
        }
        debugNotice(timestampify()+'Retrieving data',0);
        var page = {
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
        };
        triggerStart(page);
        firstRun = 0;
    }, timerSet);
}

function triggerStart(page) {
    debugNotice(page,0);
	var compDate = getPoint(page.startTime,page.currentTime,page.timezone); 
	var currentDay = compDate.day;
	var timeThroughDay = Math.round(compDate.timeThrough);
	if (page.lastUpdate != 1440) {
	    var tempLastUpdate = new Date(page.lastUpdate);
	    var tempCurrent = new Date(page.currentTime);
        var updatedLast = Math.abs(tempLastUpdate.getTime() - tempCurrent.getTime());
        updatedLast =  Math.ceil(updatedLast / (1000 * 3600 * 24));
	} else {
		var updatedLast = page.lastUpdate;
	}
	debugNotice(timestampify()+'Last updated '+updatedLast+' mins ago',0);
	clientData['name'] = page.playerName;
	clientData['timezone'] = page.timezone;
	clientData['lastUpdated'] = updatedLast;
	clientData['friends'] = {};
	for (user in page.users) {
	    if (!page.users.hasOwnProperty(user)) {
			continue;   	
	    }
	    clientData['friends'][user] = page.users[user].friended;
	}
	clientData['reg'] = page.reg;
	clientData['device'] = page.mob;
	queueFunc.update(currentDay,timeThroughDay,updatedLast,page.firstLoad);
	if (page.firstLoad == 1) {
		newMessage({messageItem:data.messageObjects[0],choices:data.choiceObjects[0],noNote:0,queueDay:1});
		$('#overlayData').show().addClass('md-modal').addClass('md-effect-11').addClass('md-show');
		$('#overlay').show();
		$('.endWelcome').on('click touch', function() {
			$('.endWelcome').off();
            $('#underlayData').removeClass();
            $('#underlayData').html("");
			$('#overlay').hide();
		})
		$('#moreInfoBtn').on('click touch', function() {
			$('#moreInfoBtn').off();
			$('#firstInfo').hide();
			$('#moreInfo').show();
		})
	}
	hideLoad();
};

function choiceMade(replyData) {
	debugNotice(timestampify()+replyData.playerName+' came across choice '+replyData.choiceId+' and took path '+replyData.choiceMade,0);	
	if (data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade] != 0) {
		if (data.choiceObjects[replyData.choiceId].resultType == 'comment') {
			var resultTest = 'result'+replyData.choiceMade;
			var commentResult = data.commentObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]];
			if (commentResult != 0) {
				var choiceResult = '';
				if (data.commentObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]].autoTarget == 'choice') {
					var choiceResult = data.choiceObjects[data.commentObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]].autoId]
				}
				//commentResult.feedId = replyData.additionalTarget;
				var object2 = {
					timeStamp:0,
					type:'comment',
					data:commentResult,
					choice:choiceResult,
					id: data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade],
					queueDay:0,
					userDay:5,
					dayDifference: 0,
					noNote:0,
					ignoreTime:1,
					fromChoice:replyData.choiceId
				};
				sendQueue.push(object2);
				organiseQueue();
			}
		} else if (data.choiceObjects[replyData.choiceId].resultType == 'message') {
			var messageResult = data.messageObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]];
			var choiceResult = '';
			if (data.messageObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]].autoTarget == 'choice') {
				var choiceResult = data.choiceObjects[data.messageObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]].autoId]
			}
			if (choiceResult != 0) {
				choiceResult.additionalTarget = replyData.additionalTarget;
				var object2 = {
					timeStamp:0,
					type:'message',
					data:messageResult,
					choice:choiceResult,
					id: data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade],
					queueDay:getPoint(localStorage.getObject('gameSettings').startTime,new Date(),localStorage.getObject('gameSettings').timezone).day,
					userDay:5,
					dayDifference: 0,
					noNote:0,
					fromChoice:replyData.choiceId
				};
				sendQueue.push(object2);
				organiseQueue();
			}
		} else if (data.choiceObjects[replyData.choiceId].resultType == 'effect') {
			
		}
	
		receivedChoice({choiceId:replyData.choiceId});
	}
};

function anotherMessage(replyData) {
	debugNotice(timestampify()+replyData.playerName+' asked for another message (Message: '+replyData.nextId+'). No note is '+replyData.noNote,1);	
	var messageItem = data.messageObjects[replyData.nextId];
	var choiceResult = '';
	if (messageItem.autoTarget == 'choice') {
		var choiceResult = data.choiceObjects[messageItem.autoId]
	}
	messageItem.noNote = replyData.noNote;
	debugNotice(messageItem,1);
	newMessage({messageItem:messageItem,choices:choiceResult,queueDay:messageItem.day,noNote:replyData.noNote});
};
	

function getPoint(start,currentTime,timezone) {
    start = new Date(start);
    currentTime = new Date(currentTime);
    startMidnight = new Date(start);
    thisMidnight = new Date(currentTime);
	startMidnight.setHours(0,0,0);
	thisMidnight.setHours(0,0,0);
	var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
	var diffDays = Math.round(Math.abs((currentTime.getTime() - start.getTime())/(oneDay)));
	day = diffDays;
	var timeDiff = Math.abs(currentTime.getTime() - thisMidnight.getTime());
	debugNotice(timeDiff,0);
	var timeThroughDay =  Math.ceil(timeDiff / (1000 * 60));
	debugNotice('Day: ' + day + '.Start time is '+start+'. Current time is '+currentTime+'. Time through day is '+timeThroughDay,0);
	return {day:day+1,timeThrough:timeThroughDay};
}


function organiseQueue() {
	function compare(a,b) {
		var aDiff = a.userDay - a.queueDay;
		var bDiff = b.userDay - b.queueDay;
		if (a.queueDay < b.queueDay)
			return -1
		if (b.queueDay < a.queueDay)
			return 1
      	if (a.timeStamp < b.timeStamp || aDiff > bDiff) 
        	return -1;
      	if (a.timeStamp > b.timeStamp || bDiff > aDiff)
        	return 1;
      	return 0;
	}
    
    sendQueue.sort(compare);
}

var watcher = setInterval(function() {
	if (sendQueue.length > 0) {
		queueFunc.check();
	}	
},800);

var queueFunc = {};

queueFunc.add = function(day,timeStampToHit,timeThroughDay,userDay,noNote) {
	if (timeStampToHit != 0) {
		if (data.events[day][timeStampToHit]['object'] == 'feedObjects') { var type = 'feed'; 
		} else if (data.events[day][timeStampToHit]['object'] == 'commentObjects') { var type = 'comment'; 
		} else if (data.events[day][timeStampToHit]['object'] == 'messageObjects') { var type = 'messages'; }
		debugNotice(data.events[day][timeStampToHit]['object'],0);
		debugNotice(data.events[day][timeStampToHit]['id'],0);
		debugNotice(data[data.events[day][timeStampToHit]['object']][data.events[day][timeStampToHit]['id']],0);
		if (data[data.events[day][timeStampToHit]['object']][data.events[day][timeStampToHit]['id']].autoTarget && data[data.events[day][timeStampToHit]['object']][data.events[day][timeStampToHit]['id']].autoTarget == 'choice') {
			var queueChoice = data.choiceObjects[data[data.events[day][timeStampToHit]['object']][data.events[day][timeStampToHit]['id']].autoId];
		} else {
			var queueChoice = '';
		}
		var dayDifTemp = userDay - day;
		debugNotice(timestampify()+'Update found, Type: '+type+', id: '+data.events[day][timeStampToHit]['id']+'. It is in '+parseInt(dayDifTemp)*-1+' day(s).',0);
		var tempStamp = new Date().getTime() / 1000;
		var objectToSave = data[data.events[day][timeStampToHit]['object']][data.events[day][timeStampToHit]['id']];
		var queueObject = {
			timeStamp:tempStamp + ((timeStampToHit - timeThroughDay) * 60),
			timeToHit:timeStampToHit,
			type:type,
			id:data.events[day][timeStampToHit]['id'],
			data:objectToSave,
			choice:queueChoice,
			queueDay:day,
			dayDifference: dayDifTemp,
			userDay:userDay,
			noNote:noNote
		};
		sendQueue.push(queueObject);
		if (type == 'messages' || type == 'message') {
    	    if (dayDifTemp < 0 && noNote == 0 || dayDifTemp == 0 && timeStampToHit - timeThroughDay > 0 && noNote == 0) {
    	    	var found = 0;
    	    	var counter = 0;
    	    	while (found == 0) {
    	    		if (objectToSave.messages[counter].message != undefined) {
	    				var shortData = objectToSave.messages[counter].message;
	    				var from = objectToSave.messages[counter].fromId;
	    				found = 1;
    	    		}
    	    		counter++;
    	    	}
    			if (shortData.length > 30) {
    				shortData = shortData.substr(0,30) + '...';
    			}
    			var timeDifferent = (dayDifTemp*-1) * 24 * 60 * 60 + parseInt((timeStampToHit - timeThroughDay) * 60);
    			debugNotice('Bloop',0);
                notificationTimers.add(from,data.events[day][timeStampToHit]['id'],shortData,timeDifferent,'message');
    		}
		}
		if (type == 'feed') {
		    if (localStorage.getObject('gameData').users[objectToSave['fromId']].friended == 1 && dayDifTemp < 0 || localStorage.getObject('gameData').users[objectToSave['fromId']].friended == 1 && dayDifTemp == 0 && timeStampToHit - timeThroughDay > 0) {
				var shortData = objectToSave.text;
				if (shortData.length > 30) {
					shortData = shortData.substr(0,30) + '...';
				}
				var timeDifferent = (dayDifTemp*-1) * 24 * 60 * 60 + parseInt((timeStampToHit - timeThroughDay) * 60);
                notificationTimers.add(objectToSave['fromId'],data.events[day][timeStampToHit]['id'],shortData,timeDifferent,'post');
			}
		}
		organiseQueue();
	}
}

queueFunc.getIndex = function(object) {
	var replyString = '';
	for (var i in object) {
		replyString = replyString + i + ',';
	}
	return replyString.substr(0,replyString.length-1);
}

queueFunc.update = function(day,timeThroughDay,updatedLast,noNote) {
	timeStampToHit = 0;
	var itemsQueued = 0;
	var itemsSent = 0;
	var currentDay = 0;
	var feedDone = 0;
	var messageDone = 0;
	function checkEvents(dayCheck) {
	    debugNotice(timestampify()+'Checking day '+dayCheck,0);
		for (var i in data.events[dayCheck]) {
			var notDone = 1;
			if (data.events[dayCheck][i].object == 'feedObjects') {
				if (localStorage.getObject('gameSettings').lastFeed[data.events[dayCheck][i].id] == 1)  {
					notDone = 0;
				}
			}
			if (data.events[dayCheck][i].object == 'commentObjects') {
				if (localStorage.getObject('gameSettings').lastComment[data.events[dayCheck][i].id] == 1) {
					notDone = 0;
				}
			}
			if (data.events[dayCheck][i].object == 'messageObjects') {
				if (localStorage.getObject('gameSettings').lastMessage[data.events[dayCheck][i].id] == 1) {
					notDone = 0;
				}
			}
			if (notDone == 1) {
				var dayDiff = day - dayCheck;
				var past = 1;
				if (i > timeThroughDay && dayDiff == 0 || dayDiff < 0) {
					past = 0;
				}
				queueFunc.add(dayCheck,i,timeThroughDay,day,past);
				if (past == 0 && data.events[dayCheck][i].object == 'feedObjects' || past == 0 && data.events[dayCheck][i].object == 'messageObjects') {
					itemsQueued++;
					if (data.events[dayCheck][i].object == 'feedObjects') { feedDone = 1;}
					if (data.events[dayCheck][i].object == 'messageObjects') { messageDone = 1;}
					if (messageDone == 1 && feedDone == 1) {
						break;
					}
				} else {
					itemsSent++;
				}
			}
		}
		if (currentDay < day || messageDone != 1 || feedDone != 1) {
			if (currentDay < 7) {
				currentDay++;
				checkEvents(currentDay);
			}
		}
	}
	checkEvents(currentDay);
	var timerCheck = localStorage.getObject('gameData');
	for (var i in localStorage.getObject('gameData').timers) {
		debugNotice(timestampify()+'Checking timer '+i,0);
		var now = Math.floor(Date.now() / 1000);
		if (now >= localStorage.getObject('gameData').timers[i].time) {
			var messageAim = data.messageObjects[localStorage.getObject('gameData').timers[i].id];
			if (messageAim.autoTarget == 'choice') {
				var choice = data.choiceObjects[messageAim.autoId];
			}
			if ($(document).find("title").text() == 'Twaddle - Messages') {
                if (currentlyViewing == i) {
                	$('.choiceBlock').hide();
                }
			}
			newMessage({messageItem:data.messageObjects[localStorage.getObject('gameData').timers[i].id],choices:choice,noNote:0,queueDay:data.messageObjects[localStorage.getObject('gameData').timers[i].id].day});
			gameUpdate('timerNull','data',i);
		}
	}
	var initialLength = sendQueue.length;
	sendQueue = uniqueTest(sendQueue);
	if (sendQueue.length > initialLength) {
		debugNotice(timestampify()+'Found '+parseInt(initialLength) - parseInt(sendQueue.length)+' duplicates',0);	
	} else {
		debugNotice(timestampify()+'No duplicates found',0);
	}
}

queueFunc.report = function(limit) {
	var current = new Date().getTime() / 1000
	if (limit == 0 || current % 600 <= 1) {
		var replyString = '';
		for (var i in sendQueue) {
			if (sendQueue[i].type == 'feed') {
				replyString += 'Type: Post, Id: '+sendQueue[i].data.postId+'|';
			} else if (sendQueue[i].type == 'comment') {
				replyString += 'Type: Comment, Id: '+sendQueue[i].data.commentId+'|';
			} else if (sendQueue[i].type == 'message') {
				replyString += 'Type: Message, Id: '+sendQueue[i].data.messageId+'|';
			}
		}
		debugNotice(timestampify()+'Queue update, total in queue is '+sendQueue.length+', next update in '+Math.floor((sendQueue[0]['timeStamp'] - current) / 60)+' minutes',0);
	}
}

queueFunc.check = function() {
	var current = new Date().getTime() / 1000
	var timer1 = new Date();
	queueFunc.report(1);
	var didSend = 0;
	if (current % 40 <= 1 && deviceData['type'] == 1) {
		setTimeout(function() {
			askForNotes();	
		},20000);
	}
	while (sendQueue[0] != undefined && sendQueue[0]['timeStamp'] <= current && sendQueue[0].queueDay == sendQueue[0].userDay || sendQueue[0] != undefined && sendQueue[0].queueDay < sendQueue[0].userDay ) {
		didSend = 1;
		//debugNotice(timestampify()+'Sending '+sendQueue[0]['type'] + '|'+sendQueue[0]['id']);
		if (sendQueue[0]['type'] == 'messages' || sendQueue[0]['type'] == 'message') {
			if (sendQueue[0]['fromChoice'] == undefined) {
				var choiceID = 'NA';
			} else {
				var choiceId = sendQueue[0]['fromChoice'];
			}
			localStorage.getObject('gameSettings').lastFeed[sendQueue[0]['id']] = 1;
			newMessage({messageItem:sendQueue[0]['data'],choices:sendQueue[0]['choice'],noNote:sendQueue[0].noNote,queueDay:sendQueue[0].queueDay,fromChoice:choiceId});
			gameUpdate('updateMessages','settings',sendQueue[0]['id']);
		} else if (sendQueue[0]['type'] == 'comment') {
			if (sendQueue[0]['fromChoice'] == undefined) {
				var choiceID = 'NA';
			} else {
				var choiceId = sendQueue[0]['fromChoice'];
			}
			var ignoreTime = 0;
			if (sendQueue[0].ignoreTime != undefined && sendQueue[0].ignoreTime == 1) { ignoreTime = 1;}
			localStorage.getObject('gameSettings').lastComment[sendQueue[0]['id']] = 1;
		    newComment({comment:sendQueue[0]['data'],choices:sendQueue[0]['choice'],noNote:sendQueue[0].noNote,queueDay:sendQueue[0].dayDifference,fromChoice:choiceId,ignoreTime:ignoreTime},sendQueue[0].queueDay);
			gameUpdate('updateComment','settings',sendQueue[0]['id']);
		} else if (sendQueue[0]['type'] == 'feed') {
			if (sendQueue[0]['data'].autoTarget == 'comment') {
				var commentSend = data.commentObjects[sendQueue[0]['data'].autoId];
			} else {
				var commentSend = '';
			}
			newFeed({feedItem:sendQueue[0]['data'],choices:sendQueue[0]['choice'],comments:commentSend,noNote:sendQueue[0].noNote,queueDay:sendQueue[0].dayDifference},sendQueue[0].queueDay);
			gameUpdate('updateFeed','settings',sendQueue[0]['id']);
		}
		sendQueue.shift();
		organiseQueue()
	}
	var timer2 = new Date();
	var timeTaken = timer2.getTime() - timer1.getTime();
	if (timeTaken > 5) {
		debugNotice(timestampify()+ '>>>>>>>>>>>>>>>>>>  Check function took '+timeTaken+'. didSend: '+didSend+' <<<<<<<<<<<<<<<<<<',0);
	}
}

	
function uniqueTest(arr) {
  var n, y, x, i, r;
  var arrResult = {},
    unique = [];
    debugNotice(timestampify()+'-----Unique test-----',0);
  for (i = 0, n = arr.length; i < n; i++) {
    var item = arr[i];
    arrResult[item.timeToHit + " - " + item.queueDay + " - " + item.user] = item;
  }
  i = 0;
  for (var item in arrResult) {
    unique[i++] = arrResult[item];
  }
  return unique;
}

var indexOf = function(needle) {
    if(typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                if(this[i] === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle);
};

function countProperties(obj) {
    var count = 0;

    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }

    return count;
}

requestStatus(1);