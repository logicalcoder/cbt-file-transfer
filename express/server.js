'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();
router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Testing server!</h1>');
  res.end();
});

router.post('/transfer', (req, res) => res.json({ 
  mimetype: req.headers['x-mime-type'],
  contentType: req.headers['content-type'],
  cellphone: req.headers['x-cellphone'],
  // stream: req.stream,
  message: `Successfully uploaded`
}));

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
