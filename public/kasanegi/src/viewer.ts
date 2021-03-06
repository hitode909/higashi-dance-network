// @flow
import * as $ from "jquery";
import { Weather } from './weather';
import {ClothSet, ClothRules, Cloth} from './ClothRules';

interface Report {
  date: string;
  description: string;
  min: number
  max: number;
}
export class Viewer {
  public readonly SERVICE = '今日の重ね着';
  public readonly HASHTAG = '#重ね着';
  public readonly SERVICE_URL = 'https://higashi-dance-network.appspot.com/kasanegi/';
  public readonly SEARCH_TEXT = 'https://higashi-dance-network.appspot.com/kasanegi/ #重ね着';
  private initAd: boolean;
  public readonly CLOTH_RULES: ClothSet[];
  private tweetMessage: string;

  public readonly weather: Weather;

  constructor(weather: Weather) {
    this.initAd = false;
    this.weather = weather;

    this.CLOTH_RULES=ClothRules;

  }

  public setup() {
    let self = this;
    self.setupCityChanger();
    self.setupEvents();
    self.selectFirstPage();
    return self.checkCurrentPositionIfNeeded();
  }

  public selectFirstPage() {
    if (location.hash) {
      $(window).trigger('hashchange');
      return;
    }

    return this.selectPage('main', true);
  }

