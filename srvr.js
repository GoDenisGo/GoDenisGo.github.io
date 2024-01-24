import express from 'express';
import { timeOffset } from './times.js';

// Entry point of the application. Run npm start with (permission to access the server from the LAN) from a terminal at
// the project root to access this server from other devices.
const app = express();

app.use(express.static('./docs/'));

app.get('/time/', function (req, res) {
  res.send(new Date().toLocaleTimeString());
});

app.get('/time/:timeOffset', function (req, res) {
  // Using an object to explicitly set the response structure to a known attribute ("date").
  const time = {
    // convert Date object to a string in order to avoid awkward type coercion.
    date: timeOffset(req.params.timeOffset).toString(),
  };
  res.send(time);
});

// Web browsers search for a favicon at the root of the app, so we redirect the request into the "favicons" directory.
app.get('/favicon.ico', (req, res) => {
  res.redirect('/favicons/favicon.ico');
});

app.listen(8080);

console.log('Server started on localhost.');
