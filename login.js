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


app.get('/test', function(request, response) {
	if (request.session.loggedin) {
		response.render('test.ejs',{user:JSON.stringify(request.session.username)});
		//,{user:request.session.username}
		//response.sendFile(path.join(__dirname,'/public/test.html'));
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

//app.use('/test',express.static('test.html'));
app.listen(3000);
