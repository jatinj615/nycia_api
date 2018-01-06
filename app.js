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
	locality: String,
	state: String,
	email: String,
	password: String,
	phone_no: String,
	services: {type: Array, default: null},
	timeslot: Number,
	type: Number,
	latitude: Number,
	longitude: Number
});


//models for schemas
var User = mongoose.model('User',userSchema);
var Saloon = mongoose.model('Saloon',saloonSchema);


app.get('/',function(req, res){
	res.render('index');
});


//login for user and saloon
app.post('/login', function(req, res){
	//use token for different search for user and saloons
	var token = 'saloons';
	if(token == 'users'){
		User.findOne({email: req.body.email},function(err,data){
			if(err){
				res.end(0);
			}
			var hashPass = data.password;
			if( bcrypt.compareSync(req.body.password,hashPass)){
				res.end(JSON.stringify(data));
			}else{
				res.end(0);
			}
		});		
	}else if(token == 'saloons'){
		Saloon.findOne({email: req.body.email},function(err,data){
			if(err){
				res.end(0);
			}
			var hashPass = data.password;
			if( bcrypt.compareSync(req.body.password,hashPass)){
				res.end(JSON.stringify(data));
			}else{
				res.end(0);
			}
		});
	}
});


//signup for user and saloon
app.post('/signup',function(req, res){
	//use token for different signup for user and saloons
	var token = 'saloons'
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
				// console.log('saved');
				res.end(JSON.stringify(item));
			}
		});
	}else if(token == 'saloons'){
		var saloon = req.body;
		var hashPass = bcrypt.hashSync(saloon.password, 10);
		var item = Saloon({
			name: saloon.name,
			address: saloon.address,
			locality: saloon.locality,
			state: saloon.state,
			email: saloon.email,
			phone_no: saloon.phone_no,
			// type: saloon.type,
			// latitude: saloon.latitude,
			// longitude: saloon.longitude,
			timeslot: 0,
			type: 0,
			latitude: 0.002145435,
			longitude: 0.1234562,
			password: hashPass
		});
		item.save(function(err){
			if(err){
				res.end('exists');
			}else{
				// console.log('saved');
				res.end(JSON.stringify(item));
			}
		});
	}
});

app.post('/addServices', function(req, res){
	var service = req.body;
	Saloon.update({_id: req.email },{ $push: {services:{
		name: service.name,
		amount: service.amount}
		}
	}, function(err){
		if(err){
			res.end(0);
		}else{
			res.end("added successfully");
		}
	});
});


app.post('/getSaloons', function(req, res){
	var saloons = req.body;
	Saloon.find({$and: [{locality: saloons.locality}, {services: {$elemMatch: {name: saloons.service_name}}}]}, function(err, data){
		// console.log(data.length);
		if(err || data == null || data.length == 0){
			res.end(JSON.stringify(0));
		}else{
			res.end(JSON.stringify(data));
		}
	});
});

app.listen(8080);
