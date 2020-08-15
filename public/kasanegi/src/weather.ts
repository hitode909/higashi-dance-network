import * as $ from "jquery";

interface City {
  name: string;
  lat: number;
  lon: number;
};

const Cities = require('./cities.json') as City[];

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
  readonly newCities = Cities;

  public getLastCityName() {
    return localStorage.getItem('pref_name');
  }

  public setLastCityName(city_code: string): void {
    return localStorage.setItem('pref_name', city_code);
  }

  public async getCurrentPosition(): Promise<Position> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })
  }

  public async getCurrentCity(): Promise<City> {
    const position = await this.getCurrentPosition();

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    return await this.getCityFromLatLon(lat, lon);
  }

  public getLastPageId(): string {
    return localStorage.getItem('last_page_id') || 'main';
  }

  public setLastPageId(last_page_id: string) {
    return localStorage.setItem('last_page_id', last_page_id);
  }

  public async getCityFromLatLon(lat: number, lon: number): Promise<City> {
    let self = this;
    let params = $.param({
      lat,
      lon,
      output: 'json',
      appid: self.YAHOO_APPLICATION_ID,
    });

    const res = await self.ajaxByProxy(`http://reverse.search.olp.yahooapis.jp/OpenLocalPlatform/V1/reverseGeoCoder?${params}`);

    const nameGot = res.Feature[0].Property.AddressElement[0].Name;
    const city = Cities.find(c => c.name === nameGot);
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

  public getCityByCityName(name: string): City | undefined {
    return Cities.find(c => c.name === name);
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
  public async getWeatherReportForCity(city: City): Promise<Report> {

    const data = await $.ajax({
      type: 'GET',
      url: `/weather?lat=${city.lat}&lon=${city.lon}`,
      dataType: 'json',
    }) as RawReport;

    let today = data.daily[0];

    return {
      date: new Date(today.dt * 1000).toLocaleDateString(),
      description: today.weather[0].description,
      min: today.temp.min,
      max: today.temp.max,
    };
  }
}
