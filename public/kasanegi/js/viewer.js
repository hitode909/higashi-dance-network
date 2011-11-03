var Viewer;
Viewer = (function() {
  function Viewer(weather) {
    this.weather = weather;
  }
  Viewer.prototype.setup = function() {
    this.setupCityChanger();
    this.setupEvents();
    this.checkCurrentPositionIfNeeded();
    this.setTweetLink();
    return this.appendTwitterWidget();
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
    return $('#city-selector-container').prepend(select);
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
    var city, city_code, city_name, selected, self;
    self = this;
    $('#indicator').show();
    selected = $('select#city-selector option:selected');
    city_code = selected.val();
    city_name = selected.text();
    city = this.weather.getCityByCityCode(city_code);
    this.weather.setLastCityCode(city_code);
    return this.weather.getWeatherReportForCity(city, function(report) {
      $('#indicator').hide();
      $('#result #area').text(city_name);
      $('#result #date').text(self.convertDate(report.date));
      $('#result #description').text(report.description);
      $('#result #max-temp').text(report.max);
      $('#result #min-temp').text(report.min);
      return self.printWeatherIcons(report.description);
    });
  };
  Viewer.prototype.convertDate = function(date_text) {
    var day, fragments, month;
    fragments = date_text.match(/(\d+)/g);
    if (fragments.length !== 3) {
      return date_text;
    }
    month = fragments[1];
    day = fragments[2];
    return "" + (+month) + "/" + (+day);
  };
  Viewer.prototype.printWeatherIcons = function(text) {
    var container, matched;
    container = $('#weather-icons');
    container.empty();
    matched = text.match(/(晴|雷雨|雨|雷|曇|霧|)/g);
    return _.each(matched, function(code) {
      var image_path, rule;
      rule = {
        晴: 'images/icon-sun.png',
        雨: 'images/icon-rain.png',
        雷: 'images/icon-thunder.png',
        曇: 'images/icon-cloud.png',
        霧: 'images/icon-mist.png',
        雷雨: 'images/icon-thunder-rain.png'
      };
      image_path = rule[code];
      if (!image_path) {
        return;
      }
      return $('<img>').attr({
        src: 'images/a.jpg',
        title: code
      }).appendTo(container);
    });
  };
  Viewer.prototype.setupSharePage = function() {
    return this.appendTwitterWidget();
  };
  Viewer.prototype.destroySharePage = function() {
    return this.removeTwitterWidget();
  };
  Viewer.prototype.removeTwitterWidget = function() {
    return $('#widget-container').empty();
  };
  Viewer.prototype.appendTwitterWidget = function() {
    var self;
    self = this;
    this.removeTwitterWidget();
    return new TWTR.Widget({
    id: 'widget-container',
    version: 2,
    type: 'search',
    search: self.HASHTAG,
    interval: 30000,
    title: self.HASHTAG,
    subject: '',
    width: 310,
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
  Viewer.prototype.setTweetLink = function(message, hashtag) {
    var share_url, text, url;
    if (message == null) {
      message = "3枚です";
    }
    if (hashtag == null) {
      hashtag = this.HASHTAG;
    }
    url = this.SERVICE_URL;
    text = "" + message + " " + hashtag;
    share_url = "https://twitter.com/share?url=" + (encodeURIComponent(url)) + "&text=" + (encodeURIComponent(text));
    return $("a#share-tweet").attr({
      href: share_url
    });
  };
  Viewer.prototype.setPageButton = function(target_id) {
    $(".page-changer.selected").removeClass("selected");
    return $("#" + target_id + "-selector").addClass("selected");
  };
  Viewer.prototype.HASHTAG = "#重ね着";
  Viewer.prototype.SERVICE_URL = "http://higashi-dance-network.appspot.com/bon/";
  return Viewer;
})();