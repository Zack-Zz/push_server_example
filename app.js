const config = require("./config.json");
const api = require("./api");
const socket = require("./socket");
const app = require("express")();
const redis = require("./util/redis_com");

var _server = require("http").createServer(app);

_server.listen(config.ws_Server_Server.port, (req, res) => {
    api(app, req, res);
    console.log("%s:%s server is running...", _server.address().address, _server.address().port);
});
//启动redis连接
redis.start();
//启动推送服务
socket.start(_server);