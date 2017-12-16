const redis = require("redis");
const config = require("../config.json");

var _client = redis.createClient(config.redis.port, config.redis.host);
var _client_db_index = config.redis.indexDb;

var _start = () => {
    _client.auth(config.redis.password);

    _client.on("connect", () => {
        console.log("redis服务已连接.");
    });

    _client.on("error", (err) => {
        console.log("Redis Error %s", err);
    });
}

/**
 * 添加或修改键值
 */
var _setVal = (key, val, func) => {
    _client.select(_client_db_index, (error) => {
        if (error) {
            console.log(error);
        } else {
            _client.set(key, val, (err, reply) => {
                if (err) {
                    console.log(err);
                } else {
                    func && typeof(func) == "function" && func();
                }
            });
        }
    });
}

/**
 *  获取键值
 */
var _getVal = (key, func) => {
    _client.select(_client_db_index, (error) => {
        if (error) {
            console.log(error);
        } else {
            _client.get(key, (err, reply) => {
                if (err) {
                    console.log(err);
                }
                func && typeof(func) == "function" && func(reply);
            });
        }
    });
}

/**
 * 散列
 *  在集合 hash_name 添加 <key,val>
 */
var _hsetVal = (hash_name, key, val, func) => {
    _client.select(_client_db_index, (error) => {
        if (error) {
            console.log(error);
        } else {
            _client.hset(hash_name, key, val, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    func && typeof(func) == "function" && func();
                }
            });
        }
    });
}

/**
 * 散列
 *  在集合 hash_name 根据 key 获取值
 */
var _hgetVal = (hash_name, key, func) => {
    _client.select(_client_db_index, (error) => {
        if (error) {
            console.log(error);
        } else {
            _client.hget(hash_name, key, (err, reply) => {
                if (err) {
                    console.log(err);
                }
                func && typeof(func) == "function" && func(reply);
            });
        }
    });
}

/**
 * 散列
 *  在集合 hash_name 根据 key 删除值
 */
var _hdelbykey = (hash_name, key, func) => {
    _client.select(_client_db_index, (error) => {
        if (error) {
            console.log(error);
        } else {
            _client.hdel(hash_name, key, (err) => {
                if (err) {
                    console.log(err);
                }
                func && typeof(func) == "function" && func();
            });
        }
    });
}

module.exports = {
    _client: _client,
    start: _start,
    set: _setVal,
    get: _getVal,
    hset: _hsetVal,
    hget: _hgetVal,
    hdel: _hdelbykey
};