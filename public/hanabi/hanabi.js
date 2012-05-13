var DataStorage, Hanabi, Page;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Page = {
  parsePageQuery: function() {
    var module;
    module = this;
    return module.parseQuery(location.search.slice(1));
  },
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
  createQuery: function(params) {
    throw "TODO";
  }
};
DataStorage = {
  save: function(data) {
    var dfd;
    dfd = $.Deferred();
    $.ajax({
      url: '/data/',
      data: {
        data: data
      },
      type: 'POST',
      dataType: 'text',
      success: function(key) {
        localStorage["data-" + key] = data;
        return dfd.resolve(key);
      },
      error: function() {
        return dfd.reject();
      }
    });
    return dfd.promise();
  },
  get: function(key) {
    var dataKey, dfd;
    dfd = $.Deferred();
    dataKey = "data-" + key;
    if (localStorage[dataKey]) {
      dfd.resolve(localStorage[dataKey]);
    } else {
      $.ajax({
        url: "/data/" + key,
        type: 'GET',
        dataType: 'text',
        success: function(data) {
          localStorage[dataKey] = data;
          return dfd.resolve(data);
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
Hanabi = {
  postUchiage: function(text) {
    return DataStorage.save(text).then(function(key) {
      return location.href = "/hanabi/uchiage/" + key;
    }).fail(function() {
      return location.href = "/hanabi/uchiage/?data=" + (encodeURIComponent(text));
    });
  },
  getUchiage: function() {
    var dfd, module;
    dfd = $.Deferred();
    module = this;
    module.getBody().then(function(body) {
      return dfd.resolve(new module.Uchiage(body));
    }).fail(function() {
      return dfd.reject();
    });
    return dfd.promise();
  },
  getBody: function() {
    var body, dfd, key, matched;
    dfd = $.Deferred();
    matched = location.pathname.match(/uchiage\/(.+)$/);
    if (matched) {
      key = matched[1];
      DataStorage.get(key).then(function(body) {
        dfd.resolve(body);
        return new Hanabi.Button($("#button-container"), key);
      }).fail(function() {
        return dfd.reject();
      });
    } else {
      body = Page.parsePageQuery()['body'];
      if (body) {
        dfd.resolve(body);
      } else {
        dfd.reject();
      }
    }
    return dfd.promise();
  }
};
Hanabi.Uchiage = (function() {
  function Uchiage(body) {
    this.body = body;
    this.container = $("#uchiage-flash");
  }
  Uchiage.prototype.show = function() {
    if (this.canUseFlash()) {
      return this.loadFlash();
    } else {
      return this.loadByBanner();
    }
  };
  Uchiage.prototype.canUseFlash = function() {
    return deconcept.SWFObjectUtil.getPlayerVersion().major > 0;
  };
  Uchiage.prototype.loadFlash = function() {
    var container, height, requiredVersion, so, src, width;
    container = this.container[0];
    width = 1000;
    height = 700;
    requiredVersion = 9;
    src = "http://d.hatena.ne.jp/hitode909/files/hanabi.swf?d=y";
    so = new SWFObject(src, 'canvas', width, height, requiredVersion, '#000000');
    so.useExpressInstall('/hanabi/expressinstall.swf');
    so.addVariable('body', this.body);
    so.setAttribute('useGetFlashImageFallback', true);
    so.addParam('allowScriptAccess', 'always');
    return so.write(container);
  };
  Uchiage.prototype.loadByBanner = function() {
    var bodyContainer, line, text, _i, _len, _ref;
    $("#uchiage-flash").remove();
    bodyContainer = $("#uchiage-image .body");
    _ref = this.body.split("\n");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      text = _ref[_i];
      line = $('<div>').text(text);
      bodyContainer.append(line);
    }
    return $("#uchiage-image").css({
      display: 'table-cell'
    });
  };
  Uchiage.prototype.setTweetLink = function() {
    var hashtag, message, share, text, url;
    message = "打ち上げました";
    hashtag = "#今夜も打ち上げナイト";
    text = "" + message + " " + hashtag;
    url = location.href;
    share = "https://twitter.com/share?url=" + (encodeURIComponent(url)) + "&text=" + (encodeURIComponent(text));
    return $("a#uchiage-tweet").attr({
      href: share
    });
  };
  Uchiage.prototype.setAnimationFinishHandler = function() {
    return window.uchiageAnimationFinished = function() {
      console.log('finish');
      return $(document.body).addClass("animation-finished");
    };
  };
  return Uchiage;
})();
Hanabi.Button = (function() {
  function Button(container, key) {
    this.container = container;
    this.button = this.container.find('.button');
    this.key = key;
    this.bindClick();
    this.loadStamps();
    this.appendedCount = 0;
    this.cachedPostCount = 0;
  }
  Button.prototype.bindClick = function() {
    return this.button.on('click', __bind(function() {
      this.appendStamps(1);
      return this.postCountCached();
    }, this));
  };
  Button.prototype.loadStamps = function() {
    return this.getCount().then(__bind(function(count) {
      if (count) {
        return this.appendStamps(count);
      }
    }, this));
  };
  Button.prototype.appendStamps = function(count, from) {
    var html, i;
    html = '';
    for (i = 0; 0 <= count ? i < count : i > count; 0 <= count ? i++ : i--) {
      this.appendedCount++;
      html += "<img src=\"/hanabi/img/stamp-" + (this.appendedCount % 3) + ".png\">";
    }
    return this.container.append(html);
  };
  Button.prototype.postCountCached = function() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.cachedPostCount++;
    return this.timer = setTimeout(__bind(function() {
      this.postCount(this.cachedPostCount);
      this.cachedPostCount = 0;
      return this.timer = null;
    }, this), 500);
  };
  Button.prototype.getCount = function() {
    var ajax, dfd;
    dfd = $.Deferred();
    ajax = $.ajax({
      url: "/data/" + this.key,
      type: 'GET',
      dataType: 'text',
      success: function(data) {
        var count;
        count = ajax.getResponseHeader('X-Count');
        return dfd.resolve(count);
      },
      error: function() {
        return dfd.reject();
      }
    });
    return dfd.promise();
  };
  Button.prototype.postCount = function(count) {
    var ajax, dfd;
    dfd = $.Deferred();
    if (!count) {
      count = 1;
    }
    ajax = $.ajax({
      url: "/data/" + this.key,
      data: {
        count: count
      },
      type: 'POST',
      dataType: 'text',
      success: function(data) {
        count = ajax.getResponseHeader('X-Count');
        return dfd.resolve(count);
      },
      error: function() {
        return dfd.reject();
      }
    });
    return dfd.promise();
  };
  return Button;
})();
$(function() {
  var pageId, router;
  router = {
    always: function() {},
    hanabi: function() {
      return $("form#create-uchiage").submit(function(event) {
        var body;
        try {
          body = $(this).find("textarea").val();
          if (!(body.length > 0)) {
            return false;
          }
          $(this).find(".submit").prop("disabled", true);
          Hanabi.postUchiage(body);
        } catch (_e) {}
        return false;
      });
    },
    uchiage: function() {
      return Hanabi.getUchiage().then(function(u) {
        return u.show();
      }).fail(function() {
        alert("申し訳ございません．打ち合げの読み込みに失敗しました．トップページに戻ります．");
        return location.href = "/hanabi/";
      });
    }
  };
  pageId = $(document.documentElement).attr('data-page-id');
  router['always']();
  if (router[pageId]) {
    return router[pageId]();
  }
});