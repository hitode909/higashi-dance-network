'use strict';

const express = require('express');
const fetch = require('node-fetch');
const app = express();

const mirror = async (res, url) => {
  if (url.match(/meta/i)) {
    console.log(`block ${url}`);
    res.status(400).end();
    return;
  }

  console.log(`fetch ${url}`);
  const fetched = await fetch(url);
  const buffer = await fetched.buffer();
  res.status(fetched.status);
  res.append('content-type', fetched.headers.get('content-type'));
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Expires", new Date(Date.now() + 3600*1000).toUTCString());
  res.end(buffer, 'binary');
}

app.get('/weather', async (req, res) => {
  let APIKEY = process.env['OPENWEATHERMAP_API_KEY'];

  if (!APIKEY) {
    console.warn('OPENWEATHERMAP_API_KEY IS NOT SET')
    res.status(400).end();
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${encodeURIComponent(req.query.lat)}&lon=${encodeURIComponent(req.query.lon)}&exclude=current,minutely,hourly&units=metric&lang=ja&appid=${APIKEY}`;
  await mirror(res, url);
});

app.get('/proxy/\*', async (req, res) => {
  console.log(req.originalUrl);
  const url = decodeURIComponent(req.originalUrl.replace(/^\/proxy\//, ''));

  await mirror(res, url);

});

app.use('/', express.static('public'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

