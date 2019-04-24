// @flow
import { Weather } from './weather';
import { Viewer } from './viewer';
import { WorkerLoader } from './WorkerLoader';
import $ from 'jquery';

$(function() {
  let weather = new Weather();
  let viewer = new Viewer(weather);
  viewer.setup();

  new WorkerLoader();
});
