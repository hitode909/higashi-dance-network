var DataStorage, Hanabi, Page;
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
        return dfd.resolve(body);
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
    $("form#uchiage textarea").val(this.body);
    $("#body").text(this.body + " を打ち上げました");
    return this.loadFlash();
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