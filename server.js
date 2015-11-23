//var http = require('http');
var express = require('express'),
	compression = require('compression'),
	app = express(),
	router = express.Router(''),
	moment = require('moment');

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

var	io = require('socket.io')(server);

var clients

io.on('connection', function(socket) {
	var userId = socket.id;
	io.sockets.connected[userId].emit('requestStatus');
	clients[socket.id] = socket;
	
	socket.on('disconnect', function() {
		//console.log('Target left');	
		var index = clients.indexOf(userId);
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
		oldDataUpdate(currentDay,timeThroughDay,updatedLast,page.lastFeed,page.lastMessage,page.lastComment);
		if (page.firstLoad == 1) {
			io.to(userId).emit('newMessage',{messageItem:data.messageObjects[1],choices:data.choiceObjects[1]});
		}
	});
	
	socket.on('choiceMade', function(replyData) {
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
				var object2 = {timeStamp:0,user:userId,type:'comment',data:commentResult,choice:choiceResult};
			} else if (data.choiceObjects[replyData.choiceId].resultType == 'message') {
				var messageResult = data.messageObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]];
				var choiceResult = '';
				if (data.messageObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]].autoTarget == 'choice') {
					var choiceResult = data.choiceObjects[data.messageObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]].autoId]
				}
				choiceResult.additionalTarget = replyData.additionalTarget;
				var object2 = {timeStamp:0,user:userId,type:'message',data:messageResult,choice:choiceResult};
			}
			sendQueue.push(object2);
			organiseQueue();
		}
	});
	
	socket.on('anotherMessage', function(replyData) {
		console.log(timestampify()+replyData.playerName+' asked for another message (Message: '+replyData.nextId+')');	
		var messageItem = data.messageObjects[replyData.nextId];
		var choiceResult = '';
		if (messageItem.autoTarget == 'choice') {
			var choiceResult = data.choiceObjects[messageItem.autoId]
		}
		io.to(userId).emit('newMessage',{messageItem:messageItem,choices:choiceResult});
	});
	
	
	function oldDataUpdate(day,timeThroughDay,updatedLast,lastFeed,lastMessage,lastComment) {
		var updateData = {};
		updateData.message = [];
		updateData.feed = [];
		updateData.comment = [];
		var updateCounter = 0;
		function loopDayUpdate(day,timeThroughDay,updatedLast) {
			console.log('Looping through day '+day+'. Time through day is '+timeThroughDay+'. Updated last is '+updatedLast);
				for (var i in data.events[day]) {
					if (i < timeThroughDay && i > (timeThroughDay - updatedLast)) {
						console.log('Found backlog event '+i);
						var tempArray = {};
						var tempChoice = '';
						if (data.events[day][i]['object'] == 'feedObjects') { 
							var type = 'feed'; 
							tempArray.feedItem = data[data.events[day][i]['object']][data.events[day][i]['id']]
							var tempComments = '';
							if (tempArray.feedItem.comments != 0) {
								tempComments = data.commentObjects[tempArray.feedItem.comments];
								if (tempComments.autoTarget == 'choice') {
									tempChoice = data.choiceObjects[tempComments.autoId];
								}
							}
							tempArray.choices = tempChoice;
							tempArray.comments = tempComments;
						} else if (data.events[day][i]['object'] == 'messageObjects') { 
							var type = 'message';
							tempArray.messageItem = data[data.events[day][i]['object']][data.events[day][i]['id']]
							if (tempArray.messageItem.autoTarget == 'choice') {
								tempChoice = data.choiceObjects[tempArray.messageItem.autoId];
							}
							tempArray.choices = tempChoice;
						} else if (data.events[day][i]['object'] == 'commentObjects') {
							var type = 'comment';
							tempArray.comment = data[data.events[day][i]['object']][data.events[day][i]['id']]
							console.log(tempArray);
							if (tempArray.comment.autoTarget == 'choice') {
								tempChoice = data.choiceObjects[tempArray.messageItem.autoId];
							}
							tempArray.choices = tempChoice;
						}
						updateData[type].push(tempArray);
						updateCounter++;
					}
				};
				updatedLast -= timeThroughDay;
				if (updatedLast > 0 && day > 0) {
					loopDayUpdate(day-1,1440,updatedLast);
				}
		}
		loopDayUpdate(day,timeThroughDay,updatedLast);
		console.log(timestampify()+'Pushing a backlog of '+updateCounter+' events to '+userId.substr(0,4) + '<->' +clientData[userId]['name'])
		io.to(userId).emit('updateData',updateData);
		queueFunc.update(userId,day,timeThroughDay,updatedLast,lastFeed,lastMessage,lastComment);
	}
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
	day =  moment(thisMidnight).diff(startMidnight, 'days');
	timeThroughDay = thisDate.clone().diff(thisMidnight, 'minutes');
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
      if (a.timeStamp < b.timeStamp)
        return -1;
      if (a.timeStamp > b.timeStamp)
        return 1;
      return 0;
    }
    sendQueue.sort(compare);
}

