// @flow

import Weather from './weather';
import Viewer from './viewer';
import $ from 'jquery';
import _ from 'underscore';

$(function() {
  let weather = new Weather;
  let viewer = new Viewer(weather);
  return viewer.setup();
});
