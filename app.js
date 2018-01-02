//libraries
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');


//database connect
mongoose.connect('mongodb://localhost/nycia');

//bodyparser
app.use(bodyParser());
//set viewEngine
app.set('view engine', 'ejs');


//schemas for database

//user schema
var userSchema = mongoose.Schema({
	name: String,
	email: String,
	password: String,
	phone_no: String
});

//saloon schema
var saloonSchema = mongoose.Schema({
	name: String,
	address: String,
	email: String,
	password: String,
	phone_no: String
});



//models for schemas
var User = mongoose.model('User',userSchema);
var Saloon = mongoose.model('Saloon',saloonSchema);

app.get('/',function(req, res){
	res.render('index');
});

app.post('/login', function(req, res){
	//use token for different search for user and saloons
	var token = 'users';
	if(token == 'users'){
		User.findOne({email: req.body.email},function(err,data){
			if(err) throw err;
			var hashPass = data.password;
			if( bcrypt.compareSync(req.body.password,hashPass)){
				res.end(JSON.stringify(data));
			}
		});
		// console.log(JSON.stringify(user));
		// res.end(user);		
	}else if(token == 'saloons'){
		Saloon.findOne({email: req.body.email},function(err,data){
			if(err) throw err;
			var hashPass = data.password;
			if( bcrypt.compareSync(req.body.password,hashPass)){
				res.end(JSON.stringify(data));
			}
		});
	}
});

app.post('/signup',function(req, res){
	//use token for different signup for user and saloons
	var token = 'users'
	// console.log(req.body);
	if(token == 'users'){
		var user = req.body;
		var hashPass = bcrypt.hashSync(user.password, 10);
		var item = User({
			name: user.name,
			email: user.email,
			phone_no: user.phone_no,
			password: hashPass
		});
		item.save(function(err){
			
			if(err){
				res.end('exists');
			}else{
				console.log('saved');
				res.end(JSON.stringify(item));
			}
		});
	}else if(token == 'saloons'){
		var saloon = req.body;
		var hashPass = bcrypt.hashSync(user.password, 10);
		var item = Saloon({
			name: saloon.name,
			address: saloon.address,
			email: saloon.email,
			phone_no: saloon.phone_no,
			password: hashPass
		});
		item.save(function(err){
			if(err){
				res.end('exists');
			}else{
				console.log('saved');
				res.end(JSON.stringify(item));
			}
		});
	}
	
	
});

app.listen(4000);
