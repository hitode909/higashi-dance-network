// @flow

const CACHE_NAME = 'kasanegi-v1';

const urlsToCache = [
  '/',
  '/js/jquery-1.6.1.min.js',
  '/js/underscore-min.js',
  '/js/bundle.js',

  '/css/reset.css',
  '/css/text.css',
  '/css/common.css',
  '/css/mobile.css',
  '/css/pc.css',

  '/images/back-button.png',
  '/images/back.png',
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
].map(path => '/kasanegi' + path);

// cache API response for one hour
const cacheKeyForNow = () => {
  const timeKey = Math.floor(new Date() / 1000 / 3600);
  return `kasanegi-proxy-v1-${timeKey}`;
};

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME, cacheKeyForNow()];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      if (response) {
        return response;
      }

      const url = event.request.url;

      if (url.match(/proxy/)) {
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            var responseToCache = response.clone();

            caches.open(cacheKeyForNow())
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

            return response;
          }
        );
      }

      return fetch(event.request);
    })
  );
});
