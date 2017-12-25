const express = require('express');
const request = require('request');

const RANDINT_SERVER_PORT = process.env.RANDINT_SERVER_PORT || 8081;
const RANDOM_SERVER_URL = process.env.RANDOM_SERVER_URL;

if (!RANDOM_SERVER_URL) {
  throw new Error('Please define RANDOM_SERVER_URL environment variable');
}

let app = express();

app.get('/:N', (req, res) => {
  request.get(RANDOM_SERVER_URL, (err, response, body) => {
    const N = parseInt(req.params.N);

    console.log(`${new Date()}: Received request against /${N}`)
    if (!!err) {
      console.log(err);
      return res.sendStatus(500);
    }

    const u = parseFloat(body);
    let n = Math.floor(u*N);

    res.status(200);
    res.send(`${n}`);
  });
});

app.listen(RANDINT_SERVER_PORT);

console.log(`Random server listening on port ${RANDINT_SERVER_PORT}, connected to random server at ${RANDOM_SERVER_URL}`);
