var express = require('express');
var app = express();
var mongo = require('mongodb');
var crypt = require('crypto');

var mongodb = mongo.MongoClient;

var url = "mongodb://localhost:27017/Nycia";

app.post('/login', function(req, res){

	// console.log(req.params);
	// var user = {
	// 	user: {
	// 		username: req.params.name,
	// 		password: req.params.pass
	// 	}
	// };
	// res.end(JSON.stringify(user));
	console.log("works");
	res.end("working");

});

app.post('/signup',function(req, res){

	mongodb.connect(url, function(err, db) {
	  if (err) throw err;
	  const pass = crypt.createHash('sha256', 'password123')
	  console.log(pass);
	  var user = {name: "Jatin", password: pass};
	  db.collection("Users").insertOne(user, function(err,data){
	  	if(err) throw err;
	  	console.log(data.password);
	  	db.close();
	  });
	});

});

app.listen(4000);
