require('date-utils');

var fs = require('fs');
var Path = require('path');

var util = require('util');
var uuid = require('node-uuid');

var Conf = require('../conf');
var Room = require('./room');
var User = require('./user');
var Comment = require('./comment');
var Message = require('./message');

var Utils = require('./utils');
var Error = require('./error_code')

var HttpServer = require('./http_server');
var simpleHttp = new HttpServer();


class ManageServer {

    constructor(io) {
        this.io = io;
        this.rooms = {}
        this.privateRooms = {}
    }

    registerClient(socket) {

        // room chat
        socket.on('room_join', function(data, callback) {
            this.roomJoin(socket, data, callback);
        }.bind(this));

        socket.on('room_leave', function(data, callback) {
            this.roomLeave(socket, callback);
        }.bind(this));

        socket.on('room_message', function(data, callback) {
            this.roomMessage(socket, data, callback);
        }.bind(this));

        // private chat
        socket.on('message_join', function(data, callback) {
            this.messageJoin(socket, data, callback);
        }.bind(this));

        socket.on('message_leave', function(data, callback) {
            this.messageLeave(socket, callback);
        }.bind(this));

        socket.on('message_send', function(data, callback) {
            this.messageSend(socket, data, callback);
        }.bind(this));

        socket.on('message_image', function(data, image, callback) {
            this.messageImage(socket, data, image, callback);
        }.bind(this));

        // disconnect
        socket.on('disconnect', function() {
            this.onDisconnect(socket);
        }.bind(this));
    }


    onDisconnect(socket) {
        this.leaveRoom(socket);
        this.leaveMessage(socket);
    };


    // room chat
    roomJoin(socket, data, callback) {
        var roomId = data.room_id;
        var room = this.rooms[roomId];
        if (!room) {
            room = new Room(roomId, Conf.MAX_USERS_PER_ROOM);
            this.rooms[roomId] = room
        }

        console.log('join to room: ' + socket.user.name  + ' -> ' + room.id + ' max user: ' + Conf.MAX_USERS_PER_ROOM);

        var result = room.enter(socket, socket.user);
        if(result === Error.NO_ERROR) {
            socket.broadcast.to(room.id).emit("room_join", socket.user.toJson());
            callback({'ok': true, 'users': room.getOtherUsers(socket)});
        }
        else {
            callback({'ok': false, 'reason': result});
        }
    };


    roomLeave(socket, callback) {
        this.leaveRoom(socket);
        callback({'ok': true});
    };


    roomMessage(socket, data, callback) {
        var roomId = socket.roomId;
        if (!roomId) {
            this.callbackError(callback);
            return;
        }
        var user = socket.user;
        var text = data["text"];
        var comment = new Comment(user.id, text, Utils.getCurrentTime());
        socket.broadcast.to(roomId).emit('room_message', comment.toJson());
        simpleHttp.sendRoomMessage(user.token, roomId, text);
        callback({'ok': true});
    };


    // private chat
    messageJoin(socket, data, callback) {
        var userId1 = Number(socket.user.id);
        var userId2 = Number(data.user_id);
        var room = this.messageGetRoom(userId1, userId2);
        if (!room) {
            callback({'ok': false, 'reason': 'CREATE_ROOM_FAILED'});
            return;
        }

        console.log('join to private chat: ' + socket.user.id  + ' -> ' + room.id);

        var result = room.enter(socket, socket.user);
        if(result === Error.NO_ERROR) {
            socket.broadcast.to(room.id).emit("private_chat_join", socket.user.toJson());
            callback({'ok': true, 'users': room.getOtherUsers(socket)});
        }
        else {
            callback({'ok': false, 'reason': result});
        }
    };


    messageLeave(socket, callback) {
        this.leaveMessage(socket);
        callback({'ok': true});
    };


