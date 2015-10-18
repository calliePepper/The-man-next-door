//var http = require('http');
var express = require('express'),
	compression = require('compression'),
	app = express(),
	router = express.Router('');

app.use(express.static(__dirname + '/public'));
app.use(router),
app.use(compression());

var clients = [];
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


var server = app.listen(process.env.PORT, process.env.IP);

console.log(timestampify()+'Server running');

var	io = require('socket.io')(server);

var clients

io.on('connection', function(socket) {
	var userId = socket.id;
	console.log(timestampify()+'Connection established, new target found at '+userId);
	clients.push(userId);
	
	socket.on('disconnect', function() {
		//console.log('Target left');	
		var index = clients.indexOf(userId);
		if (index != -1) {
			clients.splice(index,1);
		}
	});
	
	socket.on('newPage', function(page) {
		console.log(timestampify()+'The player '+page.playerName+' is on '+page.page);
		var compDate = getPoint(page.startTime,page.currentTime); 
		console.log(timestampify()+'They are on day '+compDate.day+' and have passed '+Math.round(compDate.timeThrough/60)+' minutes');
		console.log(timestampify()+'The last time they had an update was '+Math.round((page.currentTime - page.lastUpdate)/60)+' minutes ago');
	});
	
	//newMessage
		//message: 
			//{Array}
				//fromId:
				//toId:
				//timestamp:
				//message:
				//image:
				//from:
		//choices:
			//choice1:
			//choice2:
			//choice3:
			//choiceId:
	
	setTimeout(function() {
		console.log(timestampify()+'Sending test message to '+userId);
		var index = clients.indexOf(userId);
		if (index != -1) {
			io.sockets.connected[userId].emit('newMessage',{message:[{fromId:2,toId:2,timestamp:1444973605,message:'Hello? Are you there?',image:'',from:1},{fromId:2,toId:2,timestamp:1444973705,message:'Seriously, I need to talk to you',image:'',from:1}],choices:{choice1:'Ok I\'m here, what is wrong?',choice2:'It can\'t be that important',choice3:'[Ignore her]',choiceId:1}});
		}
	},25000);
	
	//newFeed
		//feedItem
			//fromId
			//date
			//text
			//image
			//likes
			//comments
				//{array}
					//order
					//user
					//date
					//text
					//image
					//likes
		//choices:
			//choice1:
			//choice2:
			//choice3:
			//choiceId:					
					
	setTimeout(function() {
		console.log(timestampify()+'Sending test feed to '+userId);
		var index = clients.indexOf(userId);
		if (index != -1) {
			//io.sockets.connected[userId].emit('newMessage',{message:[{fromId:2,toId:2,timestamp:1444973605,message:'Hello? Are you there?',image:'',from:1},{fromId:2,toId:2,timestamp:1444973705,message:'Seriously, I need to talk to you',image:'',from:1}],choices:{choice1:'Ok I\'m here, what is wrong?',choice2:'It can\'t be that important',choice3:'[Ignore her]',choiceId:1}});
			var commentArray = [
					{order:1,user:2,date:1444831193,text:'You are such a rebel Sam',image:'',likes:2},
					{order:2,user:1,date:1444861193,text:'I know right? It\'s a wonder I haven\'t been arrested',image:'',likes:1}
				]
			var feedCreation = {fromId:1,date:1444811193,text:'Wake up Sheeple!!!',image:'',likes:4,comments:commentArray};
			io.sockets.connected[userId].emit('newFeed',{feedItem:feedCreation,choices:{choice1:'Sam, you are an embarrasment',choice2:'How do you deal with this Cal?',choice3:'Yeah! Fight the power!',choiceId:2}});
		}
	},5000)
	
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

function getPoint(start,currentTime) {
	var day = 0;
	var timeThroughDay = 0;
	day = daydiff(currentTime,start);
	var thisDay = Math.floor(getMidnight(currentTime) / 1000);
	if (day != 0) {
		timeThroughDay = parseInt(currentTime) / parseInt(thisDay);
	} else {
		timeThroughDay = parseInt(currentTime) - parseInt(start);
	}
	//console.log('Start time is '+start+'. Current time is '+currentTime+'. Difference is '+(parseInt(currentTime) - parseInt(start))+'. Which should be the same as '+timeThroughDay);
	return {day:day,timeThrough:timeThroughDay};
}

function getMidnight(date) {
	var thisDate = new Date(date);
	thisDate.setHours(0,0,0,0);
	return thisDate;
}

function daydiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24));
}
