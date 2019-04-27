import * as $ from "jquery";
import {Cities} from "./Cities";

interface City {
  title: string;
  code: string;
}

interface Report {
  date: string;
  description: string;
  min: number
  max: number;
}
class Weather {
  readonly YAHOO_APPLICATION_ID = 'J17Tyuixg65goAW301d5vBkBWtO9gLQsJnC0Y7OyJJk96wumaSU2U3odNwj5PdIU1A--';
  readonly CITIES: Array<City> = Cities;

  public getLastCityCode() {
    return localStorage.getItem('city_code');
  }

  public setLastCityCode(city_code: string): void {
    return localStorage.setItem('city_code', city_code);
  }

  public getCurrentStateCode(callback: Function, failed: Function): void {
    let self = this;

    if (!(navigator && navigator.geolocation)) {
      failed();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function(position) {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        return self.getStatusCodeFromLatLon(lat, lon, callback, failed);
      },
      () => failed(),
    );
  }

  public getLastPageId(): string {
    return localStorage.getItem('last_page_id') || 'main';
  }

  public setLastPageId(last_page_id: string) {
    return localStorage.setItem('last_page_id', last_page_id);
  }

  public getStatusCodeFromLatLon(lat: number, lon: number, callback: Function, failed: Function): void {
    let self = this;
    let params = $.param({
      lat,
      lon,
      output: 'json',
      appid: self.YAHOO_APPLICATION_ID,
    });

    self.ajaxByProxy(`http://reverse.search.olp.yahooapis.jp/OpenLocalPlatform/V1/reverseGeoCoder?${params}`, function(
      res: any,
    ) {
      try {
        let code = res.Feature[0].Property.AddressElement[0].Code;
        return callback(code);
      } catch (error) {
        return failed();
      }
    });
  }

  public getCityByCityCode(city_code: string): City {
    let found = null;

    this.CITIES.forEach((city) => {
      if (city.code === city_code) {
        return (found = city);
      }
    });
    if (!found) {
      throw `Unexpected city_code: ${city_code}`;
    }

    return found;
  }

  public getDefaultCityForState(state_code: string): City {
    for (let i = 0; i < this.CITIES.length; i++) {
      const city = this.CITIES[i];
      if (city.code.substr(0, 2) === state_code) {
        return city;
      }
    }
    throw `Unexpected state_code: ${state_code}`;
  }

  private ajaxByProxy(url: string, callback: Function) {
    $.ajax({
      type: 'GET',
      url: `/proxy/${encodeURIComponent(url)}`,
      dataType: 'json',
    })
      .then((res) => {
        callback(res);
      })
      // .fail(() => {
      //   alert('通信時にエラーが発生しました．時間をおいて試してみてください．');
      // });
  }

  // 最新の天気を返します．今日か明日．
  // return: { date description min max }
  public getWeatherReportForCity(city: City, callback: (report: Report) => void) {
    let city_code = city.code;
    let self = this;
    self.ajaxByProxy(
      `http://weather.livedoor.com/forecast/webservice/json/v1?city=${city_code}`,
      function (data: any) { // : {forecasts: Array<{temperature: Array<{min: number?; max: number?;}>})
      let day;
      let today = data.forecasts[0];
      let tomorrow = data.forecasts[1];

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
        max: day.temperature.max.celsius,
      });
    });
  }
}

export default Weather;
