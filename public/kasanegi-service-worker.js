(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var CACHE_NAME = 'kasanegi-v1';
var urlsToCache = ['/', '/js/jquery-1.6.1.min.js', '/js/underscore-min.js', '/js/bundle.js', '/css/reset.css', '/css/text.css', '/css/common.css', '/css/mobile.css', '/css/pc.css', '/images/back-button.png', '/images/back.png', '/images/background.png', '/images/cardigan.png', '/images/coat.png', '/images/day.png', '/images/docodoco_logo.gif', '/images/favicon.ico', '/images/guide.png', '/images/halfshirts.png', '/images/header.png', '/images/help-button.png', '/images/help.png', '/images/help1.png', '/images/help2.png', '/images/help3.png', '/images/hitode909.png', '/images/home-icon.png', '/images/icon-cardigan.png', '/images/icon-coat.png', '/images/icon-halfshirts.png', '/images/icon-jacket.png', '/images/icon-muffler.png', '/images/icon-shirts.png', '/images/icon-sweater.png', '/images/jacket.png', '/images/ma7-logo.gif', '/images/muffler.png', '/images/night.png', '/images/shirts.png', '/images/sweater.png', '/images/swimy1113.png', '/images/tenki_logo.gif', '/images/tweet-button.png', '/images/umbrella.png', '/images/weather-cloudy.png', '/images/weather-mist.png', '/images/weather-rain.png', '/images/weather-snow.png', '/images/weather-sunny.png', '/images/weather-thunder.png', '/images/weather-thunderstorm.png', '/images/yahoo.gif'].map(function (path) {
  return '/kasanegi' + path;
});

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    console.log('Opened cache');
    return cache.addAll(urlsToCache);
  }));
});

self.addEventListener('fetch', function (event) {
  console.log('fetch event');
  console.log(event.request.url);
  event.respondWith(caches.match(event.request).then(function (response) {
    // キャッシュがあったのでそのレスポンスを返す
    if (response) {
      console.log('cache hit');
      return response;
    } else {
      console.log('cache not found');
    }
    return fetch(event.request);
  }));
});

},{}]},{},[1]);
