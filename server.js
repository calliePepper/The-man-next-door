//var http = require('http');
var express = require('express'),
	compression = require('compression'),
	app = express(),
	router = express.Router(''),
	moment = require('moment'),
	gcm = require('node-gcm');

var data = require('./gameData.js');
var sendQueue = [];

app.use(express.static(__dirname + '/public'));
app.use(router),
app.use(compression());

var clients = [];
var clientData = {};
var sequence = 1;


router.get("/", function(req,res) {
	res.sendFile(__dirname + '/public/index.html');
});

router.get("/feed", function(req,res) {
	res.sendFile(__dirname + '/public/feed.html');
});

router.get("/sam", function(req,res) {
	res.sendFile(__dirname + '/public/sam.html');
});

router.get("/messages", function(req,res) {
	res.sendFile(__dirname + '/public/messages.html');
});

router.get("/twaddle", function(req,res) {
	res.sendFile(__dirname + '/public/twaddle.html');
});



var server = app.listen(process.env.PORT, process.env.IP);

console.log(timestampify()+'Server running');

var	io = require('socket.io').listen(server);

io.set( 'origins', '*:*' );

var clients

io.on('connection', function(socket) {
	var userId = socket.id;
	io.sockets.connected[userId].emit('requestStatus');
	clients[socket.id] = [];
	clients[socket.id]['socket'] = socket;
	
	socket.on('disconnect', function() {
		var disconCounter = 0;
		for (var i = sendQueue.length - 1; i >= 0; i--) {
			if (sendQueue[i]['user'] == userId) {
		        sendQueue.splice(i,1);
		        disconCounter++;
		    }
		}
		console.log(timestampify()+userId+' just disconnected, '+disconCounter+' events removed, '+sendQueue.length+' remaing');
	});
	
	socket.on('pageLoad', function(page) {
		var compDate = getPoint(page.startTime,page.currentTime,page.timezone); 
		var currentDay = compDate.day;
		var timeThroughDay = Math.round(compDate.timeThrough);
		if (page.lastUpdate != 1440) {
			var updatedLast = moment(page.currentTime).clone().diff(moment(page.lastUpdate), 'minutes');
		} else {
			var updatedLast = page.lastUpdate;
		}
		console.log(timestampify()+userId+': '+page.playerName+' - '+data.pages[page.page]+'. Time: '+currentDay+': '+timeThroughDay+'. Updated: '+updatedLast);
		clientData[userId] = {};
		clientData[userId]['name'] = page.playerName;
		clientData[userId]['timezone'] = page.timezone;
		clientData[userId]['lastUpdated'] = updatedLast;
		clientData[userId]['friends'] = {};
		for (user in page.users) {
		    if (!page.users.hasOwnProperty(user)) {
				continue;   	
		    }
		    clientData[userId]['friends'][user] = page.users[user].friended;
		}
		clientData[userId]['reg'] = page.reg;
		clientData[userId]['device'] = page.mob;
		console.log (clientData[userId]['reg'] + ' - ' + clientData[userId]['device'])
		queueFunc.update(userId,currentDay,timeThroughDay,updatedLast,clientData[userId]['lastFeed'],clientData[userId]['lastMessage'],clientData[userId]['lastComment'],page.firstRun)
	});
	
	socket.on('prepareNote', function(data) {
		console.log(timestampify()+'Note found - Sending in '+data.sendTime);
		console.log(timestampify()+'|--- '+data.type+'|'+data.objectId+' from '+data.from+' containing '+data.shortData);
		console.log(timestampify()+'|--- going to '+data.reg);
		queueFunc.add(data.type,data.from,data.fromAvatar,data.reg,data.mob,data.sendTime,data.shortData,data.objectId,userId);
	});
	
	socket.on('dataMeUp', function() {
		io.to(userId).emit('systemUpdate',{data:data});
	});

});


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
	var thisDate = moment(currentTime).utcOffset(timezone * -1);
	var startDate = moment(start).utcOffset(timezone * -1);
	var startMidnight = startDate.clone().startOf('day').utcOffset(timezone * -1);
	var thisMidnight = thisDate.clone().startOf('day').utcOffset(timezone * -1);
	var day =  moment(thisMidnight).diff(startMidnight, 'days');
	var timeThroughDay = thisDate.clone().diff(thisMidnight, 'minutes');
	//console.log('Start time is '+start+'. Current time is '+currentTime+'. Difference is '+(parseInt(currentTime) - parseInt(start))+'. Which should be the same as '+timeThroughDay);
	return {day:day,timeThrough:timeThroughDay};
}

