(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Viewer, Weather;

Weather = require('./weather');

Viewer = require('./viewer');

$(function() {
  var viewer, weather;
  weather = new Weather;
  viewer = new Viewer(weather);
  return viewer.setup();
});


},{"./viewer":2,"./weather":3}],2:[function(require,module,exports){
var Viewer;

Viewer = (function() {
  function Viewer(weather) {
    this.weather = weather;
  }

  Viewer.prototype.setup = function() {
    var self;
    self = this;
    self.setupCityChanger();
    self.setupEvents();
    self.selectFirstPage();
    return self.checkCurrentPositionIfNeeded();
  };

  Viewer.prototype.selectFirstPage = function() {
    var page_id;
    if (location.hash) {
      $(window).trigger('hashchange');
      return;
    }
    page_id = this.weather.getLastPageId();
    return this.selectPage(page_id, true);
  };

  Viewer.prototype.selectPage = function(target_id, force) {
    var target_page;
    if (!force && target_id === this.weather.getLastPageId) {
      return;
    }
    this.setPageButton(target_id);
    target_page = $(document.body).find("#" + target_id + "-page");
    if (target_page.length === 0) {
      target_id = 'main';
      target_page = $(document.body).find("#" + target_id + "-page");
    }
    this.weather.setLastPageId(target_id);
    $('.page').hide();
    target_page.show();
    if (target_id === "main") {
      $('#help-button').show();
      return $('#back-to-main').hide();
    } else {
      $('#help-button').hide();
      return $('#back-to-main').show();
    }
  };

  Viewer.prototype.setupCityChanger = function() {
    var button, found, label, lat_state_code, select, self;
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
      option.text(city.title);
      if (!found && city.code === lat_state_code) {
        option.attr({
          selected: true
        });
        found = true;
      }
      return select.append(option);
    });
    button = $("<button>").attr({
      id: 'reset-city'
    }).text('現在位置に設定');
    $('#city-selector-container').append(select);
    return $('#city-selector-container').append(button);
  };

  Viewer.prototype.setupEvents = function() {
    var self;
    self = this;
    $('select#city-selector').change(function() {
      self.hideFirstTimeGuide();
      return self.printWeather();
    });
    $('#reset-city').click(function() {
      self.hideFirstTimeGuide();
      return self.getCurrentPositionAndPrint();
    });
    return $(window).bind('hashchange', function() {
      var target_id;
      target_id = location.hash;
      target_id = target_id.replace(/^\#/, '');
      self.selectPage(target_id);
      if (target_id === 'clear') {
        localStorage.clear();
      }
      return setTimeout(function() {
        return window.scrollTo(0, 0);
      });
    });
  };

  Viewer.prototype.checkCurrentPositionIfNeeded = function() {
    var city_code, self;
    self = this;
    city_code = $('select#city-selector').val();
    if (+city_code === -1) {
      return self.printFirstTimeGuide();
    } else {
      return this.printWeather();
    }
  };

  Viewer.prototype.printFirstTimeGuide = function() {
    $("#indicator .message").hide();
    return setTimeout(function() {
      return $("#first-time-guide").show();
    }, 500);
  };

  Viewer.prototype.hideFirstTimeGuide = function() {
    $("#first-time-guide").hide();
    return $("#indicator .message").show();
  };

  Viewer.prototype.getCurrentPositionAndPrint = function() {
    var self;
    self = this;
    $('#indicator').show();
    $('#result').hide();
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
      return self.printWeatherResult(city_name, report);
    });
  };

  Viewer.prototype.printWeatherResult = function(city_name, report) {
    var comment, self, wear_info;
    self = this;
    if (report.min === "" || report.max === "") {
      alert("申し訳ございません，天気を取得できませんでした．時間をおいて試すか，ほかの地域で試してください．");
      return;
    }
    $('#indicator').hide();
    $('#result').show();
    $('#result #area').text(city_name);
    $('#result #date').text(self.convertDate(report.date));
    $('#result #description').text(report.description);
    $('#result #max-temp').text(report.max);
    $('#result #min-temp').text(report.min);
    self.printWeatherIcons(report.description);
    wear_info = self.getWearInformationFromMinAndMax(report.min, report.max);
    wear_info = self.appendUmbrella(wear_info, report.description);
    comment = self.dayInfo(report.date) + wear_info.comment;
    $('#result #comment').text(comment);
    self.setTweetLink(city_name + " " + report.description + " " + comment);
    self.fillDay($('#result #day-max'), wear_info.daytime);
    self.fillDay($('#result #day-min'), wear_info.night);
    return self.checkScroll();
  };

  Viewer.prototype.formatNumber = function(value, length) {
    var all;
    all = "00000000000" + value;
    return all.slice(all.length - length, +all.length + 1 || 9e9);
  };

  Viewer.prototype.appendUmbrella = function(wear_info, description) {
    var UMBRELLA, choise;
    UMBRELLA = 'umbrella';
    choise = function(list) {
      return list[Math.floor(Math.random() * list.length)];
    };
    if (!description.match(/雨/)) {
      return wear_info;
    }
    wear_info.daytime.push(UMBRELLA);
    wear_info.night.push(UMBRELLA);
    wear_info.comment += ' ' + choise(['傘もあるといいですね', '傘が役立ちます', '傘を持って出かけましょう', '傘が恋しい一日です', '傘持っていきませんか', '傘が活躍します']);
    return wear_info;
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
    return (+month) + "/" + (+day) + " (" + wod + ")";
  };

  Viewer.prototype.dateFromText = function(date_text) {
    var day, fragments, month, year;
    fragments = date_text.match(/(\d+)/g);
    year = fragments[0];
    month = fragments[1];
    day = fragments[2];
    return new Date(+year, +month - 1, +day);
  };

  Viewer.prototype.dayInfo = function(date_text) {
    var date, fragments, self, today, wod;
    self = this;
    fragments = date_text.match(/(\d+)/g);
    if (fragments.length !== 3) {
      return "今日は";
    }
    date = self.dateFromText(date_text);
    today = new Date;
    if (date.getDay() === today.getDay() && date.getDate() === today.getDate()) {
      return "今日は";
    } else if ((date.getDay() % 7) === ((today.getDay() + 1) % 7) && (date.getDate() === today.getDate() + 1)) {
      return "明日は";
    }
    wod = "日月火水木金土"[date.getDay()];
    return (date.getDate()) + "日(" + wod + "曜日)は";
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
      if (wear_name !== 'umbrella') {
        $('<img>').attr({
          src: "images/icon-" + wear_name + ".png",
          title: self.getWearName(wear_name)
        }).appendTo(icons_container);
      }
      return $('<img>').attr({
        src: "images/" + wear_name + ".png",
        title: self.getWearName(wear_name)
      }).appendTo(image_container);
    });
  };

  Viewer.prototype.getWearName = function(wear) {
    var table;
    table = {
      halfshirts: '半袖シャツ',
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
    matched = text.match(/(晴|雷雨|雪|雨|雷|曇|霧|)/g);
    return _.each(matched, function(code) {
      var image_path, rule;
      rule = {
        晴: 'images/weather-sunny.png',
        雨: 'images/weather-rain.png',
        雷: 'images/weather-thunder.png',
        雪: 'images/weather-snow.png',
        曇: 'images/weather-cloudy.png',
        霧: 'images/weather-mist.png',
        雷雨: 'images/weather-thunderstorm.png'
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

  Viewer.prototype.getWearInformationFromMinAndMax = function(min, max) {
    var distance, getDistance, rules, selected;
    rules = this.CLOTH_RULES;
    selected = null;
    distance = null;
    getDistance = function(x1, x2, y1, y2) {
      if (x1 <= x2 && y1 <= y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
      } else {
        return 100000;
      }
    };
    _.each(rules, function(rule) {
      var distance_now;
      distance_now = getDistance(min, rule.min, max, rule.max);
      if (!selected || distance_now < distance) {
        selected = rule;
        return distance = distance_now;
      }
    });
    return JSON.parse(JSON.stringify(selected));
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
    text = message + " " + hashtag;
    share_url = "https://twitter.com/share?url=" + (encodeURIComponent(url)) + "&text=" + (encodeURIComponent(text));
    return $("a#share-tweet").attr({
      href: share_url
    });
  };

  Viewer.prototype.setPageButton = function(target_id) {
    $(".page-changer.selected").removeClass("selected");
    return $("#" + target_id + "-selector").addClass("selected");
  };

  Viewer.prototype.checkScroll = function() {
    if (this.weather.getLastPageId() !== 'main') {
      return;
    }
    if (navigator.appVersion.match(/iPhone OS/)) {
      return setTimeout(function() {
        return window.scrollTo(0, $('#result').position().top);
      }, 500);
    }
  };

  Viewer.prototype.HASHTAG = "#重ね着";

  Viewer.prototype.SERVICE_URL = "http://higashi-dance-network.appspot.com/kasanegi/";

  Viewer.prototype.SEARCH_TEXT = "http://higashi-dance-network.appspot.com/kasanegi/ #重ね着";

  Viewer.prototype.CLOTH_RULES = (function() {
    var CLOTH_CARDIGAN, CLOTH_COAT, CLOTH_HALF_SHIRTS, CLOTH_JACKET, CLOTH_MUFFLER, CLOTH_SHIRTS, CLOTH_SWEATER;
    CLOTH_HALF_SHIRTS = 'halfshirts';
    CLOTH_SHIRTS = 'shirts';
    CLOTH_CARDIGAN = 'cardigan';
    CLOTH_SWEATER = 'sweater';
    CLOTH_JACKET = 'jacket';
    CLOTH_COAT = 'coat';
    CLOTH_MUFFLER = 'muffler';
    return [
      {
        min: 100,
        max: 100,
        daytime: [CLOTH_HALF_SHIRTS],
        night: [CLOTH_HALF_SHIRTS],
        comment: '異常な暑さです'
      }, {
        min: 50,
        max: 50,
        daytime: [CLOTH_HALF_SHIRTS],
        night: [CLOTH_HALF_SHIRTS],
        comment: '暑いので半袖で出かけましょう'
      }, {
        min: 35,
        max: 35,
        daytime: [CLOTH_SHIRTS],
        night: [CLOTH_SHIRTS],
        comment: '暖かくていい天気なのでシャツ一枚で大丈夫です'
      }, {
        min: 34,
        max: 34,
        daytime: [CLOTH_SHIRTS],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN],
        comment: '昼は暑く夜はカーディガンがあればいいくらいです'
      }, {
        min: 15,
        max: 25,
        daytime: [CLOTH_SHIRTS],
        night: [CLOTH_SHIRTS, CLOTH_JACKET],
        comment: '少し冷えるのでジャケットを着ましょう'
      }, {
        min: 10,
        max: 25,
        daytime: [CLOTH_SHIRTS],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_JACKET],
        comment: '冷えるのでカーディガンとジャケットを着ましょう'
      }, {
        min: 7,
        max: 25,
        daytime: [CLOTH_SHIRTS],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_COAT],
        comment: '冷えるのでカーディガンとコートを着ましょう'
      }, {
        min: 5,
        max: 25,
        daytime: [CLOTH_SHIRTS],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_COAT, CLOTH_MUFFLER],
        comment: 'すごく冷えるのでカーディガンとコートとマフラーを着ましょう'
      }, {
        min: 18,
        max: 18,
        daytime: [CLOTH_SHIRTS, CLOTH_CARDIGAN],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN],
        comment: '一日肌寒いのでカーディガンです'
      }, {
        min: 15,
        max: 18,
        daytime: [CLOTH_SHIRTS, CLOTH_JACKET],
        night: [CLOTH_SHIRTS, CLOTH_JACKET],
        comment: '朝晩冷えるので一日ジャケットです'
      }, {
        min: 10,
        max: 18,
        daytime: [CLOTH_SHIRTS, CLOTH_CARDIGAN],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_JACKET],
        comment: 'カーディガンにジャケットを羽織ります'
      }, {
        min: 7,
        max: 18,
        daytime: [CLOTH_SHIRTS, CLOTH_CARDIGAN],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_COAT],
        comment: 'カーディガンにコートを羽織ります'
      }, {
        min: 5,
        max: 18,
        daytime: [CLOTH_SHIRTS, CLOTH_CARDIGAN],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_COAT, CLOTH_MUFFLER],
        comment: '夜は寒いのでコートにマフラーがいいです'
      }, {
        min: 14,
        max: 14,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER],
        comment: '一日冷えるのでセーターです'
      }, {
        min: 10,
        max: 14,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_JACKET],
        comment: 'セーターにジャケットを羽織ります'
      }, {
        min: 7,
        max: 14,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT],
        comment: 'もこもこセーターにコート羽織って出かけましょう'
      }, {
        min: 5,
        max: 14,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT, CLOTH_MUFFLER],
        comment: '夜は冷え込むのでたくさん着ていきましょう'
      }, {
        min: 12,
        max: 12,
        daytime: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_COAT],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_COAT],
        comment: '一日少し寒いのでカーディガンとコートを着ましょう'
      }, {
        min: 8,
        max: 12,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT],
        comment: '一日寒いのでセータとコートを着ましょう'
      }, {
        min: 5,
        max: 12,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT, CLOTH_MUFFLER],
        comment: '一日寒いので昼でもコート夜はマフラーです'
      }, {
        min: 5,
        max: 5,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT, CLOTH_MUFFLER],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT, CLOTH_MUFFLER],
        comment: 'すごく寒いので一日マフラーが手放せません'
      }
    ];
  })();

  return Viewer;

})();

