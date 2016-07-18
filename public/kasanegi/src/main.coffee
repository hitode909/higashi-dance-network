Weather = require('./weather')
Viewer = require('./viewer')

$ ->
  weather = new Weather
  viewer = new Viewer(weather)
  viewer.setup()
