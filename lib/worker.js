var WebSocketServer = require('ws').Server;
// var EventEmitter = require('events').EventEmitter;
var http = require('http');

var server = http.createServer(function (req, resp) {
  if (req.url === '/') {
    resp.writeHead(404);
    resp.end();
  }
});

new WebSocketServer({
  'server': server
}).on('connection', function(client) {
  client.send(JSON.stringify({}));
});

function init (port) {
  server.listen(port);
}

module.exports = {
  'init': init
};