  public selectPage(target_id: string, force?: boolean | undefined): void {
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
      $('#help-button').css({ visibility: 'visible' });
      $('#back-to-main').css({ visibility: 'hidden' });
    } else {
      $('#help-button').css({ visibility: 'hidden' });
      $('#back-to-main').css({ visibility: 'visible' });
    }
  }


  public setupCityChanger() {
    let self = this;
    let lastCityName = self.weather.getLastCityName();
    let found = false;

    let select = $('<select>').attr({
      name: 'city',
      id: 'city-selector',
    });

    let label = $('<option>').attr({
      name: 'city',
      value: '地域を選択',
      // disabled: 'disabled',
    });

    label.text('地域を選択');

    select.append(label);

    this.weather.newCities.forEach((city) => {
      let option = $('<option>').attr({
        name: 'city',
        value: city.name,
      });

      option.text(city.name);

      if (!found && city.name === lastCityName) {
        option.attr({
          selected: true,
        });

        found = true;
      }

      return select.append(option);
    });

    let button = $('<button>')
      .attr({
        id: 'reset-city',
      })
      .text('現在位置に設定');

    $('#city-selector-container').append(select);
    $('#city-selector-container').append(button);
  }

  public setupEvents() {
    let self = this;
    $('select#city-selector').change(function() {
      self.hideFirstTimeGuide();
      return self.printWeather();
    });

    $('#reset-city').click(function() {
      self.hideFirstTimeGuide();
      return self.getCurrentPositionAndPrint();
    });

    $(window).bind('hashchange', function() {
      let target_id = location.hash;
      target_id = target_id.replace(/^\#/, '');
      self.selectPage(target_id);
      if (target_id === 'clear') {
        localStorage.clear();
      }

      setTimeout(() => window.scrollTo(0, 0));
    });
    this.setupShareEvents();
  }

  private setupShareEvents() {
    if (!(window.navigator as any).share) return;

    const shareButton = document.querySelector('a#share-tweet');
    if (!shareButton) return;
    shareButton.addEventListener('click', (event: MouseEvent) => {
      event.preventDefault();
      (navigator as any).share({
        title: this.SERVICE,
        text: `${this.tweetMessage} ${this.HASHTAG}`,
        url: this.SERVICE_URL,
      });
    });
  }

  public checkCurrentPositionIfNeeded() {
    let self = this;
    let cityName = $('select#city-selector').val() || '地域を選択';

    if (cityName === '地域を選択') {
      return self.printFirstTimeGuide();
    } else {
      return this.printWeather();
    }
  }

  public printFirstTimeGuide() {
    $('#indicator .message').hide();
    return setTimeout(() => $('#first-time-guide').show(), 500);
  }

  public hideFirstTimeGuide() {
    $('#first-time-guide').hide();
    return $('#indicator .message').show();
  }

  public async getCurrentPositionAndPrint() {
    let self = this;

    $('#indicator').show();
    $('#result').hide();

    try {
      const city = await self.weather.getCurrentCity();
      let cityName = city.name;

      $('#city-selector').val(cityName);

      return self.printWeather();
    } catch (error) {
      console.error(error);
      alert('通信時にエラーが発生しました．時間をおいて試してみてください．');
    }
  }

  // ----- actions -----

  // first day
  public async printWeather() {
    let self = this;

    $('#indicator').show();
    $('#result').hide();
    let selected = $('select#city-selector option:selected');
    let cityName = selected.text();
    let city = this.weather.getCityByCityName(cityName);
    if (city) {
      this.weather.setLastCityName(cityName);
      const report = await this.weather.getWeatherReportForCity(city);
      self.printWeatherResult(cityName, report);
    } else {
      self.printFirstTimeGuide();
    }
  }

  public printWeatherResult(city_name: string, report: {date: string, description: string, min: number, max: number}) {
    let self = this;

    if (!report.description) {
      alert('申し訳ございません，天気を取得できませんでした．時間をおいて試すか，ほかの地域で試してください．');
      return;
    }

    $('#indicator').hide();
    $('#result').show();
    $('#result #area').text(city_name);
    $('#result #date').text(self.convertDate(report.date));
    $('#result #description').text(report.description);
    $('#result #max-temp').text(Math.floor(report.max));
    $('#result #min-temp').text(Math.floor(report.min));
    self.printWeatherIcons(report.description);

    let wear_info = self.getWearInformationFromMinAndMax(report.min, report.max);

    wear_info = self.appendUmbrella(wear_info, report.description);

    let comment = self.dayInfo(report.date) + wear_info.comment;

    $('#result #comment').text(comment);

    self.setTweetLink(`${city_name} ${report.description} ${comment}`, undefined);

    self.fillDay($('#result #day-max'), wear_info.daytime);
    self.fillDay($('#result #day-min'), wear_info.night);

    self.checkScroll();

    if (!this.initAd) {
      try {
        ((window as any).adsbygoogle||[]).push({});
      } catch (ignore) {

      }
      this.initAd = true;
    }
  }

  public formatNumber(value: number, length: number) {
    let all = `00000000000${value}`;
    return all.slice(all.length - length, +all.length + 1 || undefined);
  }

  // 雨なら持ち物に傘を追加
  public appendUmbrella(wear_info: any, description: string) {
    let UMBRELLA = 'umbrella';
    let choise = (list: Array<any>) => list[Math.floor(Math.random() * list.length)];

    if (!description.match(/雨/)) {
      return wear_info;
    }

    wear_info.daytime.push(UMBRELLA);
    wear_info.night.push(UMBRELLA);
    wear_info.comment +=
      ' ' +
      choise([
        '傘もあるといいですね',
        '傘が役立ちます',
        '傘を持って出かけましょう',
        '傘が恋しい一日です',
        '傘持っていきませんか',
        '傘が活躍します',
      ]);

    return wear_info;
  }

  // 2011-11-04 -> 11/4
  public convertDate(date_text: string): string {
    let fragments = date_text.match(/(\d+)/g);
    if (!fragments) {
      return date_text;
    }
    if (fragments.length !== 3) {
      return date_text;
    }

    let year = fragments[0];
    let month = fragments[1];
    let day = fragments[2];

    let date = new Date(+year, +month - 1, +day); // month = 0 ~ 11
    let wod = '日月火水木金土'[date.getDay()];

    return `${+month}/${+day} (${wod})`;
  }

  public dateFromText(date_text: string): Date | undefined {
    let fragments = date_text.match(/(\d+)/g);
    if (!fragments) {
      return;
    }

    let year = fragments[0];
    let month = fragments[1];
    let day = fragments[2];

    return new Date(+year, +month - 1, +day); // month = 0 ~ 11
  }

  // 2011-11-04 -> 今日は or 明日は or 水曜日
  public dayInfo(date_text: string): string {
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
    let today = new Date();

    if (date.getDay() === today.getDay() && date.getDate() === today.getDate()) {
      return '今日は';
    } else if (date.getDay() % 7 === (today.getDay() + 1) % 7 && date.getDate() === today.getDate() + 1) {
      return '明日は';
    }

    let wod = '日月火水木金土'[date.getDay()];
    return `${date.getDate()}日(${wod}曜日)は`;
  }

  public fillDay(target: JQuery, wears: Cloth[]) {
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

    $('<img>')
      .attr({
        src: bg_path,
        intrinsicsize: "309x480",
      })
      .appendTo(image_container);

    wears.forEach(wear_name => {
      // XXX: 傘だけはアイコン出さない．縦2列になって見た目も悪い．
      if (wear_name !== 'umbrella') {
        $('<img>')
          .attr({
            src: `images/icon-${wear_name}.png`,
            title: self.getWearName(wear_name),
            intrinsicsize: "72x72",
          })
          .appendTo(icons_container);
      }

      $('<img>')
        .attr({
          src: `images/${wear_name}.png`,
          title: self.getWearName(wear_name),
          intrinsicsize: "309x480",
        })
        .appendTo(image_container);
    });
  }

  public getWearName(wear: Cloth): string {
    let table = {
      halfshirts: '半袖シャツ',
      shirts: 'シャツ',
      cardigan: 'カーディガン',
      sweater: 'セーター',
      jacket: 'ジャケット',
      coat: 'コート',
      muffler: 'マフラー',
      umbrella: '傘', // ここに傘がくることはないはず
    };

    return table[wear];
  }

  public printWeatherIcons(text: string) {
    let container = $('#weather-icons');

    container.empty();

    text = text.replace(/\(.*\)/, '');
    let matched = text.match(/(晴|雷雨|雪|雨|雷|曇|雲|霧|)/g);

    if (!matched) return;

    matched.forEach((code) => {
      let rule: {[key: string]: string} = {
        晴: 'images/weather-sunny.png',
        雨: 'images/weather-rain.png',
        雷: 'images/weather-thunder.png',
        雪: 'images/weather-snow.png',
        曇: 'images/weather-cloudy.png',
        雲: 'images/weather-cloudy.png',
        霧: 'images/weather-mist.png',
        雷雨: 'images/weather-thunderstorm.png',
      };

      let image_path: string  = rule[code];
      if (!image_path) {
        return;
      }

      $('<img>')
        .attr({
          src: image_path,
          title: code,
          intrinsicsize: "84x84",
        })
        .appendTo(container);
    });
  }

  // return { daytime: [image_pathes] night: [image_pathes] message: text }
  public getWearInformationFromMinAndMax(min: number, max: number): ClothSet {
    // あらかじめ決められたペアから一番近いのを探してきます

    let rules = this.CLOTH_RULES;
    let selected: null | ClothSet = null;
    let distance: null | number  = null;

    //       .  point 2
    //
    // .  point 1
    let getDistance = function(x1: number, x2: number, y1: number, y2: number) {
      if (x1 <= x2 && y1 <= y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
      } else {
        return 100000;
      }
    };

    rules.forEach((rule) => {
      let distance_now = getDistance(min, rule.min, max, rule.max);
      if (!selected || !distance || distance_now < distance) {
        selected = rule;
        distance = distance_now;
      }
    });

    // 傘をくっつけることもあるのでコピーして返す
    return JSON.parse(JSON.stringify(selected));
  }

  public setTweetLink(message: string, hashtag: string|undefined) {
    if (!message) {
      message = '3枚です';
    }
    this.tweetMessage = message;
    if (!hashtag) {
      hashtag = this.HASHTAG;
    }
    let url = this.SERVICE_URL;
    let text = `${message} ${hashtag}`;
    let share_url = `https://twitter.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    $('a#share-tweet').attr({
      href: share_url,
    });
  }

  public setPageButton(target_id: string): void {
    $('.page-changer.selected').removeClass('selected');
    $(`#${target_id}-selector`).addClass('selected');
  }

  public checkScroll() {
    if (this.weather.getLastPageId() !== 'main') {
      return;
    }
    if (navigator.appVersion.match(/iPhone OS/)) {
      return setTimeout(() => window.scrollTo(0, $('#result').position().top), 500);
    }
  }
}