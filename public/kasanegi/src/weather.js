// @flow

import _ from 'underscore';

type City = {
  title: string;
  code: string;
};

class Weather {
  YAHOO_APPLICATION_ID: string;
  CITIES: Array<City>;

  static initClass() {
  // ------------------------------------------------------------------------------------

    this.prototype.YAHOO_APPLICATION_ID = 'J17Tyuixg65goAW301d5vBkBWtO9gLQsJnC0Y7OyJJk96wumaSU2U3odNwj5PdIU1A--';

    this.prototype.CITIES = [{'title':'道北 稚内','code':'011000'},{'title':'道北 旭川','code':'012010'},{'title':'道北 留萌','code':'012020'},{'title':'道東 網走','code':'013010'},{'title':'道東 北見','code':'013020'},{'title':'道東 紋別','code':'013030'},{'title':'道東 根室','code':'014010'},{'title':'道東 釧路','code':'014020'},{'title':'道東 帯広','code':'014030'},{'title':'道南 室蘭','code':'015010'},{'title':'道南 浦河','code':'015020'},{'title':'道央 札幌','code':'016010'},{'title':'道央 岩見沢','code':'016020'},{'title':'道央 倶知安','code':'016030'},{'title':'道南 函館','code':'017010'},{'title':'道南 江差','code':'017020'},{'title':'青森 県 青森','code':'020010'},{'title':'青森県 むつ','code':'020020'},{'title':'青森県 八戸','code':'020030'},{'title':'岩手県 盛岡','code':'030010'},{'title':'岩手県 宮古','code':'030020'},{'title':'岩手県 大船渡','code':'030030'},{'title':'宮城県 仙台','code':'040010'},{'title':'宮城県 白石','code':'040020'},{'title':'秋田県 秋田','code':'050010'},{'title':'秋田県 横手','code':'050020'},{'title':'山形県 山形','code':'060010'},{'title':'山形県 米沢','code':'060020'},{'title':'山形県 酒田','code':'060030'},{'title':'山形県 新庄','code':'060040'},{'title':'福島県 福島','code':'070010'},{'title':'福島県 小名浜','code':'070020'},{'title':'福島県 若松','code':'070030'},{'title':'茨城県 水戸','code':'080010'},{'title':'茨城県 土浦','code':'080020'},{'title':'栃木県 宇都宮','code':'090010'},{'title':'栃木県 大田原','code':'090020'},{'title':'群馬県 前橋','code':'100010'},{'title':'群馬県 みなかみ','code':'100020'},{'title':'埼玉県 さいたま','code':'110010'},{'title':'埼玉県 熊谷','code':'110020'},{'title':'埼玉県 秩父','code':'110030'},{'title':'千葉県 千葉','code':'120010'},{'title':'千葉県 銚子','code':'120020'},{'title':'千葉県 館山','code':'120030'},{'title':'東京都 東京','code':'130010'},{'title':'東京都 大島','code':'130020'},{'title':'東京都 八丈島','code':'130030'},{'title':'東京都 父島','code':'130040'},{'title':'神奈川県 横浜','code':'140010'},{'title':'神奈川県 小田原','code':'140020'},{'title':'新潟県 新潟','code':'150010'},{'title':'新潟県 長岡','code':'150020'},{'title':'新潟県 高田','code':'150030'},{'title':'新潟県 相川','code':'150040'},{'title':'富山県 富山','code':'160010'},{'title':'富山県 伏木','code':'160020'},{'title':'石川県 金沢','code':'170010'},{'title':'石川県 輪島','code':'170020'},{'title':'福井県 福井','code':'180010'},{'title':'福井県 敦賀','code':'180020'},{'title':'山梨県 甲府','code':'190010'},{'title':'山梨県 河口湖','code':'190020'},{'title':'長野県 長野','code':'200010'},{'title':'長野県 松本','code':'200020'},{'title':'長野県 飯田','code':'200030'},{'title':'岐阜県 岐阜','code':'210010'},{'title':'岐阜県 高山','code':'210020'},{'title':'静岡県 静岡','code':'220010'},{'title':'静岡県 網代','code':'220020'},{'title':'静岡県 三島','code':'220030'},{'title':'静岡県 浜松','code':'220040'},{'title':'愛知県 名古屋','code':'230010'},{'title':'愛知県 豊橋','code':'230020'},{'title':'三重県 津','code':'240010'},{'title':'三重県 尾鷲','code':'240020'},{'title':'滋賀県 大津','code':'250010'},{'title':'滋賀県 彦根','code':'250020'},{'title':'京都府 京都','code':'260010'},{'title':'京都府 舞鶴','code':'260020'},{'title':'大阪府 大阪','code':'270000'},{'title':'兵庫県 神戸','code':'280010'},{'title':'兵庫県 豊岡','code':'280020'},{'title':'奈良県 奈良','code':'290010'},{'title':'奈良県 風屋','code':'290020'},{'title':'和歌山県 和歌山','code':'300010'},{'title':'和歌山県 潮岬','code':'300020'},{'title':'鳥取県 鳥取','code':'310010'},{'title':'鳥取県 米子','code':'310020'},{'title':'島根県 松江','code':'320010'},{'title':'島根県 浜田','code':'320020'},{'title':'島根県 西郷','code':'320030'},{'title':'岡山県 岡山','code':'330010'},{'title':'岡山県 津山','code':'330020'},{'title':'広島県 広島','code':'340010'},{'title':'広島県 庄原','code':'340020'},{'title':'山口県 下関','code':'350010'},{'title':'山口県 山口','code':'350020'},{'title':'山口県 柳井','code':'350030'},{'title':'山口県 萩','code':'350040'},{'title':'徳島県 徳島','code':'360010'},{'title':'徳島県 日和佐','code':'360020'},{'title':'香川県 高松','code':'370000'},{'title':'愛媛県 松山','code':'380010'},{'title':'愛媛県 新居浜','code':'380020'},{'title':'愛媛県 宇和島','code':'380030'},{'title':'高知県 高知','code':'390010'},{'title':'高知県 室戸岬','code':'390020'},{'title':'高知県 清水','code':'390030'},{'title':'福岡県 福岡','code':'400010'},{'title':'福岡県 八幡','code':'400020'},{'title':'福岡県 飯塚','code':'400030'},{'title':'福岡県 久留米','code':'400040'},{'title':'佐賀県 佐賀','code':'410010'},{'title':'佐賀県 伊万里','code':'410020'},{'title':'長崎県 長崎','code':'420010'},{'title':'長崎県 佐世保','code':'420020'},{'title':'長崎県 厳原','code':'420030'},{'title':'長崎県 福江','code':'420040'},{'title':'熊本県 熊本','code':'430010'},{'title':'熊本県 阿蘇乙姫','code':'430020'},{'title':'熊本県 牛深','code':'430030'},{'title':'熊本県 人吉','code':'430040'},{'title':'大分県 大分','code':'440010'},{'title':'大分県 中津','code':'440020'},{'title':'大分県 日田','code':'440030'},{'title':'大分県 佐伯','code':'440040'},{'title':'宮崎県 宮崎','code':'450010'},{'title':'宮崎県 延岡','code':'450020'},{'title':'宮崎県 都城','code':'450030'},{'title':'宮崎県 高千穂','code':'450040'},{'title':'鹿児島県 鹿児島','code':'460010'},{'title':'鹿児島県 鹿屋','code':'460020'},{'title':'鹿児島県 種子島','code':'460030'},{'title':'鹿児島県 名瀬','code':'460040'},{'title':'沖縄県 那覇','code':'471010'},{'title':'沖縄県 名護','code':'471020'},{'title':'沖縄県 久米島','code':'471030'},{'title':'沖縄県 南大東','code':'472000'},{'title':'沖縄県 宮古島','code':'473000'},{'title':'沖縄県 石垣島','code':'474010'},{'title':'沖縄県 与那国島','code':'474020'}];
  }
  constructor() {}