function debugSetup(userId) {
	var object2 = {timeStamp:moment().unix() + 2,user:userId,type:'message',data:data.messageObjects[1].messages,choice:data.choiceObjects[1]};
	sendQueue.push(object2);
	organiseQueue()
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
},500);

var notifyUser = function(type,reg,user,pic,shortData) {
	if (reg != undefined && reg != 0) {
		var sender = new gcm.Sender('AIzaSyBsDedWcDBATdqS69h7zFvlMYH97rRwq8w');
		if (type == 'message') {
			body = user + ': ' + shortData;
			var title = 'New Messages';
		} else if (type == 'post') {
			body = user + ': ' + shortData;
			var title = 'New Posts';
		}
		var message = new gcm.Message({
		  notification: {
		        title: title,
		        body: body,
		        style: "inbox",
		        image: "www/"+pic,
		        color: '#910101',
		        summaryText: "There are %n% notifications"
		    }
		});
		var registrationIds = [];
		registrationIds.push(reg);
		sender.send(message, registrationIds, 4, function (err, result) {
			console.log(err);
		  	//console.log(result);
		});
	}
}

var queueFunc = {};

queueFunc.add = function(day,timeStampToHit,userId,timeThroughDay,userDay,noNote) {
	if (timeStampToHit != 0) {
		if (data.events[day][timeStampToHit]['object'] == 'feedObjects') { var type = 'feed'; 
		} else if (data.events[day][timeStampToHit]['object'] == 'commentObjects') { var type = 'comment'; 
		} else if (data.events[day][timeStampToHit]['object'] == 'messageObjects') { var type = 'messages'; }
		if (data[data.events[day][timeStampToHit]['object']][data.events[day][timeStampToHit]['id']].autoTarget && data[data.events[day][timeStampToHit]['object']][data.events[day][timeStampToHit]['id']].autoTarget == 'choice') {
			var queueChoice = data.choiceObjects[data[data.events[day][timeStampToHit]['object']][data.events[day][timeStampToHit]['id']].autoId];
		} else {
			var queueChoice = '';
		}
		console.log(timestampify()+'Update found, Type: '+type+', id: '+data.events[day][timeStampToHit]['id']);
		var dayDifTemp = userDay - day;
		var queueObject = {
			timeStamp:moment().unix() + ((timeStampToHit - timeThroughDay) * 60),
			timeToHit:timeStampToHit,
			user:userId,
			type:type,
			id:data.events[day][timeStampToHit]['id'],
			data:data[data.events[day][timeStampToHit]['object']][data.events[day][timeStampToHit]['id']],
			choice:queueChoice,
			queueDay:day,
			dayDifference: dayDifTemp,
			userDay:userDay,
			noNote:noNote
		};
		sendQueue.push(queueObject);
		organiseQueue()
	}
}

queueFunc.getIndex = function(object) {
	var replyString = '';
	for (var i in object) {
		replyString = replyString + i + ',';
	}
	return replyString.substr(0,replyString.length-1);
}

