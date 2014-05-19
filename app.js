/**
 * Connect to an IBM LDAp thingy
 */
var express = require('express');
var routes = require('./routes');
var app = express();
var MongoStore = require('connect-mongo')(express);

// needed to get body of post message
app.use(express.bodyParser());
app.use(express.static(__dirname + '/public')); //setup static public directory
//app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views

app.use(express.cookieParser()); // for parsing request cookies
app.use(express.session({
	secret: 'lol',
	store: new MongoStore({
		url: 'mongodb://localhost:27017/cio'
	})
})); // for creating sessions and storing in mongoDB

//var ms = require(__dirname + '/routes/mustache_server');
app.use(app.router);


app.get('/login', routes.login);

app.post('/login', function(req, res) {
	
	var username = req.body.username;
	console.log('username ' + username + ' logging in' );
	res.end('Hello ' + username);
});


// ------- DON'T MESS WITH THE SESH --------

app.get('/sesh', function(req, res) {
	console.log(req.session);
	
	req.session.lastPage = '/sesh';
	res.end(JSON.stringify(req.session));
});

app.get('/alpha', store_sesh('/alpha'));
app.get('/bravo', store_sesh('/bravo'));
app.get('/charlie', store_sesh('/charlie'));
app.get('/delta', store_sesh('/delta'));

// redirects to the last page visited, else goes to /sesh
app.get('/echo', function(req, res) {
	if(!req.session.lastPage)
		res.redirect('/sesh');
	else
		res.redirect(req.session.lastPage);
});

// returns callback function that stores session data
function store_sesh (path) {
	return function (req, res) {	
		if(req.session.lastPage)
			res.write('Last page was ' + req.session.lastPage + '\n');
		req.session.lastPage = path;
		res.end('Welcome to ' + path);
	}
}

// ------------------- LISTEN UP -------------------

app.listen(3000, 'localhost');