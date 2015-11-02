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
		oldDataUpdate(currentDay,timeThroughDay,updatedLast);
	});
	
	socket.on('choiceMade', function(replyData) {
		if (data.choiceObjects[replyData.choiceId]['result_'+replyData.choiceMade] != 0) {
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
				var messageResult = data.messageObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]].messages;
				var choiceResult = '';
				if (data.messageObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]].autoTarget == 'choice') {
					var choiceResult = data.choiceObjects[data.messageObjects[data.choiceObjects[replyData.choiceId]['result'+replyData.choiceMade]].autoId]
				}
				choiceResult.additionalTarget = replyData.additionalTarget;
				var object2 = {timeStamp:0,user:userId,type:'message',data:messageResult,choice:choiceResult};
			}
			console.log(timestampify()+replyData.playerName+' came across choice '+replyData.choiceId+' and took path '+replyData.choiceMade);	
			sendQueue.push(object2);
			organiseQueue();
		}
	});
	
	function oldDataUpdate(day,timeThroughDay,updatedLast) {
		var updateData = {};
		updateData.message = [];
		updateData.feed = [];
		var updateCounter = 0;
		function loopDayUpdate(day,timeThroughDay,updatedLast) {
			if (updatedLast > timeThroughDay) {
				for (var i in data.events[day]) {
					if (i < timeThroughDay && i < updatedLast) {
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
						} else { 
							var type = 'message';
							tempArray.messageItem = data[data.events[day][i]['object']][data.events[day][i]['id']]
							if (tempArray.messageItem.autoTarget == 'choice') {
								tempChoice = data.choiceObjects[tempComments.autoId];
							}
							tempArray.choices = tempChoice;
						}
						updateData[type].push(tempArray);
						updateCounter++;
					}
				};
				updatedLast -= 1440;
				if (updatedLast > 0 && day > 0) {
					loopDayUpdate(day-1,1440,updatedLast);
				}
			}
		}
		loopDayUpdate(day,timeThroughDay,updatedLast);
		console.log(timestampify()+'Pushing '+updateCounter+' new events to '+clientData[userId]['name'])
		io.to(userId).emit('updateData',updateData);
		queueFunc.update(userId,day,timeThroughDay,updatedLast);
	}
});


function timestampify() {
	var currentdate = new Date(); 
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

queueFunc.update = function(userId,day,timeThroughDay,updatedLast) {
	timeStampToHit = 0;
	nextOne = 0;
	for (var i in data.events[day]) {
		if (timeStampToHit == 0 && parseInt(timeThroughDay) < parseInt(i)) {
			timeStampToHit = i;
			break;
		}
	}
	if (timeStampToHit != 0) {
		if (data.events[day][timeStampToHit]['object'] == 'feedObjects') { var type = 'feed'; 
		} else if (data.events[day][timeStampToHit]['object'] == 'commentObjects') { var type = 'comment'; 
		} else if (data.events[day][timeStampToHit]['object'] == 'messageObjects') { var type = 'messages'; }
		if (data.events[day][timeStampToHit]['choiceId'] == 0) {
			var queueChoice = '';
		} else {
			var queueChoice = data.choiceObjects[data.events[day][timeStampToHit]['choiceId']];
		}
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
}

queueFunc.check = function() {
	var current = moment().unix();
	if (sendQueue[0]['timeStamp'] <= current) {
		console.log(timestampify()+'Sending '+sendQueue[0]['type'] + ' to '+clientData[sendQueue[0]['user']]['name']);
		if (sendQueue[0]['type'] == 'message') {
			if (sendQueue[0]['user'] == undefined) {
				console.log(timestampify()+'Shit. Error.');
				console.log(sendQueue);
			} else {
				io.to(sendQueue[0]['user']).emit('newMessage',{message:sendQueue[0]['data'],choices:sendQueue[0]['choice']});
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
				io.to(sendQueue[0]['user']).emit('newFeed',{feedItem:sendQueue[0]['data'],choices:sendQueue[0]['choice']});
			}
		}
		sendQueue.shift();
		organiseQueue()
	}
}