import Weather from './weather';
import Viewer from './viewer';

$(function() {
  let weather = new Weather;
  let viewer = new Viewer(weather);
  return viewer.setup();
});
