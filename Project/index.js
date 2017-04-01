var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3000;
var path=require('path');
var testFunctions = require('./functions/javaScriptTestFunctionServerSide');

/*
 *	The Express.static method causes the localHost to SEE the files included in that folder
 *	Example: an HTML file tries to call a x.js file to load some javascript
 *  but because the HTML was initially loaded by node.js, the server would then try to
 *  call "localhost:3000/x.js" which does not exist!
 *  The actual x.js file would still be in e.g. C://somefolder/somefolder2/javascript/x.js
 *  but node cannot see it. WIth express.static('public'), you can put the x.js file in the public
 *  folder to make it visivle to "localhost:3000/javascript/x.js
 *  For more info visit http://expressjs.com/en/starter/static-files.html
 */
app.use(express.static('public'));

app.get('/', function(req,res){
	res.sendFile(__dirname + '/public/index.html');
});

//Another path that loads another html file
//Basically used for better understanding of node functionality
//Calls the dedicated html file when invoked
//Also sends a small feedback to the console
app.get('/test', function(req,res){
	res.sendFile(__dirname + '/public/test.html');
	console.log('Redirected to localHost:3000/test');
	testFunctions.testAlert;
});

io.on('connection',function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});
//The server receives the "chat message" call from index.html.
//As soon as it gets the "chat message" call from html, it executes the function given in socket.on('chat message', xxxx')
io.on('connection', function(socket){
	socket.on('chat message', function(msg){
		io.emit('chat message',msg);
		console.log('message: ' + msg);
	});
});

http.listen(port,function(){
	console.log('listening on port: '+port);
});