'use strict';

const express = require('express');
const fetch = require('node-fetch');

const app = express();

app.get('/\*', async (req, res) => {
  console.log(req.originalUrl);
  const url = decodeURIComponent(req.originalUrl.replace(/^\//, ''));
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

