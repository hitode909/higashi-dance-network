'use strict';

const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/weather', async (req, res) => {
  let APIKEY = process.env['OPENWEATHERMAP_API_KEY'];

  if (!APIKEY) {
    console.warn('OPENWEATHERMAP_API_KEY IS NOT SET')
    res.status(400).end();
    return;
  }

  console.log(req.params);
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${encodeURIComponent(req.query.lat)}&lon=${encodeURIComponent(req.query.lon)}&exclude=current,minutely,hourly&units=metric&lang=ja&appid=${APIKEY}`;
  const fetched = await fetch(url);
  const body = await fetched.text();
  res.status(fetched.status);
  res.append('content-type', fetched.headers.get('content-type'));
  res.send(body);

  res.end();
});

app.get('/proxy/\*', async (req, res) => {
  console.log(req.originalUrl);
  const url = decodeURIComponent(req.originalUrl.replace(/^\/proxy\//, ''));
  console.log(`fetch ${url}`);
  if (url.match(/meta/i)) {
    res.status(400).end();
  }
  const fetched = await fetch(url);
  const body = await fetched.text();
  res.status(fetched.status);
  res.append('content-type', fetched.headers.get('content-type'));
  res.send(body);
  res.end();
});

app.use('/', express.static('public'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

