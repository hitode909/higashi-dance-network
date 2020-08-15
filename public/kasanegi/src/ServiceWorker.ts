// declare var self: any;

const CACHE_NAME = 'kasanegi-v6';

const urlsToCache = [
  '/',
  '/js/bundle.js',

  '/css/common.css',
  '/images/background.png',
  '/images/cardigan.png',
  '/images/coat.png',
  '/images/day.png',
  '/images/docodoco_logo.gif',
  '/images/favicon.ico',
  '/images/guide.png',
  '/images/halfshirts.png',
  '/images/header.png',
  '/images/help-button.png',
  '/images/help.png',
  '/images/help1.png',
  '/images/help2.png',
  '/images/help3.png',
  '/images/hitode909.png',
  '/images/home-icon-144.png',
  '/images/home-icon-192.png',
  '/images/home-icon.png',
  '/images/icon-cardigan.png',
  '/images/icon-coat.png',
  '/images/icon-halfshirts.png',
  '/images/icon-jacket.png',
  '/images/icon-muffler.png',
  '/images/icon-shirts.png',
  '/images/icon-sweater.png',
  '/images/jacket.png',
  '/images/ma7-logo.gif',
  '/images/muffler.png',
  '/images/night.png',
  '/images/shirts.png',
  '/images/sweater.png',
  '/images/swimy1113.png',
  '/images/tenki_logo.gif',
  '/images/tweet-button.png',
  '/images/umbrella.png',
  '/images/weather-cloudy.png',
  '/images/weather-mist.png',
  '/images/weather-rain.png',
  '/images/weather-snow.png',
  '/images/weather-sunny.png',
  '/images/weather-thunder.png',
  '/images/weather-thunderstorm.png',
  '/images/yahoo.gif',
].map((path) => '/kasanegi' + path);

self.addEventListener('install', function(event: any) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener('activate', function(event: any) {
  var cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

self.addEventListener('fetch', function(event: FetchEvent) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      }

      return fetch(event.request);
    }),
  );
});
