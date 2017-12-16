const fs = require("fs");

module.exports = JSON.parse(fs.readFileSync('./source/config.json').toString());