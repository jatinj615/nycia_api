//libraries
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var fileupload = require('express-fileupload');
var fs = require('fs');

//database connect
mongoose.connect('mongodb://localhost/nycia');

//bodyparser
app.use(bodyParser());
app.use(fileupload());
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
	seats: {type: Number, default: null},
	url: {type: Array, default: null},
	logo: {type: String, default: null},
	type: Number,
	latitude: Number,
	longitude: Number
});

//bookings schema
var bookingSchema = mongoose.Schema({
	saloon_email: String,
	saloon_phone: String,
	user_phone: String,
	user_email: String,
	service: String,
	amount: String,
	status: String,
	date: String
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
	// var token = req.body.token;
	var token = 'users';
	if(token == 'users'){
		User.findOne({email: req.body.email},function(err,data){
			if(err || data == null){
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
			if(err || data == null){
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
	var token = req.body.token;
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
			seats: saloon.seats,
			type: saloon.type,
			latitude: saloon.latitude,
			longitude: saloon.longitude,
			// seats: 10,
			// type: 0,
			// latitude: 0.002145435,
			// longitude: 0.1234562,
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


//set seats of the saloon for today
app.post('/setSeats',function(req,res){
	var saloon = req.body;
	Saloon.updateOne({email: saloon.email},{seats: saloon.seats},function(err, data){
		if(err){
			res.end('0');
		}else{
			res.end('1');
		}
	});
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
		if(err || data == null){
			res.end(JSON.stringify(0));
		}else{
			res.end(JSON.stringify(data));
		}
	});
});


//setBooking for users
app.post('/bookService', function(req, res){
	var booking = req.body;
	//today's date
	var date = new Date();
	var d = date.getDate()+'-'+date.getMonth()+1+'-'+date.getFullYear();
	Booking.find({saloon_email: booking.saloon_email, date: d}, function(err, data){
		//get seats of saloons from application
		if(data.length < booking.saloon_seats){
			var book = Booking({
				saloon_email: booking.saloon_email,
				saloon_phone: booking.saloon_phone,
				user_phone: booking.user_phone,
				user_email: booking.user_email,
				service: booking.service,
				amount: booking.amount,
				status: 'booked',
				date: d,
			});
			book.save(function(err){
				if(err){
					res.end(JSON.stringify(0));
				}else{
					res.end('Booked successfully');
				}
			});
		}else{
			res.end('Not Available');
		}
	});
	
});


//get User Bookings
app.post('/getUserBookings', function(req,res){
	var user = req.body;
	Booking.find({user_email: user.email}, function(err, data){
		if(err || data == null){
			res.end(JSON.stringify(0));
		}else{
			res.end(JSON.stringify(data));
		}
	});
});


//get Saloons Bookings
app.post('/getSaloonBookings', function(req, res){
	var saloon = req.body;
	Booking.find({saloon_email: saloon.email}, function(err, data){
		if(err || data == null){
			res.end(JSON.stringify(0));
		}else{
			res.end(JSON.stringify(data));
		}
	});
});


//upload pics of saloon
app.post('/uploadPics', function(req, res){
	var path = __dirname+'/'+req.body.saloon_email;
	var i;
	for(i = 0; i < 1; i++){//change upper limit according to images
		var image = req.files.image;//change single image to array of images
		if(!fs.existsSync(path)){
			fs.mkdirSync(path);
		}
		image.mv(path+'/'+image.name, function(err){
			if(err){
				res.end('0');
			}else{
				Saloon.update({email: req.body.saloon_email},{$push: {
					url: {
						picurl: path+'/'+image.name,
					}
				}}, function(err){
					if(err){
						res.end('0');
					}else{
						res.end('1');
					}
				});
			}
		});
	}
	
});


//upload logo
app.post('/uploadLogo', function(req, res){
	var path = __dirname+'/'+req.body.saloon_email+'/logo';
	var logo = req.files.logo;
	if(!fs.existsSync(path)){
		fs.mkdirSync(path);
	}
	logo.mv(path+'/'+logo.name, function(err){
		if(err){
			res.end('0');
		}else{
			Saloon.update({email: req.body.saloon_email},{$push: {
				logo: path+'/'+logo.name
			}}, function(err){
					if(err){
						res.end('0');
					}else{
						res.end('1');
					}
			});
		}
	});
});

//update saloon info
app.post('/updateSaloon', function(req, res){
	var saloon = req.body;
	var hashPass = bcrypt.hashSync(saloon.password, 10);
	Saloon.Update({email: saloon.email},{
		name: saloon.name,
		address: saloon.address,
		locality: saloon.locality,
		state: saloon.state,
		phone_no: saloon.phone_no,
		seats: saloon.seats,
		type: saloon.type,
		latitude: saloon.latitude,
		longitude: saloon.longitude,
		password: hashPass
	}, function(err){
		if(err){
			res.end('0');
		}else{
			res.end('1');
		}
	});
});

app.listen(8080);
