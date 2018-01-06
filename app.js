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
	seats: Number,
	type: Number,
	latitude: Number,
	longitude: Number
});

//bookings schema
var bookingSchema = mongoose.Schema({
	saloon_email: String,
	user_email: String,
	service: String,
	amount: String
});


//models for schemas
var User = mongoose.model('User',userSchema);
var Saloon = mongoose.model('Saloon',saloonSchema);
var Booking = mongoose.model('Booking', bookingSchema);


app.get('/',function(req, res){
	res.render('index');
});


//login for user and saloon
app.post('/login', function(req, res){
	//use token for different search for user and saloons
	var token = 'saloons';
	if(token == 'users'){
		User.findOne({email: req.body.email},function(err,data){
			if(err || data.length == 0){
				res.end(JSON.stringify(0));
			}
			var hashPass = data.password;
			if( bcrypt.compareSync(req.body.password,hashPass)){
				res.end(JSON.stringify(data));
			}else{
				res.end(JSON.stringify(0));
			}
		});		
	}else if(token == 'saloons'){
		Saloon.findOne({email: req.body.email},function(err,data){
			if(err || data.length == 0){
				res.end(JSON.stringify(0));
			}
			var hashPass = data.password;
			if( bcrypt.compareSync(req.body.password,hashPass)){
				res.end(JSON.stringify(data));
			}else{
				res.end(JSON.stringify(0));
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
			// seats: saloon.seats,
			// type: saloon.type,
			// latitude: saloon.latitude,
			// longitude: saloon.longitude,
			seats: 0,
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


//add services to saloons
app.post('/addServices', function(req, res){
	var service = req.body;
	Saloon.update({_id: req.email },{ $push: {services:{
		name: service.name,
		amount: service.amount}
		}
	}, function(err){
		if(err){
			res.end(JSON.stringify(0));
		}else{
			res.end("added successfully");
		}
	});
});


//get saloons according to user search
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

//setBooking for users
app.post('/bookService', function(req, res){
	var booking = req.body;
	var book = Booking({
		saloon_email: booking.saloon_email,
		user_email: booking.user_email,
		service: booking.service,
		amount: booking.amount
	});
	book.save(function(err){
		if(err){
			res.end(JSON.stringify(0));	
		}else{
			res.end('Booked successfully')
		}
	});
});

//get User Bookings



app.listen(8080);
