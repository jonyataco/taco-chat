let socket = io();
let usernameForm = document.getElementById("login-form");
let messageForm = document.getElementById("message-form");
let textArea = document.forms["message-form"]["message"];
let warning = document.getElementById("warning");
let loginContainer = document.getElementById("container");
let chatContainer = document.getElementById("chat-container");
let containerStyle = window.getComputedStyle(loginContainer);
let chatStyle = window.getComputedStyle(chatContainer);
let chatWindow = document.getElementById("chat-window");

// Event listener for submit when user has entered a username for the chat room.
// Uses a socket.emit to poll the server and check if the username is taken.
usernameForm.addEventListener('submit', (event) => {
	event.preventDefault();
	let capturedUsername = document.forms["login-form"]["username"].value;
	if (capturedUsername === "") {
		warning.innerHTML = "Please enter a username at least one character long";
	}
	else
		socket.emit('usernameCheck', capturedUsername);
});

// Event listener for submit when the user sends a message
messageForm.addEventListener('submit', (event) => {
	event.preventDefault();
	let capturedMessage = document.forms["message-form"]["message"].value;
	document.forms["message-form"]["message"].value = '';
	addUserMessage(capturedMessage);
})

// Event listener for enter key in text area to submit form since default
// behavior is to make a new line
textArea.addEventListener('keypress', (event) => {
	if (event.keyCode === 13) {
		let capturedMessage = document.forms["message-form"]["message"].value;

		// Regex to check if the captured string only contained whitespaces
		if (!capturedMessage.replace(/\s/g, '').length) {
			document.forms["message-form"]["message"].value = '';
			addUserMessage(capturedMessage);
			textArea.blur();
		}
	}
});

function addUserMessage(message) {
	let newMessage = document.createElement('p');
	let userSender = document.createElement('p');
	newMessage.className = "user-message";
	newMessage.innerHTML = message;
	userSender.className = "user-identifier";
	userSender.innerHTML = "You";
	chatWindow.append(userSender);
	chatWindow.append(newMessage);
	socket.emit('sendMessage', message);
	chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addMessage(data) {
	let newMessage = document.createElement('p');
	let sender = document.createElement('p');
	newMessage.className = "other-message";
	newMessage.innerHTML = data.body;
	sender.className = "sender-identifier";
	sender.innerHTML = data.user;
	chatWindow.append(sender);
	chatWindow.append(newMessage);
	chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showJoin(user) {
	let joinedMessage = document.createElement('p');
	joinedMessage.className = "connection-status";
	joinedMessage.innerHTML = `${user} joined the chat`;
	chatWindow.append(joinedMessage);
	chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showDisconnect(user) {
	let disconnectMessage = document.createElement('p');
	disconnectMessage.className = "connection-status";
	disconnectMessage.innerHTML = `${user} has left the chat`;
	chatWindow.append(disconnectMessage);
	chatWindow.scrollTop = chatWindow.scrollHeight;
}

socket.on('usersCount', (count) => {
	document.getElementById("user-num").innerHTML = count;
});

socket.on('usernameResult', (result) => {
	if (result) {
		loginContainer.style.display = 'none';
		chatContainer.style.display = 'grid';
	}
	else {
		warning.innerHTML = "Someone in the chat already has that username! " +
							"Please choose a different username";
	}
});

socket.on('receiveMessage', (data) => {
	addMessage(data);
});

socket.on('joinedEvent', (user) => {
	showJoin(user);
});

socket.on('disconnectEvent', (user) => {
	showDisconnect(user);
});

