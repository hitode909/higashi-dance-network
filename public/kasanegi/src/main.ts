import  { Weather } from './weather';
import { Viewer } from './viewer';
import { WorkerLoader } from './WorkerLoader';

document.addEventListener('DOMContentLoaded', () => {
  let weather = new Weather();
  let viewer = new Viewer(weather);
  viewer.setup();

  new WorkerLoader();
});