    messageSend(socket, data, callback) {
        var roomId = socket.roomId;
        if (!roomId) {
            this.callbackError(callback);
            return;
        }

        var room = this.privateRooms[roomId];
        if (!room) {
            this.callbackError(callback);
            return;
        }

        var fromUserId = Number(socket.user.id);
        var toUserId;
        if (fromUserId == room.userId1) {
            toUserId = room.userId2;
        }
        else {
            toUserId = room.userId1;
        }

        var body = data["body"];
        var comment = new Message(socket.user.id, body, Utils.getCurrentTime());
        socket.broadcast.to(roomId).emit('private_chat_message', comment.toJson());
        
        var threadId = data["thread_id"];
        simpleHttp.sendPrivateMessage(socket.user.token, threadId, toUserId, body);
        
        callback({'ok': true});
    };


    messageImage(socket, data, image, callback) {
        var roomId = socket.roomId;
        if (!roomId) {
            this.callbackError(callback);
            return;
        }

        var room = this.privateRooms[roomId];
        if (!room) {
            this.callbackError(callback);
            return;
        }

        this.saveImage(image, function (err, path) {
            if (err) {
                this.callbackError(callback);
                return;
            }

            var fromUserId = Number(socket.user.id);
            var toUserId;
            if (fromUserId == room.userId1) {
                toUserId = room.userId2;
            }
            else {
                toUserId = room.userId1;
            }

            var url  = Conf.PRIVATE_MSG_IMGS_URL + path;
            var body = "{'image':'" + url + "', 'thumb':'" + url + "'}";

            var comment = new Message(fromUserId, body, Utils.getCurrentTime());
            socket.broadcast.to(roomId).emit('private_chat_image', comment.toJson());
            
            var threadId = data["thread_id"];
            simpleHttp.sendPrivateMessage(socket.user.token, threadId, toUserId, body);
            
            callback({
                'ok': true,
                'image': url,
                'thumb': url
            });
        });
    };


    messageGetRoom(userId1, userId2) {
        var roomId = "";
        if (userId1 < userId2) {
            roomId = "p_" + userId1 + "_" + userId2;
        }
        else {
            roomId = "p_" + userId2 + "_" + userId1;
        }
        var room = this.privateRooms[roomId];
        if (!room) {
            room = new Room(roomId, 2);
            room.userId1 = userId1;
            room.userId2 = userId2;
            this.privateRooms[roomId] = room;
        }
        return room;
    }



    leaveRoom(socket) {
        console.log('leave room: ' + socket.user.name + ' # ' + socket.roomId);
        var room = this.rooms[socket.roomId];
        if (room) {
            room.leave(socket);
            if (room.members.length == 0) {
                delete this.rooms[socket.roomId];
            }
            socket.broadcast.to(room.id).emit("room_leave", {"user_id":socket.user.id});
        }
    };


    leaveMessage(socket) {
        console.log('leaveMessage: ' + socket.user.name + ' # ' + socket.roomId);
        var room = this.privateRooms[socket.roomId];
        if (room) {
            room.leave(socket);
            if (room.members.length == 0) {
                delete this.privateRooms[socket.roomId];
            }
            socket.broadcast.to(room.id).emit("private_chat_leave", {"user_id":socket.user.id});
        }
    };

    safeMkdir(dirPath, callback) {
        fs.access(dirPath, fs.W_OK, function(err) {
            if (err) {
                fs.mkdir(dirPath, function(err2) {
                    callback(err2);
                })
            }
            else {
                callback(null);
            }
        });
    }

    saveImage(image, callback) {
        var folder = (new Date()).toFormat("YYYYMM");
        var dir = Path.join(Conf.PRIVATE_MSG_IMGS_FOLDER, folder);
        this.safeMkdir(dir, function(err) {
            if (err) {
                callback(err);
                return;
            }
            var name = uuid.v4() + '.png'
            var path = Path.join(dir, name);
            fs.writeFile(path, image, function (err) {
                callback(err, folder + "/" + name);
            });
        });
    };

    callbackError(callback) {
        callback({'ok': false});
    };


}


module.exports = ManageServer;



