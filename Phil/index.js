var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
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


//----------------------------------------------------------------

var findAccount = function(db, callback,data,socket) {
	var cursor =db.collection('accounts').find({"username":data.username});
   	cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc !== null) {
         console.dir(doc);
         console.log('Account found!');
         if(doc.password === data.password){
        	 socket.emit('login response',{successful: "true"});
         }
         else{
        	 socket.emit('login response',{successful: "false", reason: "Wrong Password!"});
         }
      } else {
         callback();
      }
   });
};

var insertDocument = function(db, callback,data,socket){
	var cursor =db.collection('accounts').find({"username":data.username});
   	cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc !== null) {
         console.dir(doc);
         console.log('Account found!');
         socket.emit('login response',{successful: "false", reason: "Name is already forgiven!"});
      } else {
    	  db.collection('accounts').insertOne( {
		      "username" : data.username,
		      "password" : data.password
		   }, function(err, result,socket) {
		    assert.equal(err, null);
		    console.log("Inserted a document into the Account collection.");
		    socket.emit('login response',{successful: "true"});
		    callback();
		  });
    	 callback();
      }
   });					   
};

//----------------------------------------------------------------

app.get('/', function(req, res){
  res.sendFile(__dirname + '/login.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  
  socket.on('login request', function(data){
	 if(data.newuser === "true"){			
	 	  var user = new Account({username: data.username,password: data.password});
	 	  console.log(user.username);
	 	  user.save(function (err, user) {
	 		  if (err) return console.error(err);
	 		});	 	  
	 } 
	 else{
		 Account.findOne({username: data.username}, function(err,account){
			 if (err){
				 return console.error(err);
			 }
			 else{
				 if(account !== null){
					 console.log('login successful!');
					 io.emit('login response','true');
				 }
				 else{
					 console.log('login failed!');
					 io.emit('login response','false');
				 }
			 }			
		 });
	 }
  });  
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
