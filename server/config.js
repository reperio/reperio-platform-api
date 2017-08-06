var env = process.env.NODE_ENV || 'development'

var config_name = "config-" + env;
console.log('loading ' + config_name);
//load the correct config based on the node env
var config = require("./" + config_name);

config.test_api_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZmlyc3RfbmFtZSI6IkFkbWluIiwibGFzdF9uYW1lIjoiVXNlciIsImVtYWlsIjoiYWRtaW5fdXNlckB0ZXN0LmNvbSIsImlhdCI6MTUwMjA1MTQ1MiwiZXhwIjoxODE3NDExNDUyfQ.26sVeg1gBjB5TbTG_Fq9GgXZ0GnL8MOp4iVF5X2D8dg';

module.exports = config;


