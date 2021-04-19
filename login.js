var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'Peter/1478',
	database : 'logins'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
/*app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');*/





app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());




app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname,'/public/index.html'));
});

app.use('/css',express.static(__dirname + '/public/css'));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);


app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {``
		connection.query('SELECT * FROM login_table WHERE uname = ? AND psswd = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/test');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});


app.post('/addMsg', function(request, response){
	var messages = [];
	messages.push(request.body.Textbox);
	if (request.body.newTextbox){
		messages = messages.concat(request.body.newTextbox);
	}
	if (request.session.loggedin){
		for (let msg of messages){
			if (msg !== ""){
				let stmt = 'INSERT INTO messages (uname, chip_id, message_id, message) VALUES (?, ?, ?, ?)';
				let inserts = [request.session.username, 'test chip', 'test message', msg];
				connection.query(stmt, inserts, (err, results, fields) => {
  					if (err) {
    					return console.error(err.message);
  					}
  					// get inserted id
  					console.log('Todo Id:' + results.insertId);
				});
			}
		}
	}else{
		response.send('Please login to view this page!');
	}
	response.end();
});


app.get('/test', function(request, response) {
	if (request.session.loggedin) {
		let stmt = 'SELECT * from messages WHERE uname=?';
		let values = [request.session.username];
		var prvMsg;
		

		let myPromise = new Promise(function(myResolve, myReject) {
			// "Producing Code" (May take some time)
			connection.query(stmt, values, function (err, results, fields) {
  					if (err) {
  						myReject(console.error(err.message));
  					}else{
  						myResolve(JSON.stringify(results));
  					}
			})
		});

		// "Consuming Code" (Must wait for a fulfilled Promise)
		myPromise.then(
  			function(value) {
  				/* code if successful */ 
  				console.log(value);
  				response.render('test.ejs',{user:JSON.stringify(request.session.username), storedMsg:value});
  				response.end();

  			},
  			function(error) { /* code if some error */
  			    return error;
  			    console.log("error");
		    	response.end();

			}
		);

	} else {
		response.send('Please login to view this page!');
		response.end();
	}
});

//app.use('/test',express.static('test.html'));
app.listen(3000);
