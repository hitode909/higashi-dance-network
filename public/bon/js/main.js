var Dial, Note, Part, Stage, selectRandom;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
window.requestAnimationFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
    return window.setTimeout(function() {
      return callback();
    }, 1000 / 60);
  };
})();
Dial = function(container, callback) {
  var center, last;
  last = null;
  center = {
    left: $(container).position().left + $(container).width() / 2,
    top: $(container).position().top + $(container).height() / 2
  };
  return $(container).mousemove($.throttle(100, function(event) {
    var diff, distance, rad, x, y;
    x = event.pageX - center.left;
    y = event.pageY - center.top;
    distance = Math.sqrt(x * x + y * y);
    rad = Math.atan(y / x);
    if (x < 0) {
      rad += Math.PI;
    }
    if (last == null) {
      last = rad;
    }
    diff = rad - last;
    if (diff < -Math.PI) {
      diff += Math.PI * 2;
    }
    if (diff > Math.PI) {
      diff -= Math.PI * 2;
    }
    callback(diff, distance);
    return last = rad;
  }));
};
selectRandom = function(list) {
  return list[Math.floor(Math.random() * list.length)];
};
Stage = (function() {
  function Stage(container) {
    var animationLoop;
    this.container = container;
    this.parts = [];
    this.position = Math.PI * 3.0;
    this.totalPosition = 0.0;
    this.ageFrom = this.parseAgeFrom();
    this.loopCount = 0;
    this.last = Date.now();
    this.bpm = 120.0;
    this.fps = 0;
    this.minRadius = 200;
    this.partIndex = 0;
    animationLoop = __bind(function() {
      this.observe();
      return window.requestAnimationFrame(animationLoop);
    }, this);
    animationLoop();
  }
  Stage.prototype.addPart = function(callback) {
    var part, radius;
    radius = 0;
    if (this.parts.length > 0) {
      radius = this.parts[this.parts.length - 1].getRadius() + this.parts[this.parts.length - 1].getImageRadius() * 2;
    }
    if (radius < this.minRadius) {
      radius = this.minRadius + Part.prototype.ImageRadius;
    }
    part = new Part;
    part.callback = callback;
    part.radius = radius;
    part.ageKey = this.getAgeKey();
    this.parts.push(part);
    return part;
  };
  Stage.prototype.observe = function() {
    var diff, kills, now, part, _i, _j, _len, _len2, _ref;
    this.fps++;
    now = Date.now();
    diff = this.bpm / 60.0 * (now - this.last) / 1000 * Math.PI * 0.5;
    this.position += diff;
    this.totalPosition += diff;
    while (this.position > Math.PI * 4.0) {
      this.position -= Math.PI * 2.0;
    }
    while (this.position < Math.PI * 2.0) {
      this.position += Math.PI * 2.0;
    }
    kills = [];
    _ref = this.parts;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      part = _ref[_i];
      part.observe(this.position, this.bpm);
      if (part.getRadius() + part.getImageRadius() * 2 < this.minRadius) {
        kills.push(part);
      }
    }
    this.plot();
    for (_j = 0, _len2 = kills.length; _j < _len2; _j++) {
      part = kills[_j];
      this.killPart(part);
    }
    return this.last = now;
  };
  Stage.prototype.plot = function() {
    var bgs, note, part, rate, src, stage, stageHeight, stageWidth, _i, _len, _ref, _results;
    stage = $('#stage');
    stageWidth = stage.width();
    stageHeight = stage.height();
    _ref = this.parts;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      part = _ref[_i];
      if (!part.elem) {
        bgs = ['images/maru1.svg', 'images/maru2.svg', 'images/maru3.svg', 'images/maru4.svg'];
        this.partIndex++;
        if (this.partIndex >= bgs.length) {
          this.partIndex = 0;
        }
        part.elem = $('<img>');
        part.elem.attr({
          src: bgs[this.partIndex]
        });
        part.elem.addClass('part');
        stage.append(part.elem);
      }
      part.elem.css({
        width: part.getImageRadius() * 2 + part.getRadius() * 2,
        height: part.getImageRadius() * 2 + part.getRadius() * 2,
        left: stageWidth / 2 - part.getRadius() - part.getImageRadius(),
        top: stageHeight / 2 - part.getRadius() - part.getImageRadius(),
        'z-index': parseInt(stageWidth / 2 - part.getRadius()) + 5000
      });
      rate = part.getRate();
      _results.push((function() {
        var _j, _len2, _ref2, _results2;
        _ref2 = part.notes;
        _results2 = [];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          note = _ref2[_j];
          if (!note.elem) {
            note.elem = $('<img>').addClass('note').css({
              width: part.getImageRadius() * 2,
              height: part.getImageRadius() * 2
            });
            stage.append(note.elem);
          }
          note.elem.css({
            left: (Math.sin(this.position - note.position) * part.getRadius()) - part.getImageRadius() + stageWidth / 2,
            top: (-Math.cos(this.position - note.position) * part.getRadius()) - part.getImageRadius() + stageHeight / 2
          });
          src = note.playing ? part.getOnImage() : part.getOffImage();
          _results2.push(note.elem.attr('src') !== src ? note.elem.attr('src', src) : void 0);
        }
        return _results2;
      }).call(this));
    }
    return _results;
  };
  Stage.prototype.killPart = function(part) {
    this.parts = $.grep(this.parts, function(v) {
      return v.radius !== part.radius;
    });
    return part.kill();
  };
  Stage.prototype.getPartAtDistance = function(distance) {
    var got, part, _fn, _i, _len, _ref;
    got = null;
    if (distance < this.minRadius) {
      return null;
    }
    _ref = this.parts.reverse();
    _fn = function(part) {
      if (part.getRadius() + part.getImageRadius() > distance) {
        return got = part;
      }
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      part = _ref[_i];
      _fn(part);
    }
    this.parts.reverse();
    return got;
  };
  Stage.prototype.actionAtDistance = function(distance) {
    var ageKey, getNote, note, part, pos, tone;
    part = this.getPartAtDistance(distance);
    if (!part) {
      ageKey = this.getAgeKey();
      note = null;
      if (ageKey === 0) {
        tone = selectRandom([0, 2, 5, 7, 9, 12]);
        getNote = function(base) {
          return {
            type: 'sin',
            hz: base * Math.pow(Math.pow(2, 1 / 12), tone),
            release: 0.9999,
            volume: 1.0
          };
        };
        note = getNote(440);
      } else if (ageKey === 10) {
        note = {
          type: 'pulse',
          hz: Math.random() * 4000,
          time: 400 * Math.random(),
          rate: Math.random()
        };
      } else if (ageKey === 20) {
        note = {
          type: 'brownNoise',
          time: 400 * Math.random() * Math.random()
        };
      } else if (ageKey === 50) {
        note = [
          {
            type: 'pulse',
            hz: Math.random() * 4000,
            time: 100 * Math.random(),
            rate: Math.random()
          }, {
            type: 'pulse',
            hz: Math.random() * 4000,
            time: 100 * Math.random(),
            rate: Math.random()
          }, {
            type: 'pulse',
            hz: Math.random() * 4000,
            time: 100 * Math.random(),
            rate: Math.random()
          }
        ];
      } else {
        tone = selectRandom([0, 2, 5, 7, 9, 12]);
        getNote = function(base) {
          return {
            type: 'pulse',
            hz: base * Math.pow(Math.pow(2, 1 / 12), tone),
            release: 0.9997,
            volume: 1.0
          };
        };
        note = getNote(440);
      }
      part = this.addPart(function(volume) {
        note.volume = volume;
        return Beep.play(note);
      });
    }
    pos = this.position;
    return part.addNote(pos);
  };
  Stage.prototype.getAgeMax = function() {
    return 80;
  };
  Stage.prototype.getAge = function() {
    var age;
    age = this.ageFrom + this.totalPosition;
    age = (age / 2) % this.getAgeMax();
    if (age < 0) {
      age += this.getAgeMax();
    }
    return age;
  };
  Stage.prototype.parseAgeFrom = function() {
    var match;
    match = location.hash.match(/\d+/);
    if (!match) {
      return 0;
    }
    return parseInt(match, 10);
  };
  Stage.prototype.getAgeKey = function(age) {
    var keys;
    keys = [0, 10, 20, 50, 60];
    if (age == null) {
      age = this.getAge();
    }
    return keys[Math.floor((age / this.getAgeMax()) * keys.length)];
  };
  Stage.prototype.getURL = function() {
    return location.protocol + "//" + location.host + location.pathname;
  };
  Stage.prototype.getHatenaBookmarkURL = function() {
    return "http://b.hatena.ne.jp/entry/" + (this.getURL());
  };
  Stage.prototype.getTshirtsURL = function() {
    return 'http://clubt.jp/search?q=http%3A%2F%2Fhigashi-dance-network.appspot.com%2Fbon%2F';
  };
  Stage.prototype.getTweetURL = function() {
    return "https://twitter.com/share?source=tweetbutton&text=bon&url=" + (encodeURIComponent(this.getURL())) + "&original_referer=" + (encodeURIComponent(this.getURL()));
  };
  return Stage;
})();
Part = (function() {
  function Part() {
    this.notes = [];
    this.lastPosition = 0.0;
    this.birth = Date.now();
    this.ageKey = 0;
  }
  Part.prototype.ImageRadius = 30;
  Part.prototype.getRate = function() {
    var age, limit, rate;
    limit = this.radius * 500;
    age = Date.now() - this.birth;
    rate = (limit - age) / limit;
    if (rate < 0.0) {
      rate = 0.0;
    }
    return rate;
  };
  Part.prototype.getRadius = function() {
    return this.radius * this.getRate();
  };
  Part.prototype.getImageRadius = function() {
    return Part.prototype.ImageRadius;
  };
  Part.prototype.observe = function(position, bpm) {
    var note, offset, position_offset, _i, _len, _ref;
    offset = 0.0;
    if (bpm > 0 && position < this.lastPosition) {
      offset = Math.PI * 2;
    }
    if (bpm < 0 && position > this.lastPosition) {
      offset = -Math.PI * 2;
    }
    position_offset = position + offset;
    _ref = this.notes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      note = _ref[_i];
      note.observe(position_offset, this.lastPosition);
    }
    return this.lastPosition = position;
  };
  Part.prototype.play = function(note) {
    if (note.playing) {
      return;
    }
    note.started();
    return this.callback(Math.pow(this.getRate(), 3)).next(function() {
      return note.ended();
    });
  };
  Part.prototype.addNote = function(position) {
    var note;
    note = new Note(this, position);
    this.notes.push(note);
    return this.play(note);
  };
  Part.prototype.kill = function() {
    var note, _i, _len, _ref, _results;
    this.elem.remove();
    _ref = this.notes;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      note = _ref[_i];
      _results.push(note.elem.remove());
    }
    return _results;
  };
  Part.prototype.getOnImage = function() {
    return this.getImageByKeys(this.ageKey, 'on');
  };
  Part.prototype.getOffImage = function() {
    return this.getImageByKeys(this.ageKey, 'off');
  };
  Part.prototype.getImageByKeys = function(age, name) {
    return "images/" + age + "_" + name + ".png";
  };
  return Part;
})();
Note = (function() {
  function Note(part, position) {
    this.part = part;
    this.position = position;
    this.playing = false;
    while (this.position > Math.PI * 4.0) {
      this.position -= Math.PI * 2.0;
    }
    while (this.position < Math.PI * 2.0) {
      this.position += Math.PI * 2.0;
    }
  }
  Note.prototype.observe = function(position, lastPosition) {
    var a, b;
    a = this.position - position;
    b = this.position - lastPosition;
    if (a * b <= 0) {
      return this.part.play(this);
    }
  };
  Note.prototype.started = function() {
    return this.playing = true;
  };
  Note.prototype.ended = function() {
    return this.playing = false;
  };
  return Note;
})();
$(function() {
  var setupCenterDance, setupShowCenterItems, setupYona, stage;
  stage = new Stage($('#stage'));
  TheDeferred.wait(1).next(function() {
    return Dial($('#stage'), function(diff, distance) {
      var bpmMin, part;
      stage.bpm += diff * 32;
      bpmMin = 1.0;
      if (Math.abs(stage.bpm) < bpmMin) {
        stage.bpm = bpmMin * stage.bpm / Math.abs(stage.bpm);
      }
      part = stage.getPartAtDistance(distance);
      return stage.hoveringPartId = part ? part.radius : null;
    });
  });
  $('#stage').click(function(event) {
    var center, container, distance, x, y;
    if ($(event.target).parents('a').length > 0) {
      return;
    }
    container = $('#stage');
    center = {
      left: container.position().left + container.width() / 2,
      top: container.position().top + container.height() / 2
    };
    x = event.pageX - center.left;
    y = event.pageY - center.top;
    distance = Math.sqrt(x * x + y * y);
    return stage.actionAtDistance(distance);
  });
  setupShowCenterItems = function() {
    var change, items, mainItem, selectedItem, waitLink, waitMain;
    mainItem = $('#center-items .center-main-item');
    items = $('#center-items .center-item');
    selectedItem = mainItem;
    waitMain = 25;
    waitLink = 5;
    change = function() {
      selectedItem.fadeOut('slow');
      if (selectedItem.hasClass('center-main-item')) {
        selectedItem = $(selectRandom(items));
      } else {
        selectedItem = mainItem;
      }
      selectedItem.fadeIn('slow');
      return TheDeferred.wait(selectedItem.hasClass('center-main-item') ? waitMain : waitLink).next(function() {
        return change();
      });
    };
    return TheDeferred.wait(waitMain).next(function() {
      return change();
    });
  };
  setupYona = function() {
    var flowerElement, flowers, getNote, index, playYona, yonaList;
    index = 0;
    flowerElement = $('.hasu img');
    flowers = ['images/hasu.png', 'images/hasu2.png'];
    yonaList = [0, 2, 5, 7, 9, 12];
    getNote = function(base) {
      return {
        type: 'sin',
        hz: base * Math.pow(Math.pow(2, 1 / 12), selectRandom(yonaList)),
        release: 0.9995,
        volume: 1.0
      };
    };
    playYona = function() {
      Beep.play(getNote(330));
      Beep.play(getNote(220));
      index = (index + 1) % flowers.length;
      flowerElement.attr({
        'src': flowers[index]
      });
      return TheDeferred.wait(Math.abs(120 / stage.bpm) * selectRandom([1, 1, 2, 0.5])).next(function() {
        return playYona();
      });
    };
    return playYona();
  };
  setupYona();
  setupCenterDance = function() {
    var bookmarkElement, bookmarkImages, bookmarkIndex, buyTshirtsLink, centerElement, centerImages, centerIndex, change, hatenaBookmarkLink, tshirtsElement, tshirtsImages, tshirtsIndex, tweetElement, tweetImages, tweetIndex, tweetLink;
    centerElement = $('#center-items .center-main-item img');
    bookmarkElement = $('#hatena-bookmark-link img');
    tshirtsElement = $('#buy-tshirts-link img');
    tweetElement = $('#tweet-link img');
    centerIndex = 0;
    centerImages = {
      0: ['images/0_center.png', 'images/0_right.png'],
      10: ['images/10_center.png', 'images/10_right.png'],
      20: ['images/20_center.png', 'images/20_right.png'],
      50: ['images/50_center.png', 'images/50_right.png'],
      60: ['images/60_center.png', 'images/60_right.png']
    };
    bookmarkImages = ['images/hatena-bookmark1.png', 'images/hatena-bookmark2.png'];
    bookmarkIndex = 0;
    tshirtsImages = ['images/buy-tshirts1.png', 'images/buy-tshirts2.png'];
    tshirtsIndex = 0;
    tweetImages = ['images/tweet1.png', 'images/tweet2.png'];
    tweetIndex = 0;
    tweetLink = $('a#tweet-link');
    hatenaBookmarkLink = $('a#hatena-bookmark-link');
    buyTshirtsLink = $('a#buy-tshirts-link');
    hatenaBookmarkLink.attr('href', stage.getHatenaBookmarkURL());
    change = function() {
      tweetLink.attr('href', stage.getTweetURL());
      buyTshirtsLink.attr('href', stage.getTshirtsURL());
      centerElement.attr({
        'src': centerImages[stage.getAgeKey()][centerIndex]
      });
      centerIndex = (centerIndex + 1) % centerImages[stage.getAgeKey()].length;
      bookmarkElement.attr({
        'src': bookmarkImages[bookmarkIndex]
      });
      bookmarkIndex = (bookmarkIndex + 1) % bookmarkImages.length;
      tshirtsElement.attr({
        'src': tshirtsImages[tshirtsIndex]
      });
      tshirtsIndex = (tshirtsIndex + 1) % tshirtsImages.length;
      tweetElement.attr({
        'src': tweetImages[tweetIndex]
      });
      tweetIndex = (tweetIndex + 1) % tweetImages.length;
      return TheDeferred.wait(Math.abs(120 / stage.bpm) * 0.25).next(function() {
        return change();
      });
    };
    return change();
  };
  return setupCenterDance();
});