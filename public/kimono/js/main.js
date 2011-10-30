$(function() {
  var kimono, viewer;
  kimono = new Kimono;
  viewer = new Viewer(kimono);
  return viewer.setup();
});