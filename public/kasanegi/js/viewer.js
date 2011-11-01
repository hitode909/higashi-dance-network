var Viewer;
Viewer = (function() {
  function Viewer(weather) {
    this.weather = weather;
  }
  Viewer.prototype.setup = function() {
    this.setupCityChanger();
    this.setupEvents();
    return this.checkCurrentPositionIfNeeded();
  };
  Viewer.prototype.setupCityChanger = function() {
    var found, label, lat_state_code, select, self;
    self = this;
    lat_state_code = self.weather.getLastCityCode();
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
    this.weather.eachCity(function(city) {
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
      $('#indicator').show();
      return this.getCurrentPositionAndPrint();
    } else {
      return this.printWeather();
    }
  };
  Viewer.prototype.getCurrentPositionAndPrint = function() {
    var self;
    self = this;
    return self.weather.getCurrentStateCode(function(state_code) {
      var city, city_code, option;
      city = self.weather.getDefaultCityForState(state_code);
      city_code = city.code;
      option = $("option[value=" + city_code + "]");
      option.attr({
        selected: 'selected'
      });
      return self.printWeather();
    });
  };
  Viewer.prototype.printWeather = function() {
    var city, city_code, city_name, selected, state_name;
    $('#indicator').show();
    selected = $('select#city-selector option:selected');
    city_code = selected.val();
    city_name = selected.text();
    city = this.weather.getCityByCityCode(city_code);
    this.weather.setLastCityCode(city_code);
    this.weather.getWeatherReportForCity(city, function(report) {
      $('#indicator').hide();
      $('#result #area').text(city_name);
      $('#result #date').text(report.daily.date);
      $('#result #description').text(report.daily.wDescription);
      $('#result #max-temp').text(report.daily.maxTemp);
      return $('#result #min-temp').text(report.daily.minTemp);
    });
    state_name = city_name.split(/\s+/)[0];
    state_name = state_name.slice(0, state_name.length - 1);
    this.appendWidget(state_name);
    return this.setTweetLink(state_name);
  };
  Viewer.prototype.appendWidget = function(state_name) {
    $('#widget-container').empty();
    return new TWTR.Widget({
    id: 'widget-container',
    version: 2,
    type: 'search',
    search: state_name,
    interval: 30000,
    title: state_name,
    subject: '',
    width: 320,
    height: 480,
    theme: {
      shell: {
        background: '#98c6d1',
        color: '#3c576e'
      },
      tweets: {
        background: '#ffffff',
        color: '#424242',
        links: '#436a94'
      }
    },
    features: {
      scrollbar: false,
      loop: false,
      live: true,
      behavior: 'all',
    }
  }).render().start();;
  };
  Viewer.prototype.setTweetLink = function(state_name) {
    var share_url, text, url;
    url = "http://higashi-dance-network.appspot.com/bon/";
    text = "盆のご案内です #盆 #盆" + state_name;
    share_url = "https://twitter.com/share?url=" + (encodeURIComponent(url)) + "&text=" + (encodeURIComponent(text));
    return $("a#share-tweet").attr({
      href: share_url
    });
  };
  return Viewer;
})();