module.exports = Viewer;


},{}],3:[function(require,module,exports){
var Weather;

Weather = (function() {
  function Weather() {}

  Weather.prototype.getLastCityCode = function() {
    return localStorage.city_code;
  };

  Weather.prototype.setLastCityCode = function(city_code) {
    return localStorage.city_code = city_code;
  };

  Weather.prototype.getCurrentStateCode = function(callback) {
    var self;
    self = this;
    if (!(navigator && navigator.geolocation)) {
      callback(SURFPOINT.getPrefCode());
      return;
    }
    return navigator.geolocation.getCurrentPosition(function(position) {
      var lat, lon;
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      return self.getStatusCodeFromLatLon(lat, lon, callback);
    }, function(error) {
      return callback(SURFPOINT.getPrefCode());
    });
  };

  Weather.prototype.getLastPageId = function() {
    return localStorage.last_page_id || 'main';
  };

  Weather.prototype.setLastPageId = function(last_page_id) {
    return localStorage.last_page_id = last_page_id;
  };

  Weather.prototype.getStatusCodeFromLatLon = function(lat, lon, callback) {
    var self;
    self = this;
    return $.ajax({
      type: 'GET',
      url: "http://reverse.search.olp.yahooapis.jp/OpenLocalPlatform/V1/reverseGeoCoder",
      data: {
        lat: lat,
        lon: lon,
        output: 'json',
        appid: self.YAHOO_APPLICATION_ID
      },
      dataType: 'JSONP',
      success: function(res) {
        var code, error, error1;
        try {
          code = res.Feature[0].Property.AddressElement[0].Code;
        } catch (error1) {
          error = error1;
          code = self.getCurrentStateCodeFromIP();
        }
        return callback(code);
      },
      error: function() {
        return alert('通信時にエラーが発生しました．時間をおいて試してみてください．');
      }
    });
  };

  Weather.prototype.getCurrentStateCodeFromIP = function() {
    return SURFPOINT.getPrefCode();
  };

  Weather.prototype.eachCity = function(callback) {
    return _.each(this.CITIES, function(city) {
      return callback(city);
    });
  };

  Weather.prototype.getCityByCityCode = function(city_code) {
    var found;
    found = null;
    this.eachCity(function(city) {
      if (city.code === city_code) {
        return found = city;
      }
    });
    return found;
  };

  Weather.prototype.getDefaultCityForState = function(state_code) {
    if (state_code == null) {
      state_code = this.getCurrentStateCode();
    }
    return _.find(this.CITIES, function(city) {
      return city.code.substr(0, 2) === state_code;
    });
  };

  Weather.prototype._ajaxCache = {};

  Weather.prototype._ajaxByProxy = function(url, callback) {
    var self;
    self = this;
    if (self._ajaxCache[url]) {
      callback(self._ajaxCache[url]);
      return;
    }
    $.ajax({
      type: 'GET',
      url: "/proxy/" + (encodeURIComponent(url)),
      success: function(res) {
        self._ajaxCache[url] = res;
        return callback(res);
      },
      error: function() {
        return alert('通信時にエラーが発生しました．時間をおいて試してみてください．');
      }
    });
  };

  Weather.prototype.getWeatherReportForCity = function(city, callback) {
    var city_code, res, self;
    if (false) {
      res = {
        date: '2011-11-02',
        description: '雲り',
        min: 11,
        max: 24
      };
      callback(res);
      return;
    }
    city_code = city.code;
    self = this;
    return self._ajaxByProxy("http://weather.livedoor.com/forecast/webservice/json/v1?city=" + city_code, function(data) {
      var base, base1, day, today, tomorrow;
      today = data.forecasts[0];
      tomorrow = data.forecasts[1];
      if (today.temperature.min && today.temperature.max) {
        day = today;
      } else if (today.temperature.min || today.temperature.max) {
        day = today;
        if ((base = day.temperature).min == null) {
          base.min = tomorrow.temperature.min;
        }
        if ((base1 = day.temperature).max == null) {
          base1.max = tomorrow.temperature.max;
        }
      } else {
        day = tomorrow;
      }
      callback({
        date: day.date,
        description: day.telop,
        min: day.temperature.min.celsius,
        max: day.temperature.max.celsius
      });
    });
  };

  Weather.prototype.YAHOO_APPLICATION_ID = 'J17Tyuixg65goAW301d5vBkBWtO9gLQsJnC0Y7OyJJk96wumaSU2U3odNwj5PdIU1A--';

  Weather.prototype.CITIES = [
    {
      "title": "道北 稚内",
      "code": "011000"
    }, {
      "title": "道北 旭川",
      "code": "012010"
    }, {
      "title": "道北 留萌",
      "code": "012020"
    }, {
      "title": "道東 網走",
      "code": "013010"
    }, {
      "title": "道東 北見",
      "code": "013020"
    }, {
      "title": "道東 紋別",
      "code": "013030"
    }, {
      "title": "道東 根室",
      "code": "014010"
    }, {
      "title": "道東 釧路",
      "code": "014020"
    }, {
      "title": "道東 帯広",
      "code": "014030"
    }, {
      "title": "道南 室蘭",
      "code": "015010"
    }, {
      "title": "道南 浦河",
      "code": "015020"
    }, {
      "title": "道央 札幌",
      "code": "016010"
    }, {
      "title": "道央 岩見沢",
      "code": "016020"
    }, {
      "title": "道央 倶知安",
      "code": "016030"
    }, {
      "title": "道南 函館",
      "code": "017010"
    }, {
      "title": "道南 江差",
      "code": "017020"
    }, {
      "title": "青森 県 青森",
      "code": "020010"
    }, {
      "title": "青森県 むつ",
      "code": "020020"
    }, {
      "title": "青森県 八戸",
      "code": "020030"
    }, {
      "title": "岩手県 盛岡",
      "code": "030010"
    }, {
      "title": "岩手県 宮古",
      "code": "030020"
    }, {
      "title": "岩手県 大船渡",
      "code": "030030"
    }, {
      "title": "宮城県 仙台",
      "code": "040010"
    }, {
      "title": "宮城県 白石",
      "code": "040020"
    }, {
      "title": "秋田県 秋田",
      "code": "050010"
    }, {
      "title": "秋田県 横手",
      "code": "050020"
    }, {
      "title": "山形県 山形",
      "code": "060010"
    }, {
      "title": "山形県 米沢",
      "code": "060020"
    }, {
      "title": "山形県 酒田",
      "code": "060030"
    }, {
      "title": "山形県 新庄",
      "code": "060040"
    }, {
      "title": "福島県 福島",
      "code": "070010"
    }, {
      "title": "福島県 小名浜",
      "code": "070020"
    }, {
      "title": "福島県 若松",
      "code": "070030"
    }, {
      "title": "茨城県 水戸",
      "code": "080010"
    }, {
      "title": "茨城県 土浦",
      "code": "080020"
    }, {
      "title": "栃木県 宇都宮",
      "code": "090010"
    }, {
      "title": "栃木県 大田原",
      "code": "090020"
    }, {
      "title": "群馬県 前橋",
      "code": "100010"
    }, {
      "title": "群馬県 みなかみ",
      "code": "100020"
    }, {
      "title": "埼玉県 さいたま",
      "code": "110010"
    }, {
      "title": "埼玉県 熊谷",
      "code": "110020"
    }, {
      "title": "埼玉県 秩父",
      "code": "110030"
    }, {
      "title": "千葉県 千葉",
      "code": "120010"
    }, {
      "title": "千葉県 銚子",
      "code": "120020"
    }, {
      "title": "千葉県 館山",
      "code": "120030"
    }, {
      "title": "東京都 東京",
      "code": "130010"
    }, {
      "title": "東京都 大島",
      "code": "130020"
    }, {
      "title": "東京都 八丈島",
      "code": "130030"
    }, {
      "title": "東京都 父島",
      "code": "130040"
    }, {
      "title": "神奈川県 横浜",
      "code": "140010"
    }, {
      "title": "神奈川県 小田原",
      "code": "140020"
    }, {
      "title": "新潟県 新潟",
      "code": "150010"
    }, {
      "title": "新潟県 長岡",
      "code": "150020"
    }, {
      "title": "新潟県 高田",
      "code": "150030"
    }, {
      "title": "新潟県 相川",
      "code": "150040"
    }, {
      "title": "富山県 富山",
      "code": "160010"
    }, {
      "title": "富山県 伏木",
      "code": "160020"
    }, {
      "title": "石川県 金沢",
      "code": "170010"
    }, {
      "title": "石川県 輪島",
      "code": "170020"
    }, {
      "title": "福井県 福井",
      "code": "180010"
    }, {
      "title": "福井県 敦賀",
      "code": "180020"
    }, {
      "title": "山梨県 甲府",
      "code": "190010"
    }, {
      "title": "山梨県 河口湖",
      "code": "190020"
    }, {
      "title": "長野県 長野",
      "code": "200010"
    }, {
      "title": "長野県 松本",
      "code": "200020"
    }, {
      "title": "長野県 飯田",
      "code": "200030"
    }, {
      "title": "岐阜県 岐阜",
      "code": "210010"
    }, {
      "title": "岐阜県 高山",
      "code": "210020"
    }, {
      "title": "静岡県 静岡",
      "code": "220010"
    }, {
      "title": "静岡県 網代",
      "code": "220020"
    }, {
      "title": "静岡県 三島",
      "code": "220030"
    }, {
      "title": "静岡県 浜松",
      "code": "220040"
    }, {
      "title": "愛知県 名古屋",
      "code": "230010"
    }, {
      "title": "愛知県 豊橋",
      "code": "230020"
    }, {
      "title": "三重県 津",
      "code": "240010"
    }, {
      "title": "三重県 尾鷲",
      "code": "240020"
    }, {
      "title": "滋賀県 大津",
      "code": "250010"
    }, {
      "title": "滋賀県 彦根",
      "code": "250020"
    }, {
      "title": "京都府 京都",
      "code": "260010"
    }, {
      "title": "京都府 舞鶴",
      "code": "260020"
    }, {
      "title": "大阪府 大阪",
      "code": "270000"
    }, {
      "title": "兵庫県 神戸",
      "code": "280010"
    }, {
      "title": "兵庫県 豊岡",
      "code": "280020"
    }, {
      "title": "奈良県 奈良",
      "code": "290010"
    }, {
      "title": "奈良県 風屋",
      "code": "290020"
    }, {
      "title": "和歌山県 和歌山",
      "code": "300010"
    }, {
      "title": "和歌山県 潮岬",
      "code": "300020"
    }, {
      "title": "鳥取県 鳥取",
      "code": "310010"
    }, {
      "title": "鳥取県 米子",
      "code": "310020"
    }, {
      "title": "島根県 松江",
      "code": "320010"
    }, {
      "title": "島根県 浜田",
      "code": "320020"
    }, {
      "title": "島根県 西郷",
      "code": "320030"
    }, {
      "title": "岡山県 岡山",
      "code": "330010"
    }, {
      "title": "岡山県 津山",
      "code": "330020"
    }, {
      "title": "広島県 広島",
      "code": "340010"
    }, {
      "title": "広島県 庄原",
      "code": "340020"
    }, {
      "title": "山口県 下関",
      "code": "350010"
    }, {
      "title": "山口県 山口",
      "code": "350020"
    }, {
      "title": "山口県 柳井",
      "code": "350030"
    }, {
      "title": "山口県 萩",
      "code": "350040"
    }, {
      "title": "徳島県 徳島",
      "code": "360010"
    }, {
      "title": "徳島県 日和佐",
      "code": "360020"
    }, {
      "title": "香川県 高松",
      "code": "370000"
    }, {
      "title": "愛媛県 松山",
      "code": "380010"
    }, {
      "title": "愛媛県 新居浜",
      "code": "380020"
    }, {
      "title": "愛媛県 宇和島",
      "code": "380030"
    }, {
      "title": "高知県 高知",
      "code": "390010"
    }, {
      "title": "高知県 室戸岬",
      "code": "390020"
    }, {
      "title": "高知県 清水",
      "code": "390030"
    }, {
      "title": "福岡県 福岡",
      "code": "400010"
    }, {
      "title": "福岡県 八幡",
      "code": "400020"
    }, {
      "title": "福岡県 飯塚",
      "code": "400030"
    }, {
      "title": "福岡県 久留米",
      "code": "400040"
    }, {
      "title": "佐賀県 佐賀",
      "code": "410010"
    }, {
      "title": "佐賀県 伊万里",
      "code": "410020"
    }, {
      "title": "長崎県 長崎",
      "code": "420010"
    }, {
      "title": "長崎県 佐世保",
      "code": "420020"
    }, {
      "title": "長崎県 厳原",
      "code": "420030"
    }, {
      "title": "長崎県 福江",
      "code": "420040"
    }, {
      "title": "熊本県 熊本",
      "code": "430010"
    }, {
      "title": "熊本県 阿蘇乙姫",
      "code": "430020"
    }, {
      "title": "熊本県 牛深",
      "code": "430030"
    }, {
      "title": "熊本県 人吉",
      "code": "430040"
    }, {
      "title": "大分県 大分",
      "code": "440010"
    }, {
      "title": "大分県 中津",
      "code": "440020"
    }, {
      "title": "大分県 日田",
      "code": "440030"
    }, {
      "title": "大分県 佐伯",
      "code": "440040"
    }, {
      "title": "宮崎県 宮崎",
      "code": "450010"
    }, {
      "title": "宮崎県 延岡",
      "code": "450020"
    }, {
      "title": "宮崎県 都城",
      "code": "450030"
    }, {
      "title": "宮崎県 高千穂",
      "code": "450040"
    }, {
      "title": "鹿児島県 鹿児島",
      "code": "460010"
    }, {
      "title": "鹿児島県 鹿屋",
      "code": "460020"
    }, {
      "title": "鹿児島県 種子島",
      "code": "460030"
    }, {
      "title": "鹿児島県 名瀬",
      "code": "460040"
    }, {
      "title": "沖縄県 那覇",
      "code": "471010"
    }, {
      "title": "沖縄県 名護",
      "code": "471020"
    }, {
      "title": "沖縄県 久米島",
      "code": "471030"
    }, {
      "title": "沖縄県 南大東",
      "code": "472000"
    }, {
      "title": "沖縄県 宮古島",
      "code": "473000"
    }, {
      "title": "沖縄県 石垣島",
      "code": "474010"
    }, {
      "title": "沖縄県 与那国島",
      "code": "474020"
    }
  ];

  return Weather;

})();

module.exports = Weather;


},{}]},{},[1]);
