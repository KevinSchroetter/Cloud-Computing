// Server

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var connections;

// Datenbank

var mongoose = require('mongoose');
mongoose.connect('mongodb://CCBSHSRT:CCBSHSRT1234@ds149820.mlab.com:49820/cloudcomputing');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('Database connected!');
});

var accountSchema = mongoose.Schema({
    username: String,
    password: String
});

var Account = mongoose.model('Account', accountSchema);

// Funktionen

app.get('/', function(req, res){
	res.sendFile(__dirname + '/login.html');
});

app.get('/index', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  
  socket.on('login request', function(data){	  
	 if(data.newuser === "true"){
		 Account.findOne({username: data.username}, function(err,account){
			 if (err){
				 return console.error(err);
			 }
			 else{
				if(account === null){
					 var user = new Account({username: data.username,password: data.password});
				 	  user.save(function (err, user) {
				 		  if (err){ 
				 			  return console.error(err);
				 		  }
				 		  else{
				 			 console.log('User '+data.username+' created a new account!');
				 			 socket.emit('login response',{successful: "true"});
				 		  }
				 	});
				 	
				}
				else{
					console.log('User '+data.username+' failed to create a new account!');
					socket.emit('login response',{successful: "false",reason: "Username already exists!"});
				}
			 }			
		 });	 	 	 	  
	 } 
	 else{
		 Account.findOne({username: data.username}, function(err,account){
			 if (err){
				 return console.error(err);
			 }
			 else{
				 if(account !== null){
					 if(account.password === data.password){
						 console.log('User '+data.username+' logged in!');
						 socket.emit('login response',{successful: "true"}); 
					 }
					 else{
						 console.log('User '+data.username+' entered wrong password!');
						 socket.emit('login response',{successful: "false",reason: "Wrong password!"}); 
					 }					 
				 }
				 else{
					 console.log('User '+data.username+' entered wrong name!');
					 socket.emit('login response',{successful: "false",reason: "Wrong name!"});
				 }
			 }			
		 });
	 }
  });  
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
