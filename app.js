var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var crypto = require('crypto');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
require('array.prototype.find');

// This here is the admin password. For obvious reasons, set the ADMINPASS variable in production.
//var amdinP = String(process.env.ADMINPASS || "testpassword");

server.listen(Number(process.env.PORT || 5000));

app.use(express.static(path.join(__dirname, 'public')));

var index = require('./routes/index');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

var users = [];


io.on('connection', function(socket)
{
	var nick = "";
	
	socket.on('login', function(data)
	{
		try
		{
			if(getUserByNick(data.nick))
			{
				socket.emit('information', "The nickname you chose was in use.");
				socket.conn.close();
			}
			else if(!data.nick)
			{
				socket.emit('information', "You need a nickname.");
				socket.conn.close();
			}
			else
			{
				data.socket = socket;

				nick = (data.nick).replace('&lt;', '').replace('&gt;', '');
				data.nick = nick;

				users.push(data);
				socket.emit('loggedIn');

				user = getUserByNick(nick)

				socket.join('bigroom');
				io.to('bigroom').emit('information', user.nick + " has joined.");
				console.log(nick +" has joined. IP: " + socket.handshake.address.address);
			}
		}
		catch(e)
		{
			console.log(e);
		}
	});

	socket.on('chat message', function(data)
	{
		try
		{
			var user = getUserByNick(nick);
			if(data.message != "" && user)
			{
				// escape html
				message = escapeHTML(data.message);

				io.to('bigroom').emit('chat message', '&lt' + user.nick + '&gt ' + message, user.nick);
			}
		}
		catch(e)
		{
			console.log(e)
		}
	});

	socket.on('disconnect', function()
	{
		try
		{
			var user = getUserByNick(nick);
			if(user)
			{
				io.to('bigroom').emit('information', nick + " has left.");
				users.remove(user);
			}
		}
		catch(e)
		{
			console.log(e)
		}
	});

});

// ==================================
// ==================================

function escapeHTML(str)
{
	str = str.replace(/;/g, "&#59;"); 			//escape ;
	str = str.replace(/&([^#$])/, "&#38;$1");	//escape &
	str = str.replace(/</g, "&lt;");  			//escape <
	str = str.replace(/>/g, "&gt;");  			//escape >
	str = str.replace(/"/g, "&quot;");			//escape "
	str = str.replace(/'/g, "&#39;"); 			//escape '
	str = str.replace(/\s+$/g, '');             //Remove trailing whitespace
	return str
}

function getUserByNick(nick)
{
	var userscopy = users;
	for(var x = 0; x < userscopy.length; x++)
	{
		if(userscopy[x].nick.toUpperCase() === nick.toUpperCase())
		{
			return userscopy[x];
		}
	}
	return null;
}

function getUserByToken(token)
{
	var userscopy = users;
	for(var x = 0; x < userscopy.length; x++)
	{
		if(userscopy[x].token === token)
		{
			return userscopy[x];
		}
	}
	return null;
}


app.use('/', index);
app.use('/legal', function(req, res)
{
	res.render('legal');
});

/// catch 404 and forward to error handler
app.use(function(req, res, next)
{
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development')
{
	app.use(function(err, req, res, next)
	{
		res.status(err.status || 500);
		res.render('error',
		{
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next)
{
	res.status(err.status || 500);
	res.render('error',
	{
		message: err.message,
		error: {}
	});
});

Array.prototype.remove = function()
{
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

module.exports = app;




// Print a message for testing
console.log("Server up, and listening on port 5000!")