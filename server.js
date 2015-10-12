//var http = require('http');
var express = require('express'),
	compression = require('compression'),
	app = express(),
	router = express.Router('');

app.use(express.static(__dirname + '/public'));
app.use(router),
app.use(compression());


router.get("/", function(req,res) {
	res.sendFile(__dirname + '/public/index.html');
});

router.get("/feed", function(req,res) {
	res.sendFile(__dirname + '/public/feed.html');
});

router.get("/sam", function(req,res) {
	res.sendFile(__dirname + '/public/sam.html');
});

app.listen(process.env.PORT, process.env.IP);

console.log('Server running');