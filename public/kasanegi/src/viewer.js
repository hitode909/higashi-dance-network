// @flow

import _ from 'underscore';
import $ from 'jquery';
import Weather from './weather';

type Cloth = 'halfshirts' | 'shirts' | 'cardigan' | 'sweater' | 'jacket' | 'coat' | 'muffler' | 'umbrella';

type ClothSet = {
  min: number,
  max: number,
  daytime: Array<Cloth>;
  night: Array<Cloth>;
  comment: string,
}

class Viewer {
  HASHTAG: string;
  SERVICE_URL: string;
  SEARCH_TEXT: string;
  CLOTH_RULES: Array<ClothSet>
  weather: Weather;

  static initClass() {

    // ----- constants -----
    this.prototype.HASHTAG = '#重ね着';
    this.prototype.SERVICE_URL = 'https://higashi-dance-network.appspot.com/kasanegi/';
    this.prototype.SEARCH_TEXT = 'https://higashi-dance-network.appspot.com/kasanegi/ #重ね着';

    this.prototype.CLOTH_RULES = (function() {
      let CLOTH_HALF_SHIRTS   = 'halfshirts';
      let CLOTH_SHIRTS   = 'shirts';
      let CLOTH_CARDIGAN = 'cardigan';
      let CLOTH_SWEATER  = 'sweater';
      let CLOTH_JACKET   = 'jacket';
      let CLOTH_COAT     = 'coat';
      let CLOTH_MUFFLER  = 'muffler';

      return [
        // エラー対策
        {
          min: 100,
          max: 100,
          daytime: [
            CLOTH_HALF_SHIRTS
          ],
          night: [
            CLOTH_HALF_SHIRTS
          ],
          comment: '異常な暑さです'
        },

        {
          min: 50,
          max: 50,
          daytime: [
            CLOTH_HALF_SHIRTS
          ],
          night: [
            CLOTH_HALF_SHIRTS
          ],
          comment: '暑いので半袖で出かけましょう'
        },

        {
          min: 35,
          max: 35,
          daytime: [
            CLOTH_SHIRTS
          ],
          night: [
            CLOTH_SHIRTS
          ],
          comment: '暖かくていい天気なのでシャツ一枚で大丈夫です'
        },
        {
          min: 34,
          max: 34,
          daytime: [
            CLOTH_SHIRTS
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_CARDIGAN
          ],
          comment: '昼は暑く夜はカーディガンがあればいいくらいです'
        },
        {
          min: 15,
          max: 25,
          daytime: [
            CLOTH_SHIRTS
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_JACKET
          ],
          comment: '少し冷えるのでジャケットを着ましょう'
        },
        {
          min: 10,
          max: 25,
          daytime: [
            CLOTH_SHIRTS
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_CARDIGAN,
            CLOTH_JACKET
          ],
          comment: '冷えるのでカーディガンとジャケットを着ましょう'
        },
        {
          min: 7,
          max: 25,
          daytime: [
            CLOTH_SHIRTS
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_CARDIGAN,
            CLOTH_COAT
          ],
          comment: '冷えるのでカーディガンとコートを着ましょう'
        },
        {
          min: 5,
          max: 25,
          daytime: [
            CLOTH_SHIRTS
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_CARDIGAN,
            CLOTH_COAT,
            CLOTH_MUFFLER
          ],
          comment: 'すごく冷えるのでカーディガンとコートとマフラーを着ましょう'
        },

        {
          min: 18,
          max: 18,
          daytime: [
            CLOTH_SHIRTS,
            CLOTH_CARDIGAN
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_CARDIGAN
          ],
          comment: '一日肌寒いのでカーディガンです'
        },
        {
          min: 15,
          max: 18,
          daytime: [
            CLOTH_SHIRTS,
            CLOTH_JACKET
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_JACKET
          ],
          comment: '朝晩冷えるので一日ジャケットです'
        },
        {
          min: 10,
          max: 18,
          daytime: [
            CLOTH_SHIRTS,
            CLOTH_CARDIGAN
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_CARDIGAN,
            CLOTH_JACKET
          ],
          comment: 'カーディガンにジャケットを羽織ります'
        },
        {
          min: 7,
          max: 18,
          daytime: [
            CLOTH_SHIRTS,
            CLOTH_CARDIGAN
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_CARDIGAN,
            CLOTH_COAT
          ],
          comment: 'カーディガンにコートを羽織ります'
        },
        {
          min: 5,
          max: 18,
          daytime: [
            CLOTH_SHIRTS,
            CLOTH_CARDIGAN
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_CARDIGAN,
            CLOTH_COAT,
            CLOTH_MUFFLER
          ],
          comment: '夜は寒いのでコートにマフラーがいいです'
        },

        {
          min: 14,
          max: 14,
          daytime: [
            CLOTH_SHIRTS,
            CLOTH_SWEATER
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_SWEATER
          ],
          comment: '一日冷えるのでセーターです'
        },
        {
          min: 10,
          max: 14,
          daytime: [
            CLOTH_SHIRTS,
            CLOTH_SWEATER
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_SWEATER,
            CLOTH_JACKET
          ],
          comment: 'セーターにジャケットを羽織ります'
        },
        {
          min: 7,
          max: 14,
          daytime: [
            CLOTH_SHIRTS,
            CLOTH_SWEATER
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_SWEATER,
            CLOTH_COAT
          ],
          comment: 'もこもこセーターにコート羽織って出かけましょう'
        },
        {
          min: 5,
          max: 14,
          daytime: [
            CLOTH_SHIRTS,
            CLOTH_SWEATER
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_SWEATER,
            CLOTH_COAT,
            CLOTH_MUFFLER
          ],
          comment: '夜は冷え込むのでたくさん着ていきましょう'
        },

        {
          min: 12,
          max: 12,
          daytime: [
            CLOTH_SHIRTS,
            CLOTH_CARDIGAN,
            CLOTH_COAT
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_CARDIGAN,
            CLOTH_COAT
          ],
          comment: '一日少し寒いのでカーディガンとコートを着ましょう'
        },
        {
          min: 8,
          max: 12,
          daytime: [
            CLOTH_SHIRTS,
            CLOTH_SWEATER,
            CLOTH_COAT
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_SWEATER,
            CLOTH_COAT
          ],
          comment: '一日寒いのでセータとコートを着ましょう'
        },
        {
          min: 5,
          max: 12,
          daytime: [
            CLOTH_SHIRTS,
            CLOTH_SWEATER,
            CLOTH_COAT
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_SWEATER,
            CLOTH_COAT,
            CLOTH_MUFFLER
          ],
          comment: '一日寒いので昼でもコート夜はマフラーです'
        },

        {
          min: 5,
          max: 5,
          daytime: [
            CLOTH_SHIRTS,
            CLOTH_SWEATER,
            CLOTH_COAT,
            CLOTH_MUFFLER
          ],
          night: [
            CLOTH_SHIRTS,
            CLOTH_SWEATER,
            CLOTH_COAT,
            CLOTH_MUFFLER
          ],
          comment: 'すごく寒いので一日マフラーが手放せません'
        }

      ];
    })();
  }
  constructor(weather: Weather) {
    this.weather = weather;
  }

