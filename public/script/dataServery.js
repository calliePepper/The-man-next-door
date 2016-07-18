
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
       console.log(timestampify()+arguments.callee.name+' Opening localStorage for writing');
       var lastUpdate = localStorage.getObject('gameSettings').lastUpdate;
       var firstLoadTime = 0
        if (localStorage.getObject('gameSettings').firstLoad == 1) {
            console.log(timestampify()+'omg first load');
            lastUpdate = 1440;
            var tempData = localStorage.getObject('gameSettings');
            tempData.firstLoad = 0;
            firstLoadTime = 1;
            localStorage.setObject('gameSettings',tempData);
            console.log(timestampify()+arguments.callee.name+' Closing localStorage');
        }
        console.log(timestampify()+'Retrieving data');
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
    console.log(page);
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
	console.log('Last updated '+updatedLast+' mins ago');
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
	console.log (clientData['reg'] + ' - ' + clientData['device'])
	queueFunc.update(currentDay,timeThroughDay,updatedLast,page.firstRun)
	if (page.firstLoad == 1) {
		newMessage({messageItem:data.messageObjects[0],choices:data.choiceObjects[0],noNote:1,queueDay:0});
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
	console.log(timestampify()+replyData.playerName+' came across choice '+replyData.choiceId+' and took path '+replyData.choiceMade);	
	if (data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade] != 0) {
		if (data.choiceObjects[replyData.choiceId].resultType == 'comment') {
			var resultTest = 'result'+replyData.choiceMade;
			var commentResult = data.commentObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]];
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
		} else if (data.choiceObjects[replyData.choiceId].resultType == 'message') {
			var messageResult = data.messageObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]];
			var choiceResult = '';
			if (data.messageObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]].autoTarget == 'choice') {
				var choiceResult = data.choiceObjects[data.messageObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]].autoId]
			}
			choiceResult.additionalTarget = replyData.additionalTarget;
			var object2 = {
				timeStamp:0,
				type:'message',
				data:messageResult,
				choice:choiceResult,
				id: data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade],
				queueDay:0,
				userDay:5,
				dayDifference: 0,
				noNote:0,
				fromChoice:replyData.choiceId
			};
		}
		sendQueue.push(object2);
		organiseQueue();
		receivedChoice({choiceId:replyData.choiceId});
	}
};

