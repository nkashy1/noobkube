const http = require('http');

const RANDOM_SERVER_PORT = process.env.RANDOM_SERVER_PORT || 8080;

http.createServer(function(req, res) {
  res.writeHead(200);
  res.write(`${Math.random()}`);
  res.end();
}).listen(RANDOM_SERVER_PORT);

console.log(`Random server listening on port ${RANDOM_SERVER_PORT}`);
