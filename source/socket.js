const socket_io = require("socket.io");
const redis = require("./util/redis_com");
const rKeys = require("./util/redis_keys");


var _ws;
var _socket_array = [];

/**
 *  rkeys
 */
var _online_counts = rKeys._online_counts;
var _user_info = rKeys._user_info;
var _user_message = rKeys._user_message;

var _start = (server) => {
    _ws = socket_io(server);
    _ws.sockets.on("connection", (socket) => {
        _socket_array.push(socket);
        redis.set(_online_counts, _socket_array.length);

        /**
         *  订阅
         */
        socket.on("sub", (msg) => {
            msg.socket_id = socket.id;
            msg.uid && redis.hset(_user_info, msg.uid, JSON.stringify(msg), () => {
                console.log("%s 正在连接，sid:%s", msg.uid, socket.id);
                redis.hget(_user_message, msg.uid, (reply) => {
                    var reply_obj = {};
                    if (reply) {
                        reply_obj = JSON.parse(reply);
                        _emit(msg.uid, socket.id, reply_obj.data, "sub");
                        redis.hdel(_user_message, msg.uid);
                    }
                });
            });
        });

        /**
         * 断连
         */
        socket.on('disconnect', () => {
            for (var i = 0; i < _socket_array.length; i++) {
                if (_socket_array[i].id == socket.id) {
                    _socket_array.splice(i, 1);
                }
            }
            redis.set(_online_counts, _socket_array.length);
            console.log("断开连接，sid:%s", socket.id);
        });

    });
}

/**
 *  向指定SOCKET发送消息
 */
var _emit = (uid, socket_id, data, emit_name) => {
    if (_ws) {
        var isOnlineFlag = false;
        for (var i = 0; i < _socket_array.length; i++) {
            var socketItem = _socket_array[i];
            if (socketItem.id == socket_id) {
                socketItem.emit(emit_name, {
                    success: true,
                    data: data
                });
                isOnlineFlag = true;
                console.log("向%s发送消息成功。\r\n消息名：%s。\r\n消息内容：%s", uid, emit_name, JSON.stringify(data));
                break;
            }
        }
        if (!isOnlineFlag && emit_name === "message") {
            redis.hget(_user_message, uid, (reply) => {
                var reply_obj = {};
                if (reply) {
                    reply_obj = JSON.parse(reply);
                }
                if (!reply_obj.data) {
                    reply_obj.data = [];
                }
                reply_obj.data.push(data);
                redis.hset(_user_message, uid, JSON.stringify(reply_obj));
            });
        }
    }
}

module.exports = {
    start: _start,
    emit: _emit
};