  setup() {
    let self = this;
    self.setupCityChanger();
    self.setupEvents();
    self.selectFirstPage();
    return self.checkCurrentPositionIfNeeded();
  }

  selectFirstPage() {
    if (location.hash) {
      $(window).trigger('hashchange');
      return;
    }

    let page_id = this.weather.getLastPageId();
    return this.selectPage(page_id, true);
  }

  selectPage(target_id: string, force: ?boolean) {
    if (!force && (target_id === this.weather.getLastPageId)) {
      // do nothing
      return;
    }

    this.setPageButton(target_id);
    let target_page = $(document.body).find(`#${target_id}-page`);
    if (target_page.length === 0) {
      target_id = 'main';
      target_page = $(document.body).find(`#${target_id}-page`);
    }
    this.weather.setLastPageId(target_id);

    $('.page').hide();
    target_page.show();

    if (target_id === 'main') {
      $('#help-button').show();
      return $('#back-to-main').hide();
    } else {
      $('#help-button').hide();
      return $('#back-to-main').show();
    }
  }


  setupCityChanger() {
    let self = this;
    let lat_state_code = self.weather.getLastCityCode();
    let found = false;

    let select = $('<select>').attr({
      name: 'city',
      id: 'city-selector'
    });

    let label = $('<option>').attr({
      name: 'city',
      value: -1,
      disabled: 'disabled'
    });

    label.text('地域を選択');

    select.append(label);

    this.weather.eachCity(function(city) {
      let option = $('<option>').attr({
        name: 'city',
        value: city.code
      });
      option.text(city.title);

      if (!found && (city.code === lat_state_code)) {
        option.attr({
          selected: true});

        found = true;
      }

      return select.append(option);
    });

    let button = $('<button>').attr({
      id: 'reset-city'})
    .text('現在位置に設定');

    $('#city-selector-container').append(select);
    $('#city-selector-container').append(button);

    if (!found) {
      let tokyo = '130010';
      select.val(tokyo);
      return this.weather.setLastCityCode(tokyo);
    }
  }

