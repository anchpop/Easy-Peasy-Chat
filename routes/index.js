var express = require('express');
var router = express.Router();

router.get('/', function(req, res)
{
	res.render('index', { title: 'Easy Peasy Chatroom', version: 'Version 0.0.1' });
});

module.exports = router;