queueFunc.update = function(userId,day,timeThroughDay,updatedLast,lastFeed,lastMessage,lastComment,noNote) {
	console.log(timestampify()+'Checking update for '+userId.substr(0,4)+'<->'+clientData[userId].name + ' . '+queueFunc.getIndex(lastFeed)+'|'+queueFunc.getIndex(lastMessage)+'|'+queueFunc.getIndex(lastComment));
	timeStampToHit = 0;
	var itemsQueued = 0;
	var itemsSent = 0;
	var currentDay = 0;
	function checkEvents(dayCheck) {
		for (var i in data.events[dayCheck]) {
			var notDone = 1;
			if (lastFeed != '' && data.events[dayCheck][i].object == 'feedObjects') {
				if (lastFeed[data.events[dayCheck][i].id] == 1)  {
					notDone = 0;
				}
			}
			if (lastComment != null && data.events[dayCheck][i].object == 'commentObjects') {
				if (lastComment[data.events[dayCheck][i].id] == 1) {
					notDone = 0;
				}
			}
			if (lastMessage != '' && data.events[dayCheck][i].object == 'messageObjects') {
				if (lastMessage[data.events[dayCheck][i].id] == 1) {
					notDone = 0;
				}
			}
			if (notDone == 1) {
				queueFunc.add(dayCheck,i,userId,timeThroughDay,day,noNote);
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
	io.to(userId).emit('hideLoad');
	var initialLength = sendQueue.length;
	sendQueue = uniqueTest(sendQueue);
	if (sendQueue.length > initialLength) {
		console.log(timestampify()+'Found '+parseInt(initialLength) - parseInt(sendQueue.length)+' duplicates');	
	} else {
		console.log(timestampify()+'No duplicates found');
	}
}

queueFunc.report = function(limit) {
	var current = moment().unix();
	if (limit == 0 || current % 600 <= 1) {
		var replyString = '';
		for (var i in sendQueue) {
			if (sendQueue[i].type == 'feed') {
				replyString += 'User: '+sendQueue[i].user.substr(0, 4)+'<->'+clientData[sendQueue[i].user].name+', Type: Post, Id: '+sendQueue[i].data.postId+'|';
			} else if (sendQueue[i].type == 'comment') {
				replyString += 'User: '+sendQueue[i].user.substr(0, 4)+'<->'+clientData[sendQueue[i].user].name+', Type: Comment, Id: '+sendQueue[i].data.commentId+'|';
			} else if (sendQueue[i].type == 'message') {
				replyString += 'User: '+sendQueue[i].user.substr(0, 4)+'<->'+clientData[sendQueue[i].user].name+', Type: Message, Id: '+sendQueue[i].data.messageId+'|';
			}
		}
		console.log(timestampify()+'Queue update, total in queue is '+sendQueue.length+', next update in '+Math.floor((sendQueue[0]['timeStamp'] - current) / 60)+' minutes');
		console.log(timestampify()+replyString.substr(0,replyString.length-1));
	}
}

queueFunc.check = function() {
	var current = moment().unix();
	var timer1 = new Date();
	queueFunc.report(1);
	var didSend = 0;
	while (sendQueue[0] != undefined && sendQueue[0]['timeStamp'] <= current || sendQueue[0] != undefined && sendQueue[0].queueDay < sendQueue[0].userDay ) {
		didSend = 1;
		console.log(timestampify()+'Sending '+sendQueue[0]['type'] + '|'+sendQueue[0]['id']+' to '+sendQueue[0].user.substr(0, 4)+'<->'+clientData[sendQueue[0]['user']]['name']);
		if (sendQueue[0]['type'] == 'messages' || sendQueue[0]['type'] == 'message') {
			if (sendQueue[0]['noNote'] == 0 && sendQueue[0]['fromChoice'] == undefined) {
				var shortData = sendQueue[0].data.messages[0].message;
				if (shortData.length > 30) {
					shortData = shortData.substr(0,30) + '...';
				}
				notifyUser('message',clientData[sendQueue[0]['user']]['reg'],data.users[sendQueue[0]['data']['messages'][0]['fromId']][0],data.users[sendQueue[0]['data']['messages'][0]['fromId']][4],shortData);
			}
		} else if (sendQueue[0]['type'] == 'feed') {
			if (sendQueue[0]['noNote'] == 0) {
				if (clientData[sendQueue[0]['user']]['friends'][sendQueue[0]['data']['fromId']] == 1) {
					var shortData = sendQueue[0].data.text;
					if (shortData.length > 30) {
						shortData = shortData.substr(0,30) + '...';
					}
					notifyUser('post',clientData[sendQueue[0]['user']]['reg'],data.users[sendQueue[0]['data']['fromId']][0],data.users[sendQueue[0]['data']['fromId']][4],shortData);
				}
			}
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
    arrResult[item.timeToHit + " - " + item.user] = item;
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