  setupEvents() {
    let self = this;
    $('select#city-selector').change(function() {
      self.hideFirstTimeGuide();
      return self.printWeather();
    });

    $('#reset-city').click(function() {
      self.hideFirstTimeGuide();
      return self.getCurrentPositionAndPrint();
    });

    return $(window).bind('hashchange', function() {
      let target_id = location.hash;
      target_id = target_id.replace(/^\#/, '');
      self.selectPage(target_id);
      if (target_id === 'clear') {
        localStorage.clear();
      }

      return setTimeout(() => window.scrollTo(0, 0));
    });
  }

  checkCurrentPositionIfNeeded() {
    let self = this;
    let city_code = $('select#city-selector').val();

    // 地域を選択 = -1
    if (+city_code === -1) {
      return self.printFirstTimeGuide();
    } else {
      return this.printWeather();
    }
  }

  printFirstTimeGuide() {
    $('#indicator .message').hide();
    return setTimeout(() => $('#first-time-guide').show()
    ,500);
  }

  hideFirstTimeGuide() {
    $('#first-time-guide').hide();
    return $('#indicator .message').show();
  }

  getCurrentPositionAndPrint() {
    let self = this;

    $('#indicator').show();
    $('#result').hide();

    return self.weather.getCurrentStateCode(function(state_code) {
      let city = self.weather.getDefaultCityForState(state_code);
      let city_code = city.code;

      let option = $(`option[value=${city_code}]`);
      option.attr({
        selected: 'selected'});

      return self.printWeather();
    }
    , () => $('#reset-city').remove());
  }

  // ----- actions -----

  // first day
  printWeather() {
    let self = this;

    $('#indicator').show();
    $('#result').hide();
    let selected = $('select#city-selector option:selected');
    let city_code = selected.val();
    let city_name = selected.text();
    let city = this.weather.getCityByCityCode(city_code);
    this.weather.setLastCityCode(city_code);

    return this.weather.getWeatherReportForCity(city, report => self.printWeatherResult(city_name, report));
  }

  printWeatherResult(city_name: string, report: Object) {
    let self = this;

    if ((report.min === '') || (report.max === '')) {
      alert('申し訳ございません，天気を取得できませんでした．時間をおいて試すか，ほかの地域で試してください．');
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

    let wear_info = self.getWearInformationFromMinAndMax(report.min, report.max);

    wear_info = self.appendUmbrella(wear_info, report.description);

    let comment = self.dayInfo(report.date) + wear_info.comment;

    $('#result #comment').text(comment);

    self.setTweetLink(`${city_name} ${report.description} ${comment}`);

    self.fillDay($('#result #day-max'), wear_info.daytime);
    self.fillDay($('#result #day-min'), wear_info.night);

    return self.checkScroll();
  }

  formatNumber(value: number, length: number) {
    let all = `00000000000${value}`;
    return all.slice(all.length - length , + all.length + 1 || undefined);
  }

  // 雨なら持ち物に傘を追加
  appendUmbrella(wear_info: Object, description: string) {
    let UMBRELLA = 'umbrella';
    let choise = list => list[Math.floor(Math.random() * list.length)];

    if (!description.match(/雨/)) { return wear_info; }

    wear_info.daytime.push(UMBRELLA);
    wear_info.night.push(UMBRELLA);
    wear_info.comment += ' ' + choise([
      '傘もあるといいですね',
      '傘が役立ちます',
      '傘を持って出かけましょう',
      '傘が恋しい一日です',
      '傘持っていきませんか',
      '傘が活躍します'
    ]);

    return wear_info;
  }

  // 2011-11-04 -> 11/4
  convertDate(date_text: string): string {
    let fragments = date_text.match(/(\d+)/g);
    if (!fragments) {
      return date_text;
    }
    if (fragments.length !== 3) {
      return date_text;
    }

    let year  = fragments[0];
    let month = fragments[1];
    let day   = fragments[2];

    let date = new Date(+year, +month-1, +day); // month = 0 ~ 11
    let wod = '日月火水木金土'[date.getDay()];

    return `${+ month}/${+ day} (${wod})`;
  }

  dateFromText(date_text: string): ?Date {
    let fragments = date_text.match(/(\d+)/g);
    if (!fragments) {
      return;
    }

    let year  = fragments[0];
    let month = fragments[1];
    let day   = fragments[2];

    return new Date(+year, +month-1, +day); // month = 0 ~ 11
  }

  // 2011-11-04 -> 今日は or 明日は or 水曜日
  dayInfo(date_text: string): string {
    let self = this;

    let fragments = date_text.match(/(\d+)/g);

    if (!fragments) {
      return '今日は';
    }
    if (fragments.length !== 3) {
      return '今日は';
    }

    let date = self.dateFromText(date_text);
    if (!date) {
      throw 'failed to handle dayInfo';
    }
    let today = new Date;

    if ((date.getDay() === today.getDay()) && (date.getDate() === today.getDate())) {
      return '今日は';
    } else if (((date.getDay() % 7) === ((today.getDay() + 1) % 7)) && (date.getDate() === (today.getDate() + 1))) {
      return '明日は';
    }

    let wod = '日月火水木金土'[date.getDay()];
    return `${date.getDate()}日(${wod}曜日)は`;
  }

  fillDay(target: JQuery, wears: Array<Cloth>) {
    let self = this;
    let image_container = target.find('.wear-image');
    let icons_container = target.find('.wear-icons');

    icons_container.empty();
    image_container.empty();

    let bg_path = null;
    if (target.attr('id') === 'day-max') {
      bg_path = 'images/day.png';
    } else {
      bg_path = 'images/night.png';
    }

    $('<img>').attr({
      src: bg_path})
    .appendTo(image_container);

    return _.each(wears, function(wear_name) {
      // XXX: 傘だけはアイコン出さない．縦2列になって見た目も悪い．
      if (wear_name !== 'umbrella') {
        $('<img>').attr({
          src: `images/icon-${wear_name}.png`,
          title: self.getWearName(wear_name)}).appendTo(icons_container);
      }

      $('<img>').attr({
        src: `images/${wear_name}.png`,
        title: self.getWearName(wear_name)}).appendTo(image_container);
    });
  }


  getWearName(wear: Cloth): string {
    let table = {
      halfshirts: '半袖シャツ',
      shirts:   'シャツ',
      cardigan: 'カーディガン',
      sweater:  'セーター',
      jacket:  'ジャケット',
      coat:     'コート',
      muffler:  'マフラー',
      umbrella: '傘', // ここに傘がくることはないはず
    };

    return table[wear];
  }

  printWeatherIcons(text: string) {
    let container = $('#weather-icons');

    container.empty();

    text = text.replace(/\(.*\)/, '');
    let matched = text.match(/(晴|雷雨|雪|雨|雷|曇|霧|)/g);

    if (!matched) return;

    return _.each(matched, function(code) {
      let rule = {
        '晴':   'images/weather-sunny.png',
        '雨':   'images/weather-rain.png',
        '雷':   'images/weather-thunder.png',
        '雪':   'images/weather-snow.png',
        '曇':   'images/weather-cloudy.png',
        '霧':   'images/weather-mist.png',
        '雷雨': 'images/weather-thunderstorm.png'
      };

      let image_path = rule[code];
      if (!image_path) { return; }

      $('<img>').attr({
        src: image_path,
        title: code}).appendTo(container);
    });
  }

  // return { daytime: [image_pathes] night: [image_pathes] message: text }
  getWearInformationFromMinAndMax(min: number, max: number): ClothSet {
    // あらかじめ決められたペアから一番近いのを探してきます

    let rules = this.CLOTH_RULES;
    let selected = null;
    let distance = null;

    //       .  point 2
    //
    // .  point 1
    let getDistance = function(x1, x2, y1, y2) {
      if ((x1 <= x2) && (y1 <= y2)) {
        return Math.sqrt( ((x1-x2)*(x1-x2)) + ((y1-y2)*(y1-y2)));
      } else {
        return 100000;
      }
    };

    _.each(rules, function(rule) {
      let distance_now = getDistance(min, rule.min, max, rule.max);
      if (!selected || !distance || (distance_now < distance)) {
        selected = rule;
        distance = distance_now;
      }
    });

    // 傘をくっつけることもあるのでコピーして返す
    return JSON.parse(JSON.stringify(selected));
  }

  setTweetLink(message: string, hashtag: ?string) {
    if (message == null) { message = '3枚です'; }
    if (hashtag == null) { hashtag = this.HASHTAG; }
    let url = this.SERVICE_URL;
    let text = `${message} ${hashtag}`;
    let share_url = `https://twitter.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    $('a#share-tweet').attr({
      href: share_url});
  }

  setPageButton(target_id: string): void {
    $('.page-changer.selected').removeClass('selected');
    $(`#${target_id}-selector`).addClass('selected');
  }

  checkScroll() {
    if (this.weather.getLastPageId() !== 'main') {
      return;
    }
    if (navigator.appVersion.match(/iPhone OS/)) {
      return setTimeout(() => window.scrollTo(0, $('#result').position().top)
      ,500);
    }
  }
}
Viewer.initClass();

export default Viewer;
