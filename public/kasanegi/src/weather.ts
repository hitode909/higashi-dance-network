import * as $ from "jquery";
import {Cities} from "./Cities";

interface City {
  title: string;
  code: string;
}

interface NewCity {
  name: string;
  lat: number;
  lon: number;
};
type NewCityList = NewCity[];
const NewCities = require('./cities.json') as NewCityList;

interface Report {
  date: string;
  description: string;
  min: number
  max: number;
}

interface RawWeather {
  id: number;
  main: string;
  description: string;
  icon: string;
}
interface RawDailyReport {
  dt: number;
  temp: {
    max: number;
    min: number;
  }
  weather: RawWeather[];
};
  interface RawReport {
    daily: RawDailyReport[];
  };

export class Weather {
  readonly YAHOO_APPLICATION_ID = 'J17Tyuixg65goAW301d5vBkBWtO9gLQsJnC0Y7OyJJk96wumaSU2U3odNwj5PdIU1A--';
  readonly CITIES: Array<City> = Cities;
  readonly newCities = NewCities;

  public getLastCityCode() {
    return localStorage.getItem('pref_name');
  }

  public setLastCityCode(city_code: string): void {
    return localStorage.setItem('pref_name', city_code);
  }

  public async getCurrentPosition(): Promise<Position> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })
  }

  public async getCurrentStateCode(): Promise<string> {
    const position = await this.getCurrentPosition();

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    return await this.getStatusCodeFromLatLon(lat, lon);
  }

  public getLastPageId(): string {
    return localStorage.getItem('last_page_id') || 'main';
  }

  public setLastPageId(last_page_id: string) {
    return localStorage.setItem('last_page_id', last_page_id);
  }

  public async getCityFromLatLon(lat: number, lon: number): Promise<NewCity> {
    let self = this;
    let params = $.param({
      lat,
      lon,
      output: 'json',
      appid: self.YAHOO_APPLICATION_ID,
    });

    const res = await self.ajaxByProxy(`http://reverse.search.olp.yahooapis.jp/OpenLocalPlatform/V1/reverseGeoCoder?${params}`);

    const nameGot = res.Feature[0].Property.AddressElement[0].Name;
    const city = NewCities.find(c => c.name === nameGot);
    if (!city) {
      throw new Error(`Unexpected prefName: ${nameGot}`);
    }
    return city;
  }

  public async getStatusCodeFromLatLon(lat: number, lon: number) {
    let self = this;
    let params = $.param({
      lat,
      lon,
      output: 'json',
      appid: self.YAHOO_APPLICATION_ID,
    });

    const res = await self.ajaxByProxy(`http://reverse.search.olp.yahooapis.jp/OpenLocalPlatform/V1/reverseGeoCoder?${params}`);
    return res.Feature[0].Property.AddressElement[0].Name;
  }

  public getCityByCityCode2(name: string): NewCity {
    const city = NewCities.find(c => c.name === name);
    if (!city) {
      throw new Error(`Unexpected prefName: ${name}`);
    }
    return city;
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

  private async ajaxByProxy(url: string) {
    return await $.ajax({
        type: 'GET',
        url: `/proxy/${encodeURIComponent(url)}`,
        dataType: 'json',
      });
  }

  // 最新の天気を返します．今日か明日．
  // return: { date description min max }
  public async getWeatherReportForCity2(city: NewCity): Promise<Report> {

    const data = await $.ajax({
      type: 'GET',
      url: `/weather?lat=${city.lat}&lon=${city.lon}`,
      dataType: 'json',
    }) as RawReport;
    console.log(data);

    let today = data.daily[0];

    return {
      date: new Date(today.dt * 1000).toLocaleDateString(),
      description: today.weather[0].description,
      min: today.temp.min,
      max: today.temp.max,
    };
  }

  // 最新の天気を返します．今日か明日．
  // return: { date description min max }
  public async getWeatherReportForCity(city: City): Promise<Report> {
    let city_code = city.code;
    let self = this;
    const data = await self.ajaxByProxy(
      `http://weather.livedoor.com/forecast/webservice/json/v1?city=${city_code}`
    );
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

    return {
      date: day.date,
      description: day.telop,
      min: day.temperature.min.celsius,
      max: day.temperature.max.celsius,
    };
  }
}
