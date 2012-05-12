var Hanabi, Page;
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
Hanabi = {
  encode: function(text) {
    return encodeURIComponent(text).split('').reverse().join('');
  },
  decode: function(text) {
    return decodeURIComponent(text.split('').reverse().join(''));
  }
};
Hanabi.Uchiage = (function() {
  function Uchiage(body) {
    this.body = body;
    this.container = $("#utiage-flash");
  }
  Uchiage.prototype.show = function() {
    $("form#uchiage textarea").val(this.body);
    $("#body").text(this.body + " を打ち上げました");
    return this.loadFlash();
  };
  Uchiage.prototype.loadFlash = function() {
    var container, height, requiredVersion, so, width;
    container = this.container[0];
    width = 500;
    height = 300;
    requiredVersion = 9;
    so = new SWFObject('/hanabi/hanabi.swf', 'canvas', width, height, requiredVersion, '#000000');
    so.useExpressInstall('/hanabi/expressinstall.swf');
    so.addVariable('body', this.body);
    so.setAttribute('useGetFlashImageFallback', true);
    so.addParam('allowScriptAccess', 'always');
    return so.write(container);
  };
  return Uchiage;
})();
$(function() {
  var body, uchiage;
  body = Page.parsePageQuery()['body'];
  uchiage = new Hanabi.Uchiage(body);
  return uchiage.show();
});