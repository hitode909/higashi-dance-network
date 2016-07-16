$(function() {
  var viewer, weather;
  weather = new Weather;
  viewer = new Viewer(weather);
  return viewer.setup();
});
