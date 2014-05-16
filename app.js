/**
 * New node file
 */
var express = require('express');

var app = express();
app.use(app.router);
// needed to get body of post message
app.use(express.bodyParser());
app.use(express.static(__dirname + '/public')); //setup static public directory
//app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views

var ms = require(__dirname + '/routes/mustache_server');


app.get('/', function(req, res) {
	ms.mustachio('login', {}, function(err, page) {
		if(err) {
			res.end();
			return;
		}
		res.send(page);
		res.end();
	});
});

app.post('/login', function(req, res) {
	
	var username = req.body.username;
	console.log('username ' + username + ' logging in' );
	res.send('Hello ' + username);
});

app.listen(3000, 'localhost');

