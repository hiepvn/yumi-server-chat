var Conf = require('../conf');
var Error = require('./error_code');

/**
 * Created by hiepvn on 2023/06/11.
 */

class Room {

    constructor(roomId, maxUsers){
        this.id = roomId;
        this.members = [];
        this.maxUsers = maxUsers;
    }

    enter(socket, user){
        if (!socket.user) {
            return Error.INVALID_PARAMS;
        }

        if (this.members.length >= this.maxUsers) {
            return Error.ROOM_FULL;
        }
        
        console.log("Room.prototype.enter: " + socket.user.id + " " + socket.user.name);

        socket.roomId = this.id;
        socket.join(this.id);
        this.members.push(socket);
        
        return Error.NO_ERROR;
    };

    leave(socket) {
        console.log("Room.prototype.leave: " + socket.id + " " + socket.user.name);
        
        socket.roomId = undefined;
        socket.leave(this.id);
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i] === socket) {
                this.members.splice(i, 1);
            }
        }
    };

    getOtherUsers(socket) {
        var users = [];
        for (var i = 0; i < this.members.length; i++) {
            var member = this.members[i];
            if (member.user && member.user.id !== socket.user.id) {
                users.push(member.user);
            }
        }
        return users;
    };

}

module.exports = Room;

