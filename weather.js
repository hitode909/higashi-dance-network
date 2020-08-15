'use strict';

const express = require('express');
const fetch = require('node-fetch');

const app = express();



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

