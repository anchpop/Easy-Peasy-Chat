var socket = io();
var loggedIn = true;
var lastChat = "";
var chatting = false;
var nick = '';
var oldTitle = "Easy Peasy Chat";

var ignore_list = [];

$(document).ready(function()
{
	//$('#login-modal').modal({keyboard: false, backdrop: 'static'});
	$('#login-modal').foundation('reveal', 'open');
	var socket = io();

	$('#loginform').submit(function()
	{
		return false;
	});

	$('#mutebutton').click(function()
	{
		if(sound)
		{
			sound = false;
			$('#mutebutton').html('<i class="fa fa-volume-off"></i>');
		}
		else
		{
			sound = true;
			$('#mutebutton').html('<i class="fa fa-volume-up"></i>');
		}
	});

	socket.on('connect', function()
	{
		console.log('connected')
		$('#loginsubmit').prop('disabled', false).removeClass('btn-default').addClass('btn-primary').text('Start chatting!');
		$('#loginform').submit(function()
		{
			nick = $('<div/>').text(($('#nickname').val())).html();

			socket.emit('login', { nick: nick });
			
			$('#login-modal').foundation('reveal', 'close');
			return false;
		});
		
		socket.on('chat message', function(msg, userFrom)
		{
			if(msg)
			{
				var scroll_down = false;
				if ($(window).scrollTop() + $(window).height() + 300 >= $('body,html')[0].scrollHeight)
				{
					scroll_down = true;
				}

				var toAdd = ((moment().format('h:mm a') + ": " + msg).replace(/^(.+?&gt)/, '<span class="namebox">$1</span>'))
				console.log(toAdd)
				$('#messages').append($('<li>').html(toAdd));
				
				try
				{
					if(userFrom == nick)
					{
						$('#messages > li').filter(':last').addClass('highlight');
					}
				}
				catch(e) {}

				if (scroll_down) scrollDown();
			}
		});
		socket.on('information', function(msg, userFrom)
		{
			if (msg)
			{
				if ($(window).scrollTop() + $(window).height() + 300 >= $('body,html')[0].scrollHeight)
				{
					scrollDown();
				}
				$('#messages').append($('<li class="information">').html( moment().format('h:mm a') + ": " + msg));
			}
		});

		socket.on('disconnect', function()
		{
			var scroll_down = false;
			if ($(window).scrollTop() + $(window).height() + 300 >= $('body,html')[0].scrollHeight)
			{
				scroll_down = true;
			}
			$('#messages').append($('<li>').html(moment().format('h:mm:ss a') + ":  <span class=\"information\">" + "You were disconnected from the server :(</span>"));
			if (scroll_down) scrollDown();
		});
	});

	socket.on('loggedIn', function()
	{
		loggedIn = true;
		$('#sendbutton').removeAttr('disabled');
		$('#chatbar').unbind('submit');
		$('#chatbar').submit(function()
		{
			var msgInBox = $('#m').val();
			socket.emit('chat message', { message: msgInBox });
			$('#m').val('');
			scrollDown(($(window).scrollTop() + $(window).height() + 300 >= $('body,html')[0].scrollHeight));
			return false;
		});
	});
});

function scrollDown()
{
	$('body,html').stop(true,true).animate({ scrollTop: $('body,html')[0].scrollHeight}, 200); // Scroll to the bottom of the screen over 200 milliseconds
}


setRandomUsername = function()
{
	var tempNick = '';
	var combine = [
	['The', 'Not-A', 'Totally-A', 'A', ''], 
	['Super', 'Old-Fashioned', 'Mysterious', 'Funny', 'Happy', 'Insane', 'Smart', 'Evil', 'Chiropractic', 'Red', 'Blue', 'Octo', 'Adorable', 'Helpful', 'Rich', 'Fancy', ''], 
	['Panda', 'Monkey', 'Alligator', 'Cat', 'Man', 'Dictator', 'Aristocrat', 'Human', 'Slacker', 'Ninja', 'Therapist', 'Do-Gooder', 'Capitalist']
	];

	for(var x = 0; x < combine.length; x++)
	{
		var toAdd = combine[x][Math.floor(Math.random()*combine[x].length)];

		if(x !== 0 && toAdd && tempNick)
		{
			if (tempNick[tempNick.length-1] == "A" && ['A', 'E', 'I', 'O', 'U'].lastIndexOf(toAdd[0]) > -1)
				tempNick = tempNick + 'n';
			
			tempNick = tempNick + '-';
		}
		tempNick = tempNick + toAdd
	}
	$('#nickname').val(tempNick);
};


$('#pickforme').click(setRandomUsername);
