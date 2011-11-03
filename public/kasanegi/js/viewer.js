var Viewer;
Viewer = (function() {
  function Viewer(weather) {
    this.weather = weather;
  }
  Viewer.prototype.setup = function() {
    this.setupCityChanger();
    this.setupEvents();
    this.selectFirstPage();
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
  Viewer.prototype.selectFirstPage = function() {
    var page_id;
    page_id = this.weather.getLastPageId();
    return this.selectPage(page_id, true);
  };
  Viewer.prototype.setupEvents = function() {
    var self;
    self = this;
    $('select#city-selector').change(function() {
      return self.printWeather();
    });
    $('#reset-city').click(function() {
      return self.getCurrentPositionAndPrint();
    });
    return $('.page-changer').click(function() {
      var target_id;
      target_id = $(this).attr('data-target-id');
      return self.selectPage(target_id);
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
    var city, city_code, city_name, selected;
    $('#indicator').show();
    selected = $('select#city-selector option:selected');
    city_code = selected.val();
    city_name = selected.text();
    city = this.weather.getCityByCityCode(city_code);
    this.weather.setLastCityCode(city_code);
    return this.weather.getWeatherReportForCity(city, function(report) {
      $('#indicator').hide();
      $('#result #area').text(city_name);
      $('#result #date').text(report.date);
      $('#result #description').text(report.description);
      $('#result #max-temp').text(report.max);
      return $('#result #min-temp').text(report.min);
    });
  };
  Viewer.prototype.setupSharePage = function() {
    this.appendTwitterWidget();
    return this.setShareLink();
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
  Viewer.prototype.selectPage = function(target_id, force) {
    var target_page;
    console.log('select');
    if (!force && target_id === this.weather.getLastPageId) {
      return;
    }
    target_page = $(document.body).find("#" + target_id);
    if (target_page.length === 0) {
      throw "invalid page target id (" + target_id + ")";
    }
    this.weather.setLastPageId(target_id);
    $('.page').hide();
    target_page.show();
    if (target_id === "share-page") {
      console.log('share');
      this.setupSharePage();
    } else {
      console.log('destroy');
      this.destroySharePage();
    }
    return console.log('selected');
  };
  Viewer.prototype.HASHTAG = "#重ね着";
  Viewer.prototype.SERVICE_URL = "http://higashi-dance-network.appspot.com/bon/";
  return Viewer;
})();