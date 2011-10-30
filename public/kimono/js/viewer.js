var Viewer;
Viewer = (function() {
  function Viewer(kimono) {
    this.kimono = kimono;
  }
  Viewer.prototype.setup = function() {
    this.setupCityChanger();
    this.setupEvents();
    return this.printWeather();
  };
  Viewer.prototype.setupCityChanger = function() {
    var current_state_code, found, select, self;
    self = this;
    current_state_code = this.kimono.getCurrentStateCode();
    found = false;
    select = $('<select>').attr({
      name: 'city',
      id: 'city-selector'
    });
    this.kimono.eachCity(function(city) {
      var option;
      option = $('<option>').attr({
        name: 'city',
        value: city.code
      });
      option.text(city.state_name + " " + city.area_name);
      if (!found && city.state_code === current_state_code && city.is_primary) {
        option.attr({
          selected: 'selected'
        });
        self.defaultCity = option;
        found = true;
      }
      return select.append(option);
    });
    return $('#city-selector-container').append(select);
  };
  Viewer.prototype.setupEvents = function() {
    var self;
    self = this;
    $('select#city-selector').change(function() {
      return self.printWeather();
    });
    return $('#reset-city').click(function() {
      return self.selectDefaultCity();
    });
  };
  Viewer.prototype.printWeather = function() {
    var city, city_code;
    city_code = +$('select#city-selector').val();
    city = this.kimono.getCityByCityCode(city_code);
    return this.kimono.getWeatherReportForCity(city, function(report) {
      $('#result #date').text(report.daily.date);
      $('#result #description').text(report.daily.wDescription);
      $('#result #max-temp').text(report.daily.maxTemp);
      return $('#result #min-temp').text(report.daily.minTemp);
    });
  };
  Viewer.prototype.selectDefaultCity = function() {
    this.defaultCity.attr({
      selected: 'selected'
    });
    return this.printWeather();
  };
  return Viewer;
})();