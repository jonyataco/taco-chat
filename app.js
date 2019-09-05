// Setting up libraries to be used
let express = require('express'); 
let socket = require('socket.io');
let ejs = require('ejs');
let PORT = process.env.PORT || 3000

// Setting up the app, server, and view engine
let app = express();
let server = app.listen(PORT, function () {
	console.log(`listening to requests on ${port}`);
});
app.set('view engine', 'ejs');
// Middleware to server static files such as CSS and client side JS
app.use(express.static('public'));

// Socket setup. An instance of IO will setup on the designated server
let io = socket(server);

// ROUTING
app.get('/', (req, res) => {
	res.render('index');
});

/* An object to hold the users that are currently connected.
 * Users are stored as a key-value pair. 
 * Key = Username, Value = socket.ID
 * Since an Object does not internally keep track
 * of the number of keys/properties it has, then we have create a tracker 
 * variable so we don't have to iterate over the property array which can take
 * O(n).
 */
let users = {}
let numUsers = 0;

// SERVER LOGIC FOR HANDLING CHAT
io.on('connection', (socket) => {
	io.emit('usersCount', numUsers);

	/* Disconnect can happen from the main page before a user even submits
	 * a username so we want to check if the disconnected socket is part 
	 * of the users associative array
	 */
	socket.on('disconnect', () => {
		if (socket.id in users) {
			let disconnectedUser = users[socket.id];
			delete users[socket.id];
			--numUsers;
			io.emit('usersCount', numUsers);
			io.to('main room').emit('disconnectEvent', disconnectedUser);
		}
	});

	/* Check if the username is already taken */
	socket.on('usernameCheck', (username) => {
		let result;
		if (Object.values(users).includes(username))
			result = false;
		else {
			users[socket.id] = username;
			++numUsers;
			socket.join('main room');
			io.to('main room').emit('joinedEvent', username);
			io.emit('usersCount', numUsers);
			result = true
		}
		
		socket.emit('usernameResult', result);
	});

	socket.on('sendMessage', (message) => {
		let data = {user: users[socket.id],
					body: message};
		socket.to('main room').emit('receiveMessage', data);
	})
});

