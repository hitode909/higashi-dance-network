var Viewer;
Viewer = (function() {
  function Viewer(kimono) {
    this.kimono = kimono;
  }
  Viewer.prototype.setup = function() {
    this.setupCityChanger();
    this.setupEvents();
    return this.checkCurrentPositionIfNeeded();
  };
  Viewer.prototype.setupCityChanger = function() {
    var found, label, lat_state_code, select, self;
    self = this;
    lat_state_code = self.kimono.getLastCityCode();
    found = false;
    select = $('<select>').attr({
      name: 'city',
      id: 'city-selector'
    });
    label = $('<option>').attr({
      name: 'city',
      value: -1,
      disabled: 'disabled'
    });
    label.text('地域を選択');
    select.append(label);
    this.kimono.eachCity(function(city) {
      var option;
      option = $('<option>').attr({
        name: 'city',
        value: city.code
      });
      option.text(city.state_name + " " + city.area_name);
      if (!found && city.code === lat_state_code) {
        option.attr({
          selected: true
        });
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
      return self.getCurrentPositionAndPrint();
    });
  };
  Viewer.prototype.checkCurrentPositionIfNeeded = function() {
    var city_code;
    city_code = $('select#city-selector').val();
    if (city_code === "-1") {
      return this.getCurrentPositionAndPrint();
    } else {
      return this.printWeather();
    }
  };
  Viewer.prototype.getCurrentPositionAndPrint = function() {
    var self;
    self = this;
    return self.kimono.getCurrentStateCode(function(state_code) {
      var city, city_code, option;
      city = self.kimono.getDefaultCityForState(state_code);
      city_code = city.code;
      option = $("option[value=" + city_code + "]");
      option.attr({
        selected: 'selected'
      });
      return self.printWeather();
    });
  };
  Viewer.prototype.printWeather = function() {
    var city, city_code, city_name, selected;
    $('#indicator').show();
    selected = $('select#city-selector option:selected');
    city_code = selected.val();
    city_name = selected.text();
    city = this.kimono.getCityByCityCode(city_code);
    this.kimono.setLastCityCode(city_code);
    return this.kimono.getWeatherReportForCity(city, function(report) {
      $('#indicator').hide();
      $('#result #area').text(city_name);
      $('#result #date').text(report.daily.date);
      $('#result #description').text(report.daily.wDescription);
      $('#result #max-temp').text(report.daily.maxTemp);
      return $('#result #min-temp').text(report.daily.minTemp);
    });
  };
  return Viewer;
})();