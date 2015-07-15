
		var FADE_TIME = 150; // ms
		var TYPING_TIMER_LENGTH = 400; // ms
		var COLORS = [
		'#e21400', '#91580f', '#f8a700', '#f78b00',
		'#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
		'#3b88eb', '#3824aa', '#a700ff', '#d300e7'
		];
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

	$( document ).ready(function()
	{
		// $( '.chat.page' ).hide();
	});

	var addParticipantsMessage = function(data)
	{
		var message = '';
		if(data.numUsers == 1) {
			message += "there's 1 participant";
		} else {
			message += "there are " + data.numUsers + " participants";
		}

		log(message);
	}

	var setUsername = function()
	{
		username = cleanInput($usernameInput.val().trim());

		if(username) {
			// $loginPage.css('margin-top', '0px');
			// $loginPage.fadeOut();
			$loginPage.hide();
			$chatPage.show();
			$loginPage.off('click');
			$currentInput = $inputMessage.focus();

			console.log('emitting add user ' + username);
			socket.emit('add user', username, code);
		}
	}

	var sendMessage = function()
	{
		var message = cleanInput($inputMessage.val());

		if(message && connected)
		{
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