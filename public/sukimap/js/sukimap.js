var Constants, DataStorage, GourmetMap, Handlers, Page, SukiMap;
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
DataStorage = {
  save: function(data) {
    var dfd, json_data;
    dfd = $.Deferred();
    json_data = JSON.stringify(data);
    $.ajax({
      url: '/data/',
      data: {
        data: json_data
      },
      type: 'POST',
      dataType: 'text',
      success: function(key) {
        localStorage["data-" + key] = json_data;
        return dfd.resolve(key);
      },
      error: function() {
        return dfd.reject();
      }
    });
    return dfd.promise();
  },
  get: function(key) {
    var dataKey, dfd, json_data;
    dfd = $.Deferred();
    dataKey = "data-" + key;
    if (localStorage[dataKey]) {
      json_data = localStorage[dataKey];
      dfd.resolve(JSON.parse(json_data));
    } else {
      $.ajax({
        url: "/data/" + key,
        type: 'GET',
        dataType: 'text',
        success: function(json_data) {
          localStorage[dataKey] = json_data;
          return dfd.resolve(JSON.parse(json_data));
        },
        error: function() {
          return dfd.reject();
        }
      });
    }
    return dfd.promise();
  },
  clearCache: function() {
    return localStorage.clear();
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
    var baloon, center, character, map, map_options, view_center;
    center = new google.maps.LatLng(+info.center.lat, +info.center.long);
    view_center = new google.maps.LatLng(+info.center.lat + 0.008, +info.center.long + 0.004);
    map_options = {
      center: center,
      zoom: 14,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(info.container, map_options);
    map.panTo(view_center);
    character = new google.maps.Marker({
      position: center,
      map: map,
      icon: SukiMap.icon_url_to_image(info.icon_image)
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
  icon_url_to_image: function(url) {
    var image, size;
    size = 65;
    image = new google.maps.MarkerImage(url);
    image.size = new google.maps.Size(size, size);
    image.scaledSize = new google.maps.Size(size, size);
    return image;
  },
  update_map: function(info) {
    if (!SukiMap.map) {
      throw "map not loaded";
    }
    if (info.icon_image) {
      SukiMap.character.setIcon(SukiMap.icon_url_to_image(info.icon_image));
    }
    if (info.comment) {
      SukiMap.baloon.setContent(info.comment);
      return SukiMap.baloon.open(SukiMap.map, SukiMap.character);
    }
  },
  add_shop_pin: function(info) {
    var dfd, marker, position;
    if (!SukiMap.map) {
      throw "map not loaded";
    }
    position = new google.maps.LatLng(info.lat, info.long);
    marker = new google.maps.Marker({
      position: position,
      title: info.name
    });
    marker.setMap(SukiMap.map);
    dfd = $.Deferred();
    google.maps.event.addListener(marker, 'click', function() {
      return dfd.resolve();
    });
    return dfd;
  },
  fit_to_positions: function(positions) {
    var bounds, point, position, _i, _len;
    bounds = new google.maps.LatLngBounds();
    bounds.extend(SukiMap.character.getPosition());
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      position = positions[_i];
      point = new google.maps.LatLng(+position.lat, +position.long);
      console.log(point);
      bounds.extend(point);
    }
    console.log(bounds);
    return SukiMap.map.fitBounds(bounds);
  },
  icon_image_at: function(value) {
    value = +value || 1;
    if (!((1 <= value && value <= 4))) {
      value = 1;
    }
    return "http://higashi-dance-network.appspot.com/sukimap/image/face" + value + ".png";
  },
  og_image_at: function(value) {
    return 'http://dl.dropbox.com/u/8270034/sketch/map/14.png';
  },
  save_status: function(info) {
    var post_info;
    post_info = {
      center: {
        lat: info.center.lat,
        long: info.center.long
      },
      icon_value: info.icon_value,
      comment: info.comment,
      created: (new Date()).getTime()
    };
    return DataStorage.save(post_info).then(function(key) {
      return location.href = "/sukimap/suita/" + key + "?edit=1";
    }).fail(function() {
      return alert("保存に失敗しました．");
    });
  },
  load_status: function(key) {
    return DataStorage.get(key).then(function(info) {
      SukiMap.render_map({
        container: $('#map-preview')[0],
        center: {
          lat: info.center.lat,
          long: info.center.long
        },
        icon_image: SukiMap.icon_image_at(info.icon_value),
        comment: info.comment
      });
      SukiMap.setup_share(info);
      SukiMap.setup_time(info.created);
      return GourmetMap.setup({
        comment: info.comment,
        position: {
          lat: info.center.lat,
          long: info.center.long
        }
      });
    });
  },
  setup_share: function(info) {
    var setup_facebook, setup_twitter;
    setup_twitter = function() {
      var text, url;
      text = info.comment;
      url = SukiMap.url_for_share();
      return $('.twitter-share').attr({
        href: "https://twitter.com/share?url=" + (encodeURIComponent(url)) + "&text=" + (encodeURIComponent(text))
      });
    };
    setup_twitter();
    setup_facebook = function() {
      var query;
      query = {
        app_id: '115613081921666',
        link: SukiMap.url_for_share(),
        picture: SukiMap.icon_image_at(info.icon_value),
        name: 'おなかがすきまっぷ',
        description: info.comment,
        redirect_uri: location.href
      };
      return $('.facebook-share').attr({
        href: "https://www.facebook.com/dialog/feed?" + (Page.createQuery(query))
      });
    };
    return setup_facebook();
  },
  setup_time: function(time) {
    var date, date_str;
    date_str = function(date) {
      var diff;
      diff = Math.abs((new Date().getTime() - date.getTime()) / 1000);
      if (diff < 60) {
        return "今さっき";
      }
      diff = Math.floor(diff / 60);
      if (diff < 60) {
        return "" + diff + "分前";
      }
      diff = Math.floor(diff / 60);
      if (diff < 24) {
        return "" + diff + "時間前";
      }
      diff = Math.floor(diff / 24);
      if (diff < 365) {
        return "" + diff + "日前";
      }
      diff = Math.floor(diff / 365);
      return "" + diff + "年前";
    };
    date = new Date(+time);
    return $('#ago').text(date_str(date));
  },
  url_for_share: function() {
    return location.href.replace(/\?edit=1/, '');
  }
};
GourmetMap = {
  setup: function(info) {
    return GourmetMap.extract_keyword(info.comment).done(function(keyword) {
      return GourmetMap.search(keyword, info.position).done(function(res) {
        var shops;
        shops = res.results.shop;
        if (shops.length > 0) {
          return GourmetMap.render_shops(shops);
        } else {
          return GourmetMap.search(null, info.position).done(function(res) {
            shops = res.results.shop;
            return GourmetMap.render_shops(res.results.shop);
          });
        }
      });
    });
  },
  render_shops: function(shops) {
    var i, positions, shop, shop_html, template, _len, _results;
    template = _.template($('#shop-template').html());
    positions = [];
    _results = [];
    for (i = 0, _len = shops.length; i < _len; i++) {
      shop = shops[i];
      shop_html = template({
        shop: shop
      });
      if (i < 10) {
        $('#shops').append(shop_html);
        positions.push({
          lat: shop.lat,
          long: shop.lng
        });
      }
      _results.push(SukiMap.add_shop_pin({
        name: shop.name,
        lat: shop.lat,
        long: shop.lng
      }).done((function(shop_html) {
        return function() {
          return $('#shop-preview').html(shop_html);
        };
      })(shop_html)));
    }
    return _results;
  },
  search: function(keyword, position) {
    return $.ajax({
      type: 'get',
      url: 'http://webservice.recruit.co.jp/hotpepper/gourmet/v1/',
      dataType: 'jsonp',
      data: {
        key: '94eef068f7a6eab9',
        format: 'jsonp',
        lat: position.lat,
        lng: position.long,
        keyword: keyword,
        range: 5,
        count: 100
      }
    });
  },
  extract_keyword: function(text) {
    var dfd, url;
    dfd = $.Deferred();
    url = 'http://jlp.yahooapis.jp/MAService/V1/parse?' + $.param({
      appid: 'J17Tyuixg65goAW301d5vBkBWtO9gLQsJnC0Y7OyJJk96wumaSU2U3odNwj5PdIU1A--',
      sentence: text,
      results: 'ma',
      filter: 9
    });
    GourmetMap.get_by_proxy(url).done(function(doc) {
      var surface;
      surface = $(doc).find('surface')[0];
      if (surface) {
        return dfd.resolve($(surface).text());
      } else {
        return dfd.resolve(null);
      }
    }).fail(function(error) {
      return alert('通信時にエラーが発生しました．時間をおいて試してみてください．');
    });
    return dfd;
  },
  get_by_proxy: function(url) {
    return $.ajax({
      type: 'get',
      url: "/proxy/" + (encodeURIComponent(url))
    });
  }
};
Handlers = {
  init: function() {
    Handlers.common();
    return Handlers[$(document.body).attr('data-page-id')]();
  },
  common: function() {},
  main: function() {
    var check, start;
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
        query = Page.createQuery(position);
        return location.href = "" + Constants.PAGE_PATH.EDIT + "?" + query;
      }, function() {
        return alert("現在地を取得できませでした．時間をおいて試してみてください．");
      });
    });
  },
  edit: function() {
    var query, save_handler;
    query = location.search.length > 0 ? Page.parseQuery(location.search.slice(1)) : null;
    if (!query) {
      alert("位置情報を取得できませんでした．トップページに戻ります．");
      location.href = Constants.PAGE_PATH.MAIN;
    }
    SukiMap.render_map({
      container: $('#map-preview')[0],
      center: {
        lat: query.lat,
        long: query.long
      },
      icon_image: SukiMap.icon_image_at($('input[name=face]:checked').val())
    });
    $('input[name=face]').on('change click', function() {
      return SukiMap.update_map({
        icon_image: SukiMap.icon_image_at($(this).val())
      });
    });
    $('textarea[name=comment]').on('change keyup', _.debounce(function() {
      return SukiMap.update_map({
        comment: _.escape($(this).val())
      });
    }, 100));
    save_handler = _.once(function() {
      return SukiMap.save_status({
        center: {
          lat: query.lat,
          long: query.long
        },
        icon_value: +$('input[name=face]:checked').val(),
        comment: $('textarea[name=comment]').val()
      });
    });
    return $('#edit-form').submit(function() {
      try {
        save_handler(this);
      } catch (e) {
        console.log(e);
      }
      return false;
    });
  },
  suita: function() {
    var key, matched, query;
    matched = location.pathname.match(/suita\/([^?&\/]+)/);
    if (!matched) {
      alert("情報の取得に失敗しました．トップページに戻ります．");
      location.href = Constants.PAGE_PATH.MAIN;
    }
    key = matched[1];
    SukiMap.load_status(key);
    query = location.search.length > 0 ? Page.parseQuery(location.search.slice(1)) : {};
    if (query.edit) {
      $('.share').show();
      $('.guest').hide();
      return $('.created-message').show();
    } else {
      $('.share').hide();
      return $('.guest').show();
    }
  }
};
$(function() {
  return Handlers.init();
});