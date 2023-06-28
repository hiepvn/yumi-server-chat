var app = require('express')();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var Conf = require('./conf.js');
var User = require('./app/user')

var ManageServer = require('./app/manage_server');
var manager = new ManageServer(io); // manage server for clients

var HttpServer = require('./app/http_server');
var simpleHttp = new HttpServer();


app.get('/', function(req, res){
    res.send("ok");
});

server.listen(Conf.server.port, function() {
    console.log('listening on *:' + Conf.server.port);
});


function authenticate(socket, next){
    var token = socket.handshake.query["token"];
    simpleHttp.authen(token).then(function(response) {
        var data = response.data;
        if (data["status"] == "success") {
            var user = data["user"];
            socket.user = new User(user["id"], user["name"], user["gender"], user["birthday"], user["avatar"]);
            socket.user.socket_id = socket.id;
            socket.user.token = token;
            next();
        }
        else {
            console.log("authenticate: token: " + token + " => fail: ", response.data);
        }
    }).catch(function(error){
        console.log("authenticate: token: " + token + " => error: ", error);
        callback({"error": error});
    });
}


io.use(authenticate);
io.on('connection', function(socket){
    console.log('a user connected: ' + socket.user.id + ":" + socket.user.name + ' : ' + socket.user.token);
    manager.registerClient(socket);
});
