$(function () {
    var socket = io();

    var $window = $(window);
    var $messageInput = $('#m').hide();
    var $usernameInput = $('#username');
    var $currentInput = $usernameInput.focus();
    var $messages = $('#messages');
    var inputTimer;

    var username;

    $messages[0].scrollTop = $messages[0].scrollHeight;

    function setUsername() {
        var input = $usernameInput.val().trim();
        if (input) {
            $usernameInput.fadeOut();
            $('#login-screen').fadeOut();
            username = input;
            $currentInput = $messageInput.show().focus();
            socket.emit('login', input);
        }
    }

    function sendMessage() {
        var message = $messageInput.val().trim();
        if (message) {
            socket.emit('chat message', message);
            addChatMessage({name: username, text: message});
            $messageInput.val('');
        }
    }

    function addChatMessage(data) {
        $messages.append($('<li>').text(data.name + ": " + data.text));
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    function addInfoMessage(message) {
        $messages.append($('<li style="background:lightblue; font-style: italic;">').text(message));
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    function addTypingMessage(name) {
        $messages.append($('<li style="background:lightyellow;font-style:italic;">').text(name + ' is typing...').attr('id', name + '-typing'));
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    function removeTypingMessage(name) {
        $('#' + name + '-typing').remove();
    }

    function stoppedTyping() {
        socket.emit('stopped typing');
    }

    $messageInput.on('keyup', function () {
        clearTimeout(inputTimer);
        inputTimer = setTimeout(stoppedTyping, 1000);
    });

    $messageInput.on('keydown', function (event) {
        if(event.which > 31 && event.which < 128) {
            socket.emit('typing');
            clearTimeout(inputTimer);
        }
    });

    $window.keydown(function (event) {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                sendMessage();
            } else {
                setUsername();
            }
        }
    });

    socket.on('chat message', function (data) {
        addChatMessage(data);
    });

    socket.on('login', function (data) {
        addInfoMessage(data.name + ' logged in.');
    });

    socket.on('logout', function (data) {
        addInfoMessage(data.name + ' logged out.');
    });

    // socket.on('reconnect', function () {
    //     addInfoMessage('You\'ve reconnected!');
    //     socket.emit('relog', username);
    // });

    socket.on('typing', function (data) {
        addTypingMessage(data.name)
    });

    socket.on('stopped typing', function (data) {
        removeTypingMessage(data.name)
    });

    // socket.on('relog', function(name) {
    //     addInfoMessage(name + ' reconnected.');
    // })
});