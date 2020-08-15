import  { Weather } from './weather';
import { Viewer } from './viewer';
import { WorkerLoader } from './WorkerLoader';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    (window as any).Sentry.init({ dsn: 'https://a864b4ad35594708b2b2a6bb8f371565@sentry.io/1472798' });
  } catch (error) {
    console.warn(error);
  }

  let weather=new Weather();
  const position = await weather.getCurrentPosition();
  const city = await weather.getCityFromLatLon(position.coords.latitude, position.coords.longitude);
  const report = await weather.getWeatherReportForCity2(city);
  console.log(report);



  let viewer = new Viewer(weather);
  viewer.setup();

  new WorkerLoader();
});
