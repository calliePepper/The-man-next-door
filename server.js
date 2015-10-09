//var http = require('http');
var express = require('express'),
	compression = require('compression'),
	app = express(),
	router = express.Router('');

app.use(express.static(__dirname + '/public'));
app.use(router),
app.use(compression());


router.get("/", function(req,res) {
	res.end('Something has gone wrong');
});


app.listen(3000);

console.log('Server running');