function anotherMessage(replyData) {
	console.log(timestampify()+replyData.playerName+' asked for another message (Message: '+replyData.nextId+'). No note is '+replyData.noNote);	
	var messageItem = data.messageObjects[replyData.nextId];
	var choiceResult = '';
	if (messageItem.autoTarget == 'choice') {
		var choiceResult = data.choiceObjects[messageItem.autoId]
	}
	messageItem.noNote = replyData.noNote;
	newMessage({messageItem:messageItem,choices:choiceResult,queueDay:messageItem.day,noNote:replyData.noNote});
};
	

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
	console.log(timeDiff);
	var timeThroughDay =  Math.ceil(timeDiff / (1000 * 60));
	console.log('Day: ' + day + '.Start time is '+start+'. Current time is '+currentTime+'. Time through day is '+timeThroughDay);
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
		//console.log(day);
		//console.log(timeStampToHit);
		//console.log(data[data.events[day][timeStampToHit]['object']][data.events[day][timeStampToHit]['id']]);
		if (data[data.events[day][timeStampToHit]['object']][data.events[day][timeStampToHit]['id']].autoTarget && data[data.events[day][timeStampToHit]['object']][data.events[day][timeStampToHit]['id']].autoTarget == 'choice') {
			var queueChoice = data.choiceObjects[data[data.events[day][timeStampToHit]['object']][data.events[day][timeStampToHit]['id']].autoId];
		} else {
			var queueChoice = '';
		}
		console.log(timestampify()+'Update found, Type: '+type+', id: '+data.events[day][timeStampToHit]['id']);
		var dayDifTemp = userDay - day;
		console.log(timestampify()+'User day is '+userDay+'. Object is at '+day+'. Therefore difference is '+dayDifTemp);
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
		console.log(type);
		if (type == 'messages' && deviceData['type'] == 1 || type == 'message' && deviceData['type'] == 1) {
    	    if (noNote == 0 && deviceData['type'] == 1 && dayDifTemp == 0 && timeStampToHit - timeThroughDay > 0) {
    			var shortData = objectToSave.messages[0].message;
    			if (shortData.length > 30) {
    				shortData = shortData.substr(0,30) + '...';
    			}
                console.log('Emitting a request for a message poke in '+ (timeStampToHit - timeThroughDay) + ' minutes');
                notificationTimers.add(data.users[objectToSave['messages'][0]['fromId']][0],data.events[day][timeStampToHit]['id'],shortData,(timeStampToHit - timeThroughDay) * 60,'message');
    		}
		}
		if (type == 'feed' && deviceData['type'] == 1) {
		    console.log(objectToSave['fromId']);
		    console.log(localStorage.getObject('gameData').users);
		    console.log(localStorage.getObject('gameData').users[objectToSave['fromId']].friended);
		    if (localStorage.getObject('gameData').users[objectToSave['fromId']].friended == 1 && dayDifTemp == 0 && timeStampToHit - timeThroughDay > 0) {
				var shortData = objectToSave.text;
				if (shortData.length > 30) {
					shortData = shortData.substr(0,30) + '...';
				}
                console.log('Emitting a request for a feed poke in '+ (timeStampToHit - timeThroughDay) + ' minutes');
                notificationTimers.add(data.users[objectToSave['messages'][0]['fromId']][0],data.events[day][timeStampToHit]['id'],shortData,(timeStampToHit - timeThroughDay) * 60,'post');
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
	function checkEvents(dayCheck) {
	    console.log('Checking day '+dayCheck);
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
				queueFunc.add(dayCheck,i,timeThroughDay,day,noNote);
				var dayDiff = day - dayCheck;
				if (i > timeThroughDay && dayDiff <= 0 && data.events[dayCheck][i].object == 'feedObjects' || i > timeThroughDay && dayDiff <= 0 && data.events[dayCheck][i].object == 'messageObjects') {
					itemsQueued++;
					break;
				} else {
					itemsSent++;
				}
			}
		}
		if (currentDay < day) {
			currentDay++;
			checkEvents(currentDay);
		}
	}
	checkEvents(currentDay);
	var timerCheck = localStorage.getObject('gameData');
	for (var i in localStorage.getObject('gameData').timers) {
		console.log(timestampify()+'Checking timer '+i);
		var now = Math.floor(Date.now() / 1000);
		console.log(now + ' vs ' +localStorage.getObject('gameData').timers[i].time);
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
		console.log(timestampify()+'Found '+parseInt(initialLength) - parseInt(sendQueue.length)+' duplicates');	
	} else {
		console.log(timestampify()+'No duplicates found');
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
		console.log(timestampify()+'Queue update, total in queue is '+sendQueue.length+', next update in '+Math.floor((sendQueue[0]['timeStamp'] - current) / 60)+' minutes');
		console.log(timestampify()+replyString.substr(0,replyString.length-1));
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
	while (sendQueue[0] != undefined && sendQueue[0]['timeStamp'] <= current || sendQueue[0] != undefined && sendQueue[0].queueDay < sendQueue[0].userDay ) {
		didSend = 1;
		console.log(timestampify()+'Sending '+sendQueue[0]['type'] + '|'+sendQueue[0]['id']);
		if (sendQueue[0]['type'] == 'messages' || sendQueue[0]['type'] == 'message') {
			if (sendQueue[0]['fromChoice'] == undefined) {
				var choiceID = 'NA';
			} else {
				var choiceId = sendQueue[0]['fromChoice'];
			}
			localStorage.getObject('gameSettings').lastFeed[sendQueue[0]['id']] = 1;
			newMessage({messageItem:sendQueue[0]['data'],choices:sendQueue[0]['choice'],noNote:sendQueue[0].noNote,queueDay:sendQueue[0].queueDay-1,fromChoice:choiceId});
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
			if (sendQueue[0]['data'].comments != 0) {
				var commentSend = data.commentObjects[sendQueue[0]['data'].comments];
			} else {
				var commentSend = '';
			}
			console.log('Sending feed, it has a comment value '+sendQueue[0]['data'].comments);
			console.log(commentSend);
			newFeed({feedItem:sendQueue[0]['data'],choices:sendQueue[0]['choice'],comments:commentSend,noNote:sendQueue[0].noNote,queueDay:sendQueue[0].dayDifference},sendQueue[0].queueDay);
			gameUpdate('updateFeed','settings',sendQueue[0]['id']);
		}
		sendQueue.shift();
		organiseQueue()
	}
	var timer2 = new Date();
	var timeTaken = timer2.getTime() - timer1.getTime();
	if (timeTaken > 5) {
		console.log(timestampify()+ '>>>>>>>>>>>>>>>>>>  Check function took '+timeTaken+'. didSend: '+didSend+' <<<<<<<<<<<<<<<<<<');
	}
}

	
function uniqueTest(arr) {
  var n, y, x, i, r;
  var arrResult = {},
    unique = [];
    console.log(timestampify()+'-----Unique test-----');
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