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
	
	socket.on('prepareNote', function(data) {
		queueFunc.add(data.type,data.from,data.fromAvatar,data.reg,data.mob,data.sendTime,data.shortData);
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

queueFunc.add = function(type,from,fromAvatar,reg,mob,sendTime,shortData) {
	if (timeStampToHit != 0) {
		console.log(timestampify()+'Update found, Type: '+type+', id: '+data.events[day][timeStampToHit]['id']);
		var dayDifTemp = userDay - day;
		var queueObject = {
			timeStamp:moment().unix() + (sendTime * 60),
			from:from,
			fromAvatar:fromAvatar,
			reg:reg,
			mob:mob,
			shortData:shortData
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


queueFunc.report = function(limit) {
	var current = moment().unix();
	if (limit == 0 || current % 600 <= 1) {

	}
}

queueFunc.check = function() {
	var current = moment().unix();
	var timer1 = new Date();
	queueFunc.report(1);
	var didSend = 0;
	while (sendQueue[0] != undefined && sendQueue[0]['timeStamp'] <= current || sendQueue[0] != undefined && sendQueue[0].queueDay < sendQueue[0].userDay ) {
		didSend = 1;
		notifyUser(sendQueue[0]['type'],sendQueue[0]['reg'],sendQueue[0]['from'],sendQueue[0]['fromAvatar'],sendQueue[0]['shortData']);
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