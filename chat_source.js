/***********************************************************
 * Insert into client.js
 *
 *

var FADE_TIME = 150; // ms
var TYPING_TIMER_LENGTH = 400; // ms
var $window = $( window );
var $usernameInput = $( '.usernameInput' );
var $messages = $( '#messages' );
var $inputMessage = $( '.inputMessage' );
var $loginPage = $('.login.page'); // The login page
var $chatPage = $('.chat.page'); // The chatroom page
var username;
var connected = false;
var typing = false;
var lastTypingTime;
var $currentInput = $usernameInput.focus();

 var addParticipantsMessage = function(data) {
	var message = '';
	if (data.numUsers === 1) {
		message += "there's 1 participant";
	} else {
		message += "there are " + data.numUsers + " participants";
	}

	log(message);
};

var setUsername = function() {
	username = cleanInput($usernameInput.val().trim());
	if(username) {
		$loginPage.hide();
		$chatPage.show();
		$loginPage.off('click');
		$currentInput = $inputMessage.focus();
		socket.emit('add user', username, code);
	}
};

var sendMessage = function() {
	var message = cleanInput($inputMessage.val());
	if (message && connected) {
		$inputMessage.val('');
		addChatMessage({
			username: username + ' ',
			message: message
		});
		socket.emit('new message', message, code);
	}
};


var log = function(message, options)
{
	var $el = $('<li>').addClass('log').text(message);
	addMessageElement($el, options);
}

var addChatMessage = function(data, options)
{
	var $typingMessages = getTypingMessages(data);
	options = options || {};
	if($typingMessages.length !== 0)
	{
		options.fade = false;
		$typingMessages.remove();
	}

	var $usernameDiv = $('<span class="username"/>')
		.text(data.username)
		.css('color', getUsernameColor(data.username))
		.css('font-weight', '800')
		.css('font-family', 'Helvetica');

	var $messageBodyDiv = $('<span class="messageBody">')
		.text(data.message);

	var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, ' ', $messageBodyDiv);

    addMessageElement($messageDiv, options);
};

var addChatTyping = function(data)
{
	getTypingMessages(data).fadeOut(function()
	{
		$(this).remove();
	});
};

var removeChatTyping = function(data)
{
	getTypingMessages(data).fadeOut(function ()
	{
			$(this).remove();
	});
	}

var addMessageElement = function(el, options)
{
	var $el = $(el);

    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
 };

 var cleanInput = function(input)
 {
 	return $('<div/>').text(input).text();
 }

var updateTyping  = function()
{
	if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing', code);
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing', code);
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
};

var getTypingMessages = function(data)
{
	return $('.typing.message').filter(function (i) {
			return $(this).data('username') === data.username;
	});
	};

var getUsernameColor = function(username)
{
// Compute hash code
var hash = 7;
for (var i = 0; i < username.length; i++) {
   hash = username.charCodeAt(i) + (hash << 5) - hash;
}
// Calculate color
var index = Math.abs(hash % COLORS.length);
return COLORS[index];
};

$window.keydown(function(event)
{
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing', code);
        typing = false;
      } else {
        setUsername();
      }
    }
});

$inputMessage.on('input', function()
{
	updateTyping();
});

$loginPage.click(function ()
{
	$currentInput.focus();
});

// Focus input when clicking on the message input's border
$inputMessage.click(function ()
{
	$inputMessage.focus();
});

socket.on('poll submission', function(code)
{
	initialLoad = false;
	console.log('poll submission');
	spawnChart(code);
});

socket.on('login', function (data) {
	console.log('login event');
connected = true;
// Display the welcome message
var message = "Welcome to Pollgeni.us Chat – ";
log(message, {
  prepend: true
});
addParticipantsMessage(data);
});

// Whenever the server emits 'new message', update the chat body
socket.on('new message', function (data) {
	console.log('new message');
addChatMessage(data);
});

// Whenever the server emits 'user joined', log it in the chat body
socket.on('user joined', function (data) {
	console.log(data.username + " joined")
log(data.username + ' joined');
addParticipantsMessage(data);
});

// Whenever the server emits 'user left', log it in the chat body
socket.on('user left', function (data) {
log(data.username + ' left');
addParticipantsMessage(data);
removeChatTyping(data);
});

// Whenever the server emits 'typing', show the typing message
socket.on('typing', function (data) {
addChatTyping(data);
});

// Whenever the server emits 'stop typing', kill the typing message
socket.on('stop typing', function (data) {
removeChatTyping(data);
});

***********************************************************/

/***********************************************************
 * Will be added to the app.js page within the io.on('connection', callback)
 *
 *
	socket.on('add user', function(username, code)
	{
		console.log(username);
		socket.username = username;
		socket.room = code;

		if(usernames[code]) {
			usernames[code].push(username);
			++numUsers[code];
		} else {
			usernames[code] = [];
			usernames[code].push(username);
			numUsers[code] = 1;
		}
		addedUser = true;
		io.to(code).emit('login', {
			numUsers: numUsers[code]
		});

		socket.broadcast.to(code).emit('user joined', {
			username: socket.username,
			numUsers: numUsers[code]
		});
	});

	socket.on('typing', function(code)
	{
		socket.broadcast.to(code).emit('typing', {
			username: socket.username
		});
	});


	socket.on('stop typing', function(code)
	{
		socket.broadcast.to(code).emit('stop typing', {
			username: socket.username
		});
	});


	socket.on('new message', function(data, code)
	{
		console.log(data);
		console.log(code);
		console.log(socket.rooms);
		socket.broadcast.to(code).emit('new message', {
			username: socket.username,
			message: data
		});
	});

	socket.on('disconnect', function()
	{
		console.log(socket.username);
		console.log(socket.room + ' this is the poll\'s room');
		var room = socket.room || null;
		if(addedUser) {
			console.log('true added user');
			delete usernames[room][socket.username];
			--numUsers[room];
		}

		socket.broadcast.to(room).emit('user left', {
			username: socket.username,
			numUsers: numUsers[room]
		});

		socket.leave(room);
		console.log('disconnecting');
	});

********************************************************/