  getLastCityCode(): ?string {
    return localStorage.getItem('city_code');
  }

  setLastCityCode(city_code: string): void {
    return localStorage.setItem('city_code', city_code);
  }

  getCurrentStateCode(callback: Function, failed: Function): void {
    let self = this;

    if (!(navigator && navigator.geolocation)) {
      failed();
      return;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;
      return self.getStatusCodeFromLatLon(lat, lon, callback, failed);
    }
    , () => failed());
  }

  getLastPageId(): string {
    return localStorage.getItem('last_page_id') || 'main';
  }

  setLastPageId(last_page_id: string){
    return localStorage.setItem('last_page_id', last_page_id);
  }

  getStatusCodeFromLatLon(lat: number, lon: number, callback: Function, failed: Function): void {
    let self = this;
    let params = $.param({
      lat,
      lon,
      output: 'json',
      appid: self.YAHOO_APPLICATION_ID
    });

    self._ajaxByProxy(`http://reverse.search.olp.yahooapis.jp/OpenLocalPlatform/V1/reverseGeoCoder?${params}`, function(res) {
      try {
        let code = res.Feature[0].Property.AddressElement[0].Code;
        return callback(code);
      } catch (error) {
        return failed();
      }
    });
  }

  eachCity(callback: Function) {
    return _.each(this.CITIES, city => callback(city));
  }

  getCityByCityCode(city_code: string): City {
    let found = null;

    this.eachCity(function(city) {
      if (city.code === city_code) { return found = city; }
    });
    if (!found) {
      throw `Unexpected city_code: ${city_code}`;
    }

    return found;
  }

  getDefaultCityForState(state_code: string): City {
    const city = _.find(this.CITIES, city => city.code.substr(0, 2) === state_code);
    if (!city) {
      throw `Unexpected state_code: ${state_code}`;
    }
    return city;
  }

  _ajaxByProxy(url: string, callback: Function) {
    $.ajax({
      type: 'GET',
      url: `/proxy/${encodeURIComponent(url)}`,
    }).then((res) => {
      callback(res);
    }).fail(() => {
      alert('通信時にエラーが発生しました．時間をおいて試してみてください．');
    });
  }

  // 最新の天気を返します．今日か明日．
  // return: { date description min max }
  getWeatherReportForCity(city: City, callback: Function) {
    let city_code = city.code;
    let self = this;
    self._ajaxByProxy(`http://weather.livedoor.com/forecast/webservice/json/v1?city=${ city_code }`, function(data) {
      let day;
      let today = data.forecasts[0];
      let tomorrow = data.forecasts[1];

      // なにもなければ明日，ちょっとあったらないところだけ足す
      if (today.temperature.min && today.temperature.max) {
        day = today;
      } else if (today.temperature.min || today.temperature.max) {
        day = today;
        if (day.temperature.min == null) { day.temperature.min = tomorrow.temperature.min; }
        if (day.temperature.max == null) { day.temperature.max = tomorrow.temperature.max; }
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
}
Weather.initClass();

export default Weather;
