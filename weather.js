'use strict';

const express = require('express');
const fetch = require('node-fetch');

const app = express();

const APIKEY = process.env['OPENWEATHERMAP_API_KEY'];

if (!APIKEY) {
  console.larn('OPENWEATHERMAP_API_KEY IS NOT SET')
  process.exit(1);
}

app.get('/', async (req, res) => {
  console.log(req.params);
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${encodeURIComponent(req.query.lat)}&lon=${encodeURIComponent(req.query.lon)}&exclude=current,minutely,hourly&units=metric&lang=ja&appid=${APIKEY}`;
  const fetched = await fetch(url);
  const body = await fetched.text();
  res.status(fetched.status);
  res.append('content-type', fetched.headers.get('content-type'));
  res.send(body);

  res.end();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

