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
      $('#result').hide();
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
    $('#result').hide();
    selected = $('select#city-selector option:selected');
    city_code = selected.val();
    city_name = selected.text();
    city = this.weather.getCityByCityCode(city_code);
    this.weather.setLastCityCode(city_code);
    return this.weather.getWeatherReportForCity(city, function(report) {
      var wear_info;
      $('#indicator').hide();
      $('#result').show();
      $('#result #area').text(city_name);
      $('#result #date').text(self.convertDate(report.date));
      $('#result #description').text(report.description);
      $('#result #max-temp').text(report.max);
      $('#result #min-temp').text(report.min);
      self.printWeatherIcons(report.description);
      wear_info = self.getWearInformationFromMinAndMax(report.min, report.max);
      $('#result #comment').text(wear_info.comment);
      self.fillDay($('#result #day-max'), wear_info.daytime);
      return self.fillDay($('#result #day-min'), wear_info.night);
    });
  };
  Viewer.prototype.convertDate = function(date_text) {
    var date, day, fragments, month, wod, year;
    fragments = date_text.match(/(\d+)/g);
    if (fragments.length !== 3) {
      return date_text;
    }
    year = fragments[0];
    month = fragments[1];
    day = fragments[2];
    date = new Date(+year, +month - 1, +day);
    wod = "日月火水木金土"[date.getDay()];
    return "" + (+month) + "月" + (+day) + "日 " + wod + "曜日";
  };
  Viewer.prototype.fillDay = function(target, wears) {
    var bg_path, icons_container, image_container, self;
    self = this;
    image_container = target.find('.wear-image');
    icons_container = target.find('.wear-icons');
    icons_container.empty();
    image_container.empty();
    bg_path = null;
    if (target.attr('id') === 'day-max') {
      bg_path = "images/day.png";
    } else {
      bg_path = "images/night.png";
    }
    $('<img>').attr({
      src: bg_path
    }).appendTo(image_container);
    return _.each(wears, function(wear_name) {
      $('<img>').attr({
        src: "images/icon-" + wear_name + ".png",
        title: self.getWearName(wear_name)
      }).appendTo(icons_container);
      return $('<img>').attr({
        src: "images/" + wear_name + ".png",
        title: self.getWearName(wear_name)
      }).appendTo(image_container);
    });
  };
  Viewer.prototype.getWearName = function(wear) {
    var table;
    table = {
      shirts: 'シャツ',
      cardigan: 'カーディガン',
      sweater: 'セーター',
      jacket: 'ジャケット',
      coat: 'コート',
      muffler: 'マフラー'
    };
    return table[wear];
  };
  Viewer.prototype.printWeatherIcons = function(text) {
    var container, matched;
    container = $('#weather-icons');
    container.empty();
    text = text.replace(/\(.*\)/, '');
    matched = text.match(/(晴|雷雨|雨|雷|曇|霧|)/g);
    return _.each(matched, function(code) {
      var image_path, rule;
      rule = {
        晴: 'images/weather-icon/sun.png',
        雨: 'images/weather-icon/rain.png',
        雷: 'images/weather-icon/thunder.png',
        曇: 'images/weather-icon/cloud.png',
        霧: 'images/weather-icon/mist.png',
        雷雨: 'images/weather-icon/thunder-rain.png'
      };
      image_path = rule[code];
      if (!image_path) {
        return;
      }
      return $('<img>').attr({
        src: image_path,
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
  Viewer.prototype.getWearInformationFromMinAndMax = function(min, max) {
    var distance, getDistance, rules, selected;
    rules = this.CLOTH_RULES;
    selected = null;
    distance = null;
    getDistance = function(x1, x2, y1, y2) {
      return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    };
    _.each(rules, function(rule) {
      var distance_now;
      distance_now = getDistance(min, rule.min, max, rule.max);
      if (!selected || distance_now < distance) {
        selected = rule;
        return distance = distance_now;
      }
    });
    return selected;
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
  Viewer.prototype.CLOTH_RULES = (function() {
    var CLOTH_CARDIGAN, CLOTH_COAT, CLOTH_JACKET, CLOTH_MUFFLER, CLOTH_SHIRTS, CLOTH_SWEATER;
    CLOTH_SHIRTS = 'shirts';
    CLOTH_CARDIGAN = 'cardigan';
    CLOTH_SWEATER = 'sweater';
    CLOTH_JACKET = 'jacket';
    CLOTH_COAT = 'coat';
    CLOTH_MUFFLER = 'muffler';
    return [
      {
        min: 20,
        max: 30,
        daytime: [CLOTH_SHIRTS],
        night: [CLOTH_SHIRTS],
        comment: 'シャツ1枚です'
      }, {
        min: 18,
        max: 22,
        daytime: [CLOTH_SHIRTS],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN],
        comment: '夜はカーディガンいります'
      }, {
        min: 11,
        max: 18,
        daytime: [CLOTH_SHIRTS],
        night: [CLOTH_SHIRTS, CLOTH_JACKET],
        comment: '夜はジャケットいります'
      }, {
        min: 11,
        max: 14,
        daytime: [CLOTH_SHIRTS, CLOTH_JACKET],
        night: [CLOTH_SHIRTS, CLOTH_JACKET],
        comment: 'ジャケットいります'
      }, {
        min: 9,
        max: 13,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER],
        comment: 'セーターいります'
      }, {
        min: 6,
        max: 10,
        daytime: [CLOTH_SHIRTS, CLOTH_CARDIGAN],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_COAT],
        comment: '夜はコートいります'
      }, {
        min: 3,
        max: 7,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT],
        comment: '夜はコートいります'
      }
    ];
  })();
  return Viewer;
})();