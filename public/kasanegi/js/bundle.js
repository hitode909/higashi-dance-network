(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _weather = require('./weather');

var _weather2 = _interopRequireDefault(_weather);

var _viewer = require('./viewer');

var _viewer2 = _interopRequireDefault(_viewer);

var _jquery = (window.$);

var _jquery2 = _interopRequireDefault(_jquery);

var _underscore = (window._);

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _jquery2.default)(function () {
  var weather = new _weather2.default();
  var viewer = new _viewer2.default(weather);
  return viewer.setup();
});

},{"./viewer":2,"./weather":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = (window._);

var _underscore2 = _interopRequireDefault(_underscore);

var _jquery = (window.$);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Viewer = function () {
  _createClass(Viewer, null, [{
    key: 'initClass',
    value: function initClass() {

      // ----- constants -----
      this.prototype.HASHTAG = '#重ね着';
      this.prototype.SERVICE_URL = 'http://higashi-dance-network.appspot.com/kasanegi/';
      this.prototype.SEARCH_TEXT = 'http://higashi-dance-network.appspot.com/kasanegi/ #重ね着';

      this.prototype.CLOTH_RULES = function () {
        var CLOTH_HALF_SHIRTS = 'halfshirts';
        var CLOTH_SHIRTS = 'shirts';
        var CLOTH_CARDIGAN = 'cardigan';
        var CLOTH_SWEATER = 'sweater';
        var CLOTH_JACKET = 'jacket';
        var CLOTH_COAT = 'coat';
        var CLOTH_MUFFLER = 'muffler';

        return [
        // エラー対策
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
        }];
      }();
    }
  }]);

  function Viewer(weather) {
    _classCallCheck(this, Viewer);

    this.weather = weather;
  }

  _createClass(Viewer, [{
    key: 'setup',
    value: function setup() {
      var self = this;
      self.setupCityChanger();
      self.setupEvents();
      self.selectFirstPage();
      return self.checkCurrentPositionIfNeeded();
    }
  }, {
    key: 'selectFirstPage',
    value: function selectFirstPage() {
      if (location.hash) {
        (0, _jquery2.default)(window).trigger('hashchange');
        return;
      }

      var page_id = this.weather.getLastPageId();
      return this.selectPage(page_id, true);
    }
  }, {
    key: 'selectPage',
    value: function selectPage(target_id, force) {
      if (!force && target_id === this.weather.getLastPageId) {
        // do nothing
        return;
      }

      this.setPageButton(target_id);
      var target_page = (0, _jquery2.default)(document.body).find('#' + target_id + '-page');
      if (target_page.length === 0) {
        target_id = 'main';
        target_page = (0, _jquery2.default)(document.body).find('#' + target_id + '-page');
      }
      this.weather.setLastPageId(target_id);

      (0, _jquery2.default)('.page').hide();
      target_page.show();

      if (target_id === 'main') {
        (0, _jquery2.default)('#help-button').show();
        return (0, _jquery2.default)('#back-to-main').hide();
      } else {
        (0, _jquery2.default)('#help-button').hide();
        return (0, _jquery2.default)('#back-to-main').show();
      }
    }
  }, {
    key: 'setupCityChanger',
    value: function setupCityChanger() {
      var self = this;
      var lat_state_code = self.weather.getLastCityCode();
      var found = false;

      var select = (0, _jquery2.default)('<select>').attr({
        name: 'city',
        id: 'city-selector'
      });

      var label = (0, _jquery2.default)('<option>').attr({
        name: 'city',
        value: -1,
        disabled: 'disabled'
      });

      label.text('地域を選択');

      select.append(label);

      this.weather.eachCity(function (city) {
        var option = (0, _jquery2.default)('<option>').attr({
          name: 'city',
          value: city.code
        });
        option.text(city.title);

        if (!found && city.code === lat_state_code) {
          option.attr({
            selected: true });

          found = true;
        }

        return select.append(option);
      });

      var button = (0, _jquery2.default)('<button>').attr({
        id: 'reset-city' }).text('現在位置に設定');

      (0, _jquery2.default)('#city-selector-container').append(select);
      (0, _jquery2.default)('#city-selector-container').append(button);

      if (!found) {
        var tokyo = '130010';
        select.val(tokyo);
        return this.weather.setLastCityCode(tokyo);
      }
    }
  }, {
    key: 'setupEvents',
    value: function setupEvents() {
      var self = this;
      (0, _jquery2.default)('select#city-selector').change(function () {
        self.hideFirstTimeGuide();
        return self.printWeather();
      });

      (0, _jquery2.default)('#reset-city').click(function () {
        self.hideFirstTimeGuide();
        return self.getCurrentPositionAndPrint();
      });

      return (0, _jquery2.default)(window).bind('hashchange', function () {
        var target_id = location.hash;
        target_id = target_id.replace(/^\#/, '');
        self.selectPage(target_id);
        if (target_id === 'clear') {
          localStorage.clear();
        }

        return setTimeout(function () {
          return window.scrollTo(0, 0);
        });
      });
    }
  }, {
    key: 'checkCurrentPositionIfNeeded',
    value: function checkCurrentPositionIfNeeded() {
      var self = this;
      var city_code = (0, _jquery2.default)('select#city-selector').val();

      // 地域を選択 = -1
      if (+city_code === -1) {
        return self.printFirstTimeGuide();
      } else {
        return this.printWeather();
      }
    }
  }, {
    key: 'printFirstTimeGuide',
    value: function printFirstTimeGuide() {
      (0, _jquery2.default)('#indicator .message').hide();
      return setTimeout(function () {
        return (0, _jquery2.default)('#first-time-guide').show();
      }, 500);
    }
  }, {
    key: 'hideFirstTimeGuide',
    value: function hideFirstTimeGuide() {
      (0, _jquery2.default)('#first-time-guide').hide();
      return (0, _jquery2.default)('#indicator .message').show();
    }
  }, {
    key: 'getCurrentPositionAndPrint',
    value: function getCurrentPositionAndPrint() {
      var self = this;

      (0, _jquery2.default)('#indicator').show();
      (0, _jquery2.default)('#result').hide();

      return self.weather.getCurrentStateCode(function (state_code) {
        var city = self.weather.getDefaultCityForState(state_code);
        var city_code = city.code;

        var option = (0, _jquery2.default)('option[value=' + city_code + ']');
        option.attr({
          selected: 'selected' });

        return self.printWeather();
      }, function () {
        return (0, _jquery2.default)('#reset-city').remove();
      });
    }

    // ----- actions -----

    // first day

  }, {
    key: 'printWeather',
    value: function printWeather() {
      var self = this;

      (0, _jquery2.default)('#indicator').show();
      (0, _jquery2.default)('#result').hide();
      var selected = (0, _jquery2.default)('select#city-selector option:selected');
      var city_code = selected.val();
      var city_name = selected.text();
      var city = this.weather.getCityByCityCode(city_code);
      this.weather.setLastCityCode(city_code);

      return this.weather.getWeatherReportForCity(city, function (report) {
        return self.printWeatherResult(city_name, report);
      });
    }
  }, {
    key: 'printWeatherResult',
    value: function printWeatherResult(city_name, report) {
      var self = this;

      if (report.min === '' || report.max === '') {
        alert('申し訳ございません，天気を取得できませんでした．時間をおいて試すか，ほかの地域で試してください．');
        return;
      }

      (0, _jquery2.default)('#indicator').hide();
      (0, _jquery2.default)('#result').show();
      (0, _jquery2.default)('#result #area').text(city_name);
      (0, _jquery2.default)('#result #date').text(self.convertDate(report.date));
      (0, _jquery2.default)('#result #description').text(report.description);
      (0, _jquery2.default)('#result #max-temp').text(report.max);
      (0, _jquery2.default)('#result #min-temp').text(report.min);
      self.printWeatherIcons(report.description);

      var wear_info = self.getWearInformationFromMinAndMax(report.min, report.max);

      wear_info = self.appendUmbrella(wear_info, report.description);

      var comment = self.dayInfo(report.date) + wear_info.comment;

      (0, _jquery2.default)('#result #comment').text(comment);

      self.setTweetLink(city_name + ' ' + report.description + ' ' + comment);

      self.fillDay((0, _jquery2.default)('#result #day-max'), wear_info.daytime);
      self.fillDay((0, _jquery2.default)('#result #day-min'), wear_info.night);

      return self.checkScroll();
    }
  }, {
    key: 'formatNumber',
    value: function formatNumber(value, length) {
      var all = '00000000000' + value;
      return all.slice(all.length - length, +all.length + 1 || undefined);
    }

    // 雨なら持ち物に傘を追加

  }, {
    key: 'appendUmbrella',
    value: function appendUmbrella(wear_info, description) {
      var UMBRELLA = 'umbrella';
      var choise = function choise(list) {
        return list[Math.floor(Math.random() * list.length)];
      };

      if (!description.match(/雨/)) {
        return wear_info;
      }

      wear_info.daytime.push(UMBRELLA);
      wear_info.night.push(UMBRELLA);
      wear_info.comment += ' ' + choise(['傘もあるといいですね', '傘が役立ちます', '傘を持って出かけましょう', '傘が恋しい一日です', '傘持っていきませんか', '傘が活躍します']);

      return wear_info;
    }

    // 2011-11-04 -> 11/4

  }, {
    key: 'convertDate',
    value: function convertDate(date_text) {
      var fragments = date_text.match(/(\d+)/g);

      if (fragments.length !== 3) {
        return date_text;
      }

      var year = fragments[0];
      var month = fragments[1];
      var day = fragments[2];

      var date = new Date(+year, +month - 1, +day); // month = 0 ~ 11
      var wod = '日月火水木金土'[date.getDay()];

      return +month + '/' + +day + ' (' + wod + ')';
    }
  }, {
    key: 'dateFromText',
    value: function dateFromText(date_text) {
      var fragments = date_text.match(/(\d+)/g);

      var year = fragments[0];
      var month = fragments[1];
      var day = fragments[2];

      return new Date(+year, +month - 1, +day); // month = 0 ~ 11
    }

    // 2011-11-04 -> 今日は or 明日は or 水曜日

  }, {
    key: 'dayInfo',
    value: function dayInfo(date_text) {
      var self = this;

      var fragments = date_text.match(/(\d+)/g);

      if (fragments.length !== 3) {
        return '今日は';
      }

      var date = self.dateFromText(date_text);
      var today = new Date();

      if (date.getDay() === today.getDay() && date.getDate() === today.getDate()) {
        return '今日は';
      } else if (date.getDay() % 7 === (today.getDay() + 1) % 7 && date.getDate() === today.getDate() + 1) {
        return '明日は';
      }

      var wod = '日月火水木金土'[date.getDay()];
      return date.getDate() + '\u65E5(' + wod + '\u66DC\u65E5)\u306F';
    }
  }, {
    key: 'fillDay',
    value: function fillDay(target, wears) {
      var self = this;
      var image_container = target.find('.wear-image');
      var icons_container = target.find('.wear-icons');

      icons_container.empty();
      image_container.empty();

      var bg_path = null;
      if (target.attr('id') === 'day-max') {
        bg_path = 'images/day.png';
      } else {
        bg_path = 'images/night.png';
      }

      (0, _jquery2.default)('<img>').attr({
        src: bg_path }).appendTo(image_container);

      return _underscore2.default.each(wears, function (wear_name) {
        // XXX: 傘だけはアイコン出さない．縦2列になって見た目も悪い．
        if (wear_name !== 'umbrella') {
          (0, _jquery2.default)('<img>').attr({
            src: 'images/icon-' + wear_name + '.png',
            title: self.getWearName(wear_name) }).appendTo(icons_container);
        }

        return (0, _jquery2.default)('<img>').attr({
          src: 'images/' + wear_name + '.png',
          title: self.getWearName(wear_name) }).appendTo(image_container);
      });
    }
  }, {
    key: 'getWearName',
    value: function getWearName(wear) {
      var table = {
        halfshirts: '半袖シャツ',
        shirts: 'シャツ',
        cardigan: 'カーディガン',
        sweater: 'セーター',
        jacket: 'ジャケット',
        coat: 'コート',
        muffler: 'マフラー'
      };

      return table[wear];
    }
  }, {
    key: 'printWeatherIcons',
    value: function printWeatherIcons(text) {
      var container = (0, _jquery2.default)('#weather-icons');

      container.empty();

      text = text.replace(/\(.*\)/, '');
      var matched = text.match(/(晴|雷雨|雪|雨|雷|曇|霧|)/g);

      return _underscore2.default.each(matched, function (code) {
        var rule = {
          '晴': 'images/weather-sunny.png',
          '雨': 'images/weather-rain.png',
          '雷': 'images/weather-thunder.png',
          '雪': 'images/weather-snow.png',
          '曇': 'images/weather-cloudy.png',
          '霧': 'images/weather-mist.png',
          '雷雨': 'images/weather-thunderstorm.png'
        };

        var image_path = rule[code];
        if (!image_path) {
          return;
        }

        return (0, _jquery2.default)('<img>').attr({
          src: image_path,
          title: code }).appendTo(container);
      });
    }

    // return { daytime: [image_pathes] night: [image_pathes] message: text }

  }, {
    key: 'getWearInformationFromMinAndMax',
    value: function getWearInformationFromMinAndMax(min, max) {
      // あらかじめ決められたペアから一番近いのを探してきます

      var rules = this.CLOTH_RULES;
      var selected = null;
      var distance = null;

      //       .  point 2
      //
      // .  point 1
      var getDistance = function getDistance(x1, x2, y1, y2) {
        if (x1 <= x2 && y1 <= y2) {
          return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        } else {
          return 100000;
        }
      };

      _underscore2.default.each(rules, function (rule) {
        var distance_now = getDistance(min, rule.min, max, rule.max);
        if (!selected || distance_now < distance) {
          selected = rule;
          return distance = distance_now;
        }
      });

      // 傘をくっつけることもあるのでコピーして返す
      return JSON.parse(JSON.stringify(selected));
    }
  }, {
    key: 'setTweetLink',
    value: function setTweetLink(message, hashtag) {
      if (message == null) {
        message = '3枚です';
      }
      if (hashtag == null) {
        hashtag = this.HASHTAG;
      }
      var url = this.SERVICE_URL;
      var text = message + ' ' + hashtag;
      var share_url = 'https://twitter.com/share?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text);
      return (0, _jquery2.default)('a#share-tweet').attr({
        href: share_url });
    }
  }, {
    key: 'setPageButton',
    value: function setPageButton(target_id) {
      (0, _jquery2.default)('.page-changer.selected').removeClass('selected');
      return (0, _jquery2.default)('#' + target_id + '-selector').addClass('selected');
    }
  }, {
    key: 'checkScroll',
    value: function checkScroll() {
      if (this.weather.getLastPageId() !== 'main') {
        return;
      }
      if (navigator.appVersion.match(/iPhone OS/)) {
        return setTimeout(function () {
          return window.scrollTo(0, (0, _jquery2.default)('#result').position().top);
        }, 500);
      }
    }
  }]);

  return Viewer;
}();

Viewer.initClass();

exports.default = Viewer;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Weather = function () {
  _createClass(Weather, null, [{
    key: 'initClass',
    value: function initClass() {

      this.prototype._ajaxCache = {};

      // ------------------------------------------------------------------------------------

      this.prototype.YAHOO_APPLICATION_ID = 'J17Tyuixg65goAW301d5vBkBWtO9gLQsJnC0Y7OyJJk96wumaSU2U3odNwj5PdIU1A--';

      this.prototype.CITIES = [{ 'title': '道北 稚内', 'code': '011000' }, { 'title': '道北 旭川', 'code': '012010' }, { 'title': '道北 留萌', 'code': '012020' }, { 'title': '道東 網走', 'code': '013010' }, { 'title': '道東 北見', 'code': '013020' }, { 'title': '道東 紋別', 'code': '013030' }, { 'title': '道東 根室', 'code': '014010' }, { 'title': '道東 釧路', 'code': '014020' }, { 'title': '道東 帯広', 'code': '014030' }, { 'title': '道南 室蘭', 'code': '015010' }, { 'title': '道南 浦河', 'code': '015020' }, { 'title': '道央 札幌', 'code': '016010' }, { 'title': '道央 岩見沢', 'code': '016020' }, { 'title': '道央 倶知安', 'code': '016030' }, { 'title': '道南 函館', 'code': '017010' }, { 'title': '道南 江差', 'code': '017020' }, { 'title': '青森 県 青森', 'code': '020010' }, { 'title': '青森県 むつ', 'code': '020020' }, { 'title': '青森県 八戸', 'code': '020030' }, { 'title': '岩手県 盛岡', 'code': '030010' }, { 'title': '岩手県 宮古', 'code': '030020' }, { 'title': '岩手県 大船渡', 'code': '030030' }, { 'title': '宮城県 仙台', 'code': '040010' }, { 'title': '宮城県 白石', 'code': '040020' }, { 'title': '秋田県 秋田', 'code': '050010' }, { 'title': '秋田県 横手', 'code': '050020' }, { 'title': '山形県 山形', 'code': '060010' }, { 'title': '山形県 米沢', 'code': '060020' }, { 'title': '山形県 酒田', 'code': '060030' }, { 'title': '山形県 新庄', 'code': '060040' }, { 'title': '福島県 福島', 'code': '070010' }, { 'title': '福島県 小名浜', 'code': '070020' }, { 'title': '福島県 若松', 'code': '070030' }, { 'title': '茨城県 水戸', 'code': '080010' }, { 'title': '茨城県 土浦', 'code': '080020' }, { 'title': '栃木県 宇都宮', 'code': '090010' }, { 'title': '栃木県 大田原', 'code': '090020' }, { 'title': '群馬県 前橋', 'code': '100010' }, { 'title': '群馬県 みなかみ', 'code': '100020' }, { 'title': '埼玉県 さいたま', 'code': '110010' }, { 'title': '埼玉県 熊谷', 'code': '110020' }, { 'title': '埼玉県 秩父', 'code': '110030' }, { 'title': '千葉県 千葉', 'code': '120010' }, { 'title': '千葉県 銚子', 'code': '120020' }, { 'title': '千葉県 館山', 'code': '120030' }, { 'title': '東京都 東京', 'code': '130010' }, { 'title': '東京都 大島', 'code': '130020' }, { 'title': '東京都 八丈島', 'code': '130030' }, { 'title': '東京都 父島', 'code': '130040' }, { 'title': '神奈川県 横浜', 'code': '140010' }, { 'title': '神奈川県 小田原', 'code': '140020' }, { 'title': '新潟県 新潟', 'code': '150010' }, { 'title': '新潟県 長岡', 'code': '150020' }, { 'title': '新潟県 高田', 'code': '150030' }, { 'title': '新潟県 相川', 'code': '150040' }, { 'title': '富山県 富山', 'code': '160010' }, { 'title': '富山県 伏木', 'code': '160020' }, { 'title': '石川県 金沢', 'code': '170010' }, { 'title': '石川県 輪島', 'code': '170020' }, { 'title': '福井県 福井', 'code': '180010' }, { 'title': '福井県 敦賀', 'code': '180020' }, { 'title': '山梨県 甲府', 'code': '190010' }, { 'title': '山梨県 河口湖', 'code': '190020' }, { 'title': '長野県 長野', 'code': '200010' }, { 'title': '長野県 松本', 'code': '200020' }, { 'title': '長野県 飯田', 'code': '200030' }, { 'title': '岐阜県 岐阜', 'code': '210010' }, { 'title': '岐阜県 高山', 'code': '210020' }, { 'title': '静岡県 静岡', 'code': '220010' }, { 'title': '静岡県 網代', 'code': '220020' }, { 'title': '静岡県 三島', 'code': '220030' }, { 'title': '静岡県 浜松', 'code': '220040' }, { 'title': '愛知県 名古屋', 'code': '230010' }, { 'title': '愛知県 豊橋', 'code': '230020' }, { 'title': '三重県 津', 'code': '240010' }, { 'title': '三重県 尾鷲', 'code': '240020' }, { 'title': '滋賀県 大津', 'code': '250010' }, { 'title': '滋賀県 彦根', 'code': '250020' }, { 'title': '京都府 京都', 'code': '260010' }, { 'title': '京都府 舞鶴', 'code': '260020' }, { 'title': '大阪府 大阪', 'code': '270000' }, { 'title': '兵庫県 神戸', 'code': '280010' }, { 'title': '兵庫県 豊岡', 'code': '280020' }, { 'title': '奈良県 奈良', 'code': '290010' }, { 'title': '奈良県 風屋', 'code': '290020' }, { 'title': '和歌山県 和歌山', 'code': '300010' }, { 'title': '和歌山県 潮岬', 'code': '300020' }, { 'title': '鳥取県 鳥取', 'code': '310010' }, { 'title': '鳥取県 米子', 'code': '310020' }, { 'title': '島根県 松江', 'code': '320010' }, { 'title': '島根県 浜田', 'code': '320020' }, { 'title': '島根県 西郷', 'code': '320030' }, { 'title': '岡山県 岡山', 'code': '330010' }, { 'title': '岡山県 津山', 'code': '330020' }, { 'title': '広島県 広島', 'code': '340010' }, { 'title': '広島県 庄原', 'code': '340020' }, { 'title': '山口県 下関', 'code': '350010' }, { 'title': '山口県 山口', 'code': '350020' }, { 'title': '山口県 柳井', 'code': '350030' }, { 'title': '山口県 萩', 'code': '350040' }, { 'title': '徳島県 徳島', 'code': '360010' }, { 'title': '徳島県 日和佐', 'code': '360020' }, { 'title': '香川県 高松', 'code': '370000' }, { 'title': '愛媛県 松山', 'code': '380010' }, { 'title': '愛媛県 新居浜', 'code': '380020' }, { 'title': '愛媛県 宇和島', 'code': '380030' }, { 'title': '高知県 高知', 'code': '390010' }, { 'title': '高知県 室戸岬', 'code': '390020' }, { 'title': '高知県 清水', 'code': '390030' }, { 'title': '福岡県 福岡', 'code': '400010' }, { 'title': '福岡県 八幡', 'code': '400020' }, { 'title': '福岡県 飯塚', 'code': '400030' }, { 'title': '福岡県 久留米', 'code': '400040' }, { 'title': '佐賀県 佐賀', 'code': '410010' }, { 'title': '佐賀県 伊万里', 'code': '410020' }, { 'title': '長崎県 長崎', 'code': '420010' }, { 'title': '長崎県 佐世保', 'code': '420020' }, { 'title': '長崎県 厳原', 'code': '420030' }, { 'title': '長崎県 福江', 'code': '420040' }, { 'title': '熊本県 熊本', 'code': '430010' }, { 'title': '熊本県 阿蘇乙姫', 'code': '430020' }, { 'title': '熊本県 牛深', 'code': '430030' }, { 'title': '熊本県 人吉', 'code': '430040' }, { 'title': '大分県 大分', 'code': '440010' }, { 'title': '大分県 中津', 'code': '440020' }, { 'title': '大分県 日田', 'code': '440030' }, { 'title': '大分県 佐伯', 'code': '440040' }, { 'title': '宮崎県 宮崎', 'code': '450010' }, { 'title': '宮崎県 延岡', 'code': '450020' }, { 'title': '宮崎県 都城', 'code': '450030' }, { 'title': '宮崎県 高千穂', 'code': '450040' }, { 'title': '鹿児島県 鹿児島', 'code': '460010' }, { 'title': '鹿児島県 鹿屋', 'code': '460020' }, { 'title': '鹿児島県 種子島', 'code': '460030' }, { 'title': '鹿児島県 名瀬', 'code': '460040' }, { 'title': '沖縄県 那覇', 'code': '471010' }, { 'title': '沖縄県 名護', 'code': '471020' }, { 'title': '沖縄県 久米島', 'code': '471030' }, { 'title': '沖縄県 南大東', 'code': '472000' }, { 'title': '沖縄県 宮古島', 'code': '473000' }, { 'title': '沖縄県 石垣島', 'code': '474010' }, { 'title': '沖縄県 与那国島', 'code': '474020' }];
    }
  }]);

  function Weather() {
    _classCallCheck(this, Weather);
  }

  _createClass(Weather, [{
    key: 'getLastCityCode',
    value: function getLastCityCode() {
      return localStorage.city_code;
    }
  }, {
    key: 'setLastCityCode',
    value: function setLastCityCode(city_code) {
      return localStorage.city_code = city_code;
    }
  }, {
    key: 'getCurrentStateCode',
    value: function getCurrentStateCode(callback, failed) {
      var self = this;

      if (!(navigator && navigator.geolocation)) {
        failed();
        return;
      }

      return navigator.geolocation.getCurrentPosition(function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        return self.getStatusCodeFromLatLon(lat, lon, callback, failed);
      }, function () {
        return failed();
      });
    }
  }, {
    key: 'getLastPageId',
    value: function getLastPageId() {
      return localStorage.last_page_id || 'main';
    }
  }, {
    key: 'setLastPageId',
    value: function setLastPageId(last_page_id) {
      return localStorage.last_page_id = last_page_id;
    }
  }, {
    key: 'getStatusCodeFromLatLon',
    value: function getStatusCodeFromLatLon(lat, lon, callback, failed) {
      var self = this;
      var params = $.param({
        lat: lat,
        lon: lon,
        output: 'json',
        appid: self.YAHOO_APPLICATION_ID
      });

      return self._ajaxByProxy('http://reverse.search.olp.yahooapis.jp/OpenLocalPlatform/V1/reverseGeoCoder?' + params, function (res) {
        try {
          var code = res.Feature[0].Property.AddressElement[0].Code;
          return callback(code);
        } catch (error) {
          return failed();
        }
      });
    }
  }, {
    key: 'eachCity',
    value: function eachCity(callback) {
      return _.each(this.CITIES, function (city) {
        return callback(city);
      });
    }
  }, {
    key: 'getCityByCityCode',
    value: function getCityByCityCode(city_code) {
      var found = null;

      this.eachCity(function (city) {
        if (city.code === city_code) {
          return found = city;
        }
      });

      return found;
    }
  }, {
    key: 'getDefaultCityForState',
    value: function getDefaultCityForState(state_code) {
      if (state_code == null) {
        state_code = this.getCurrentStateCode();
      }

      return _.find(this.CITIES, function (city) {
        return city.code.substr(0, 2) === state_code;
      });
    }
  }, {
    key: '_ajaxByProxy',
    value: function _ajaxByProxy(url, callback) {
      var self = this;
      if (self._ajaxCache[url]) {
        callback(self._ajaxCache[url]);
        return;
      }

      $.ajax({
        type: 'GET',
        url: '/proxy/' + encodeURIComponent(url),
        success: function success(res) {
          self._ajaxCache[url] = res;
          return callback(res);
        },
        error: function error() {
          return alert('通信時にエラーが発生しました．時間をおいて試してみてください．');
        }
      });
    }

    // 最新の天気を返します．今日か明日．
    // return: { date description min max }

  }, {
    key: 'getWeatherReportForCity',
    value: function getWeatherReportForCity(city, callback) {
      var city_code = city.code;
      var self = this;
      return self._ajaxByProxy('http://weather.livedoor.com/forecast/webservice/json/v1?city=' + city_code, function (data) {
        var day = void 0;
        var today = data.forecasts[0];
        var tomorrow = data.forecasts[1];

        // なにもなければ明日，ちょっとあったらないところだけ足す
        if (today.temperature.min && today.temperature.max) {
          day = today;
        } else if (today.temperature.min || today.temperature.max) {
          day = today;
          if (day.temperature.min == null) {
            day.temperature.min = tomorrow.temperature.min;
          }
          if (day.temperature.max == null) {
            day.temperature.max = tomorrow.temperature.max;
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
    }
  }]);

  return Weather;
}();

Weather.initClass();

exports.default = Weather;

},{}]},{},[1]);