var watcher = setInterval(function() {
	if (sendQueue.length > 0) {
		queueFunc.check();
	}	
},2000);

var queueFunc = {};

queueFunc.update = function(userId,day,timeThroughDay,updatedLast,lastFeed,lastMessage,lastComment) {
	console.log(timestampify()+'Checking update for '+userId.substr(0,4)+'<->'+clientData[userId].name + ' . '+lastFeed+'-'+lastMessage+'-'+lastComment);
	timeStampToHit = 0;
	nextOne = 0;
	for (var i in data.events[day]) {
		if (timeStampToHit == 0 && parseInt(timeThroughDay) < parseInt(i)
			|| timeStampToHit == 0 && data.events[day][i].object == 'feedObjects' && data.events[day][i].id > lastFeed
			|| timeStampToHit == 0 && data.events[day][i].object == 'commentObjects' && data.events[day][i].id > lastComment
			|| timeStampToHit == 0 && data.events[day][i].object == 'messageObjects' && data.events[day][i].id > lastMessage) {
			timeStampToHit = i;
			break;
		}
	}
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
		var queueObject = {
			timeStamp:moment().unix() + ((i - timeThroughDay) * 60),
			user:userId,
			type:type,
			data:data[data.events[day][timeStampToHit]['object']][data.events[day][timeStampToHit]['id']],
			choice:queueChoice
		};
		sendQueue.push(queueObject);
		organiseQueue()
	}
	sendQueue = uniqueTest(sendQueue);
}

queueFunc.check = function() {
	var current = moment().unix();
	if (current % 600 <= 1) {
		var replyString = '';
		for (var i in sendQueue) {
			replyString += 'User: '+sendQueue[i].user.substr(0, 4)+'<->'+clientData[sendQueue[i].user].name+', Type: '+sendQueue[i].type+', Id: '+sendQueue[i].data.postId+'|';
		}
		console.log(timestampify()+'Queue update, total in queue is '+sendQueue.length+', next update in '+Math.floor((sendQueue[0]['timeStamp'] - current) / 60)+' minutes');
		console.log(timestampify()+replyString.substr(0,replyString.length-1));
	}
	if (sendQueue[0]['timeStamp'] <= current) {
		console.log(timestampify()+'Sending '+sendQueue[0]['type'] + ' to '+sendQueue[0].user.substr(0, 4)+'<->'+clientData[sendQueue[0]['user']]['name']);
		if (sendQueue[0]['type'] == 'messages' || sendQueue[0]['type'] == 'message') {
			if (sendQueue[0]['user'] == undefined) {
				console.log(timestampify()+'Shit. Error.');
				console.log(sendQueue);
			} else {
				io.to(sendQueue[0]['user']).emit('newMessage',{messageItem:sendQueue[0]['data'],choices:sendQueue[0]['choice']});
			}
		} else if (sendQueue[0]['type'] == 'comment') {
			if (sendQueue[0]['user'] == undefined) {
				console.log(timestampify()+'Shit. Error.');
				console.log(sendQueue);
			} else {
				io.to(sendQueue[0]['user']).emit('newComment',{comment:sendQueue[0]['data'],choices:sendQueue[0]['choice']});
			}
		} else if (sendQueue[0]['type'] == 'feed') {
			if (sendQueue[0]['user'] == undefined) {
				console.log(timestampify()+'Shit. Error.');
				console.log(sendQueue);
			} else {
				if (sendQueue[0]['data'].comments != 0) {
					var commentSend = data.commentObjects[sendQueue[0]['data'].comments];
				}
				io.to(sendQueue[0]['user']).emit('newFeed',{feedItem:sendQueue[0]['data'],choices:sendQueue[0]['choice'],comments:commentSend});
			}
		}
		sendQueue.shift();
		organiseQueue()
	}
}

	
function uniqueTest(arr) {
  var n, y, x, i, r;
  var arrResult = {},
    unique = [];
  for (i = 0, n = arr.length; i < n; i++) {
    var item = arr[i];
    arrResult[item.title + " - " + item.artist] = item;
  }
  i = 0;
  for (var item in arrResult) {
    unique[i++] = arrResult[item];
  }
  return unique;
}