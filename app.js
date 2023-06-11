var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Conf = require('./conf.js');
var User = require('./app/user')
var ManageServer = require('./app/manage_server');

var manager = new ManageServer(io); // manage server for clients

app.get('/', function(req, res){
    res.send("ok");
});

http.listen(Conf.server.port, function() {
    console.log('listening on *:' + Conf.server.port);
});



function authenticate(socket, next){
    var id = socket.handshake.query["id"];
    var token = socket.handshake.query["token"];
    var name = socket.handshake.query["name"];
    var gender = socket.handshake.query["gender"];
    var birthday = socket.handshake.query["birthday"];
    var avatar = socket.handshake.query["avatar"];

    console.log("authenticate: " + id + " " + token + " " + name + " " + gender + " " + birthday + " " + avatar);

    socket.user = new User(id, token, name, gender, birthday);
    socket.user.socket_id = socket.id;

    next();
}


io.use(authenticate);
io.on('connection', function(socket){
    console.log('a user connected: ' + socket.user.name + ' : ' + socket.id);
    manager.registerClient(socket);
});
