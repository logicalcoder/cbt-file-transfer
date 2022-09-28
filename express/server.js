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


// Take in the request & filepath, stream the file to the filePath
const uploadFile = (req, filePath) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    // With the open - event, data will start being written
    // from the request to the stream's destination path
    stream.on('open', () => {
      console.log('Stream open ...  0.00%');
      req.pipe(stream);
    });
  
    // Drain is fired whenever a data chunk is written.
    // When that happens, print how much data has been written yet.
    stream.on('drain', () => {
      const written = parseInt(stream.bytesWritten);
      const total = parseInt(req.headers['content-length']);
      const pWritten = ((written / total) * 100).toFixed(2);
      console.log(`Processing  ...  ${pWritten}% done`);
    });
  
    // When the stream is finished, print a final message
    // Also, resolve the location of the file to calling function
    stream.on('close', () => {
      console.log('Processing  ...  100%');
      resolve(filePath);
    });
      // If something goes wrong, reject the primise
    stream.on('error', err => {
      console.error(err);
      reject(err);
    });
  });
};

// Add a route to accept incoming post requests for the fileupload.
// Also, attach two callback functions to handle the response.
router.post('/serve-file', (req, res) => {
  const filePath = path.join(__dirname, `/image.jpg`);
  uploadFile(req, filePath)
    .then(path => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(`<img src="${path}">`);
      res.end();
    })
  //  .then(path => res.send({ status: 'success', path }))
   .catch(err => res.send({ status: 'error', err }));
});

router.post('/upload', (req, res) => {
  const filePath = path.join(__dirname, `/image.jpg`);
  uploadFile(req, filePath)
    .then(path => res.send({ status: 'success', path }))
    .catch(err => res.send({ status: 'error', err }));
 });

router.post('/transfer', (req, res) => {
  console.log('Hitting server');
  console.log('mimetype =>', req.headers['x-mime-type']);
  console.log('contentType =>', req.headers['content-type']);

  res.json({ 
    mimetype: req.headers['x-mime-type'],
    contentType: req.headers['content-type'],
    cellphone: req.headers['x-cellphone'],
    // stream: req.stream,
    message: `Successfully uploaded`
  });
});

// router.post('/transfer', (req, res) => res.json({ 
//   mimetype: req.headers['x-mime-type'],
//   contentType: req.headers['content-type'],
//   cellphone: req.headers['x-cellphone'],
//   // stream: req.stream,
//   message: `Successfully uploaded`
// }));

// app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
