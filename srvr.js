import express from 'express';
import { timeOffset } from './times.js';

const app = express();

app.use(express.static('./pub/'));

app.get('/time/', function (req, res) {
  res.send(new Date().toLocaleTimeString());
});

app.get('/time/:timeOffset', function (req, res) {
  const time = {
    // convert Date object to string to avoid awkward type coercion
    date: timeOffset(req.params.timeOffset).toString(),
  };
  res.send(time);
});

// Web browsers search for a favicon at the root of the app, so we redirect the request into the favicons directory.
app.get('/favicon.ico', (req, res) => {
  res.redirect('/favicons/favicon.ico');
});

app.listen(8080);

console.log('Server started on localhost.');
