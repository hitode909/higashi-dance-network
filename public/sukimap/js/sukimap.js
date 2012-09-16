var Constants, Handlers, Page, SukiMap;
Page = {
  parseQuery: function(query_string) {
    var k, pair, query, v, _i, _len, _ref, _ref2;
    query = {};
    _ref = query_string.split('&');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pair = _ref[_i];
      _ref2 = pair.split('='), k = _ref2[0], v = _ref2[1];
      query[decodeURIComponent(k)] = decodeURIComponent(v);
    }
    return query;
  },
  createQuery: function(query) {
    var key, keys;
    keys = ((function() {
      var _results;
      _results = [];
      for (key in query) {
        _results.push(key);
      }
      return _results;
    })()).sort();
    return ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        _results.push("" + (encodeURIComponent(key)) + "=" + (encodeURIComponent(query[key])));
      }
      return _results;
    })()).join('&');
  },
  createURL: function(query) {
    var module;
    module = this;
    return location.protocol + '//' + location.host + location.pathname + '?' + module.createQuery(query);
  }
};
Constants = {
  PAGE_PATH: {
    MAIN: '/sukimap/',
    EDIT: '/sukimap/edit/',
    SUITA: '/sukimap/suita/'
  }
};
SukiMap = {
  render_map: function(info) {
    var baloon, center, character, map, map_options;
    center = new google.maps.LatLng(+info.center.lat, +info.center.long);
    map_options = {
      center: center,
      zoom: 10,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(info.container, map_options);
    character = new google.maps.Marker({
      position: center,
      map: map,
      icon: info.icon_image
    });
    baloon = new google.maps.InfoWindow({
      content: info.comment,
      maxWidth: 200
    });
    if (info.comment) {
      setTimeout(function() {
        return baloon.open(map, character);
      }, 1000);
    }
    SukiMap.map = map;
    SukiMap.character = character;
    return SukiMap.baloon = baloon;
  },
  update_icon: function(info) {
    if (!SukiMap.map) {
      throw "map not loaded";
    }
    if (info.icon_image) {
      SukiMap.character.setIcon(info.icon_image);
    }
    if (info.comment) {
      SukiMap.baloon.setContent(info.comment);
      return SukiMap.baloon.open(SukiMap.map, SukiMap.character);
    }
  }
};
Handlers = {
  init: function() {
    Handlers.common();
    Handlers[$(document.body).attr('data-page-id')]();
    return console.log('done');
  },
  common: function() {
    return console.log('common');
  },
  main: function() {
    var check, start;
    console.log('main');
    check = function() {
      var _ref;
      return typeof navigator !== "undefined" && navigator !== null ? (_ref = navigator.geolocation) != null ? _ref.getCurrentPosition : void 0 : void 0;
    };
    start = function() {
      var dfd;
      dfd = $.Deferred();
      navigator.geolocation.getCurrentPosition(function(position) {
        return dfd.resolve({
          lat: position.coords.latitude,
          long: position.coords.longitude
        });
      }, function(error) {
        return dfd.reject(error);
      });
      return dfd;
    };
    if (!check()) {
      alert("お使いのブラウザはおなかすきまっぷに対応していません．\nスマートフォンかGoogle ChromeかFirefoxでご利用ください．");
      return;
    }
    return $('.start-button').click(function() {
      return start().then(function(position) {
        var query;
        console.log(position);
        query = Page.createQuery(position);
        return location.href = "" + Constants.PAGE_PATH.EDIT + "?" + query;
      }, function() {
        return alert("現在地を取得できませでした．時間をおいて試してみてください．");
      });
    });
  },
  edit: function() {
    var map_options, query;
    console.log('edit');
    query = location.search.length > 0 ? Page.parseQuery(location.search.slice(1)) : null;
    if (!query) {
      alert("位置情報を取得できませんでした．トップページに戻ります．");
      location.href = Constants.PAGE_PATH.MAIN;
    }
    console.log(query);
    map_options = {
      container: $('#map-preview')[0],
      center: {
        lat: query.lat,
        long: query.long
      },
      icon_image: 'http://dl.dropbox.com/u/8270034/sketch/map/14.png'
    };
    return SukiMap.render_map({
      container: $('#map-preview')[0],
      center: {
        lat: query.lat,
        long: query.long
      },
      icon_image: 'http://dl.dropbox.com/u/8270034/sketch/map/14.png'
    });
  },
  permalink: function() {
    return console.log('permalink');
  }
};
$(function() {
  return Handlers.init();
});