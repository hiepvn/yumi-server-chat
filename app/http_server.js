var http = require('http');
var querystring = require('querystring');

var Conf = require('../conf');

exports = module.exports = SimpleHttp;

function SimpleHttp() {}

SimpleHttp.prototype.sendRoomMessage = function(userToken, roomId, text){

    var data = {"room_id": roomId, "text": text};
    var dataJson = JSON.stringify(data);
    var options = {
        socketPath: Conf.api_server.host,
        path: '/room/message',
        method: 'POST',
        headers: {
            'Authorization': 'Token '.concat(userToken),
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(dataJson)
        }
    };

    var callback = function(response) {
        var str = '';

        // another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        // the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            console.log('sendRoomMessage : ' + str);
        });
    }

    var request = http.request(options, callback);
    request.on('error', function(err) {
        console.log('Error sendRoomMessage : ' + err);
    });
    request.write(dataJson);
    request.end();
};

SimpleHttp.prototype.sendPrivateMessage = function(userToken, threadId, targetUserId, text){

    var data = {'thread_id': threadId, "receiver_id": targetUserId, "body": text};
    var dataJson = JSON.stringify(data);
    var options = {
        socketPath: Conf.api_server.host,
        // host: '127.0.0.1',
        // port: 8110,
        path: '/msg/send',
        method: 'POST',
        headers: {
            'Authorization': 'Token '.concat(userToken),
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(dataJson)
        }
    };

    console.log('sendPrivateMessage : ' + userToken + " " + threadId + " " + targetUserId + " " + text);

    var callback = function(response) {
        var str = '';

        // another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        // the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            console.log('sendPrivateMessage : ' + str);
        });
    }

    var request = http.request(options, callback);
    request.on('error', function(err) {
        console.log('Error sendPrivateMessage : ' + err);
    });
    request.write(dataJson);
    request.end();
};

