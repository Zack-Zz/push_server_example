const socket = require("./socket");
const redis = require("./util/redis_com");
const rKeys = require("./util/redis_keys");
const bodyParser = require('body-parser');

/**
 *  rkeys
 */
var _online_counts = rKeys._online_counts;
var _user_info = rKeys._user_info;
var _user_message = rKeys._user_message;

module.exports = (app, request, response) => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    /**
     * 获取在线人数
     */
    app.get("/api/GetOnlineUserCounts", (req, res) => {
        res.set('Content-Type', 'text/plain');
        redis.get(_online_counts, (reply) => {
            res.end(JSON.stringify({
                success: true,
                data: {
                    onlineCounts: reply
                }
            }));
        });
    });

    /**
     * 对 指定人员 推送消息
     */
    app.post("/api/SendAnyOne", (req, res) => {
        var uids = req.body.uid;
        var data = req.body.data;

        if (uids && uids.length > 50) {
            res.end(JSON.stringify({
                success: false,
                msg: '单次请求发送人数不能超过50',
            }));
        } else if (uids.length <= 0) {
            res.end(JSON.stringify({
                success: false,
                msg: '发送人数不能为空',
            }));
        } else {
            for (var i = 0; i < uids.length; i++) {
                var uid = uids[i];
                redis.hget(_user_info, uid, (reply) => {
                    var data_from_db = JSON.parse(reply);
                    var socket_id = (data_from_db && data_from_db.socket_id) || null;
                    var _uid = (data_from_db && data_from_db.uid) || null;
                    socket_id && socket.emit(_uid, socket_id, data, "message");
                });
            }
            res.end(JSON.stringify({
                success: true,
                msg: ("正在发送给 %s", JSON.stringify(uids))
            }));
        }
    });

}