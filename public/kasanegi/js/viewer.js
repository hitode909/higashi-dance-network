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
    self.checkCurrentPositionIfNeeded();
    return self.appendTwitterWidget();
  };
  Viewer.prototype.preloadImages = function(callback) {
    var called, count, images;
    callback();
    return;
    images = ["/kasanegi/images/cardigan.png", "/kasanegi/images/coat.png", "/kasanegi/images/day.png", "/kasanegi/images/docodoco_logo.gif", "/kasanegi/images/icon-cardigan.png", "/kasanegi/images/icon-coat.png", "/kasanegi/images/icon-jacket.png", "/kasanegi/images/icon-shirts.png", "/kasanegi/images/icon-sweater.png", "/kasanegi/images/jacket.png", "/kasanegi/images/night.png", "/kasanegi/images/shirts.png", "/kasanegi/images/sweater.png", "/kasanegi/images/tenki_logo.gif"];
    called = false;
    count = 0;
    _.each(images, function(src) {
      var image;
      image = new Image;
      image.src = src;
      return image.onload = function() {
        count++;
        if (count === images.length) {
          if (!called) {
            called = true;
            return callback();
          }
        }
      };
    });
    return setTimeout(function() {
      if (!called) {
        called = true;
        return callback();
      }
    }, 5000);
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
      option.text(city.state_name + " " + city.area_name);
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
    var max, min, self, testWear;
    self = this;
    $('select#city-selector').change(function() {
      return self.printWeather();
    });
    $('#reset-city').click(function() {
      return self.getCurrentPositionAndPrint();
    });
    $(window).bind('hashchange', function() {
      var target_id;
      target_id = location.hash;
      target_id = target_id.replace(/^\#/, '');
      self.selectPage(target_id);
      if (target_id === 'clear') {
        return localStorage.clear();
      }
    });
    testWear = function(min, max) {
      var wear_info;
      wear_info = self.getWearInformationFromMinAndMax(min, max);
      $('#result #comment').text(wear_info.comment);
      self.fillDay($('#result #day-max'), wear_info.daytime);
      return self.fillDay($('#result #day-min'), wear_info.night);
    };
    max = 0;
    min = 0;
    return setInterval(function() {
      if (+$('#test-min').val() !== min || +$('#test-max').val() !== max) {
        min = +$('#test-min').val();
        max = +$('#test-max').val();
        return testWear(min, max);
      }
    }, 1000);
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
      self.setTweetLink("" + city_name + " " + wear_info.comment);
      self.fillDay($('#result #day-max'), wear_info.daytime);
      self.fillDay($('#result #day-min'), wear_info.night);
      return self.checkScroll();
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
    return "" + (+month) + "/" + (+day) + " (" + wod + ")";
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
  Viewer.prototype.checkScroll = function() {
    if (this.weather.getLastPageId() !== 'main') {
      return;
    }
    if (navigator.appVersion.match(/iPhone OS/)) {
      return setTimeout(function() {
        return window.scrollBy(0, $('#result').position().top);
      }, 500);
    }
  };
  Viewer.prototype.HASHTAG = "#重ね着";
  Viewer.prototype.SERVICE_URL = "http://higashi-dance-network.appspot.com/kasanegi/";
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
        min: 100,
        max: 100,
        daytime: [CLOTH_SHIRTS],
        night: [CLOTH_SHIRTS],
        comment: 'シャツ1枚です(とても暑い)'
      }, {
        min: 25,
        max: 25,
        daytime: [CLOTH_SHIRTS],
        night: [CLOTH_SHIRTS],
        comment: 'あ'
      }, {
        min: 18,
        max: 25,
        daytime: [CLOTH_SHIRTS],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN],
        comment: 'あ'
      }, {
        min: 15,
        max: 25,
        daytime: [CLOTH_SHIRTS],
        night: [CLOTH_SHIRTS, CLOTH_JACKET],
        comment: 'あ'
      }, {
        min: 10,
        max: 25,
        daytime: [CLOTH_SHIRTS],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_JACKET],
        comment: 'あ'
      }, {
        min: 18,
        max: 18,
        daytime: [CLOTH_SHIRTS, CLOTH_CARDIGAN],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN],
        comment: 'あ'
      }, {
        min: 15,
        max: 18,
        daytime: [CLOTH_SHIRTS, CLOTH_JACKET],
        night: [CLOTH_SHIRTS, CLOTH_JACKET],
        comment: 'あ'
      }, {
        min: 10,
        max: 18,
        daytime: [CLOTH_SHIRTS, CLOTH_CARDIGAN],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_JACKET],
        comment: 'あ'
      }, {
        min: 7,
        max: 18,
        daytime: [CLOTH_SHIRTS, CLOTH_CARDIGAN],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_COAT],
        comment: 'あ'
      }, {
        min: 5,
        max: 18,
        daytime: [CLOTH_SHIRTS, CLOTH_CARDIGAN],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_COAT, CLOTH_MUFFLER],
        comment: 'あ'
      }, {
        min: 14,
        max: 14,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER],
        comment: '温度差はあまりのでいま体感している温度で問題ないです'
      }, {
        min: 10,
        max: 14,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_JACKET],
        comment: 'あ'
      }, {
        min: 7,
        max: 14,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT],
        comment: 'あ'
      }, {
        min: 5,
        max: 14,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT, CLOTH_MUFFLER],
        comment: 'あ'
      }, {
        min: 10,
        max: 10,
        daytime: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_COAT],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_COAT],
        comment: 'あ'
      }, {
        min: 8,
        max: 10,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT],
        comment: 'あ'
      }, {
        min: 4,
        max: 10,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT, CLOTH_MUFFLER],
        comment: '夜は寒いのでマフラーが要ります，昼はコート'
      }, {
        min: 5,
        max: 5,
        daytime: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_COAT, CLOTH_MUFFLER],
        night: [CLOTH_SHIRTS, CLOTH_CARDIGAN, CLOTH_COAT, CLOTH_MUFFLER],
        comment: 'とても寒いです'
      }, {
        min: 3,
        max: 3,
        daytime: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT, CLOTH_MUFFLER],
        night: [CLOTH_SHIRTS, CLOTH_SWEATER, CLOTH_COAT, CLOTH_MUFFLER],
        comment: '尋常じゃなく寒いです'
      }
    ];
  })();
  return Viewer;
})();