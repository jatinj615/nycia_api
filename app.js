//libraries
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var crypt = require('crypto');
var bodyParser = require('body-parser');


//database connect
var url = "mongodb://localhost:27017/Nycia";
mongoose.createConnection(url,{
	useMongoClient: true,
});

//bodyparser
app.use(bodyParser());
//set viewEngine
app.set('view engine', 'ejs');

var userSchema = mongoose.Schema({
	name: String,
	email: String,
	password: String,
	phone_no: String,
});

app.get('/',function(req, res){
	res.render('index');
});

app.post('/login', function(req, res){

	console.log(req.body);
	var user = {
		user: {
			username: req.body.name,
			password: req.body.lastname
		}
	};
	res.end(JSON.stringify(user));
	console.log("works");
	// res.end("working");

});

app.post('/signup',function(req, res){

	mongodb.connect(url, function(err, db) {
	  if (err) throw err;
	  const pass = crypt.createHash('sha256', 'password123')
	  // console.log(pass);
	  var user = {name: "Jatin", password: pass};
	  db.collection("Users").insertOne(user, function(err,data){
	  	if(err) throw err;
	  	console.log(data.password);
	  	db.close();
	  });
	});

});

app.listen(4000);
