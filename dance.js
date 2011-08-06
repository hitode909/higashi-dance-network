var Dial, Dog, Note, Part, Stage, selectRandom;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
window.requestAnimationFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
    return window.setTimeout(function() {
      return callback;
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
        if (last != null) {
      last;
    } else {
      last = rad;
    };
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
    this.totalPosition = this.position;
    this.loopCount = 0;
    this.last = Date.now();
    this.bpm = 120.0;
    this.fps = 0;
    this.minRadius = 200;
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
    part.age = this.getAge();
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
    var bgs, note, part, rate, stage, stageHeight, stageWidth, _i, _len, _ref, _results;
    stage = $('#stage');
    stageWidth = stage.width();
    stageHeight = stage.height();
    _ref = this.parts;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      part = _ref[_i];
      if (!part.elem) {
        bgs = ['maru2.svg'];
        part.elem = $('<img>');
        part.elem.attr({
          src: selectRandom(bgs)
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
          _results2.push(note.elem.attr({
            src: note.playing ? 'ossan2.png' : 'ossan1.png'
          }));
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
    var note, part, pos;
    part = this.getPartAtDistance(distance);
    if (!part) {
      note = {
        type: 'pulse',
        hz: Math.random() * 4000,
        time: 400 * Math.random(),
        rate: Math.random()
      };
      if (Math.random() < 0.2) {
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
      }
      if (Math.random() < 0.1) {
        note = {
          type: 'whiteNoise',
          time: 400 * Math.random() * Math.random()
        };
      }
      if (Math.random() < 0.1) {
        note = {
          type: 'brownNoise',
          time: 400 * Math.random() * Math.random()
        };
      }
      part = this.addPart(function(volume) {
        note.volume = volume;
        return Beep.play(note);
      });
    }
    pos = this.position;
    return part.addNote(pos);
  };
  Stage.prototype.getAge = function() {
    var age;
    age = this.totalPosition % 80;
    if (age < 0) {
      age += 80;
    }
    return age;
  };
  return Stage;
})();
Part = (function() {
  function Part() {
    this.notes = [];
    this.lastPosition = 0.0;
    this.birth = Date.now();
    this.age = 0;
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
Dog = (function() {
  function Dog(element) {
    this.element = element;
    this.f = 0.0;
  }
  Dog.prototype.observe = function() {
    var opacity;
    opacity = Math.sin(this.f += Math.random() / 20) * 0.5 + 0.5;
    this.element.css({
      opacity: opacity
    });
    if (opacity < 0.01) {
      return this.element.css({
        width: "" + (Math.random() * 100) + "%",
        height: "" + (Math.random() * 100) + "%",
        left: "" + (Math.random() * 100) + "%",
        top: "" + (Math.random() * 100) + "%"
      });
    }
  };
  return Dog;
})();
$(function() {
  var setupCenterDance, setupDog, setupYona, setupYoutube, showCenterItems, stage;
  stage = new Stage($('#stage'));
  setInterval(function() {
    $('#fps').text(stage.fps);
    return stage.fps = 0;
  }, 1000);
  Deferred.wait(1).next(function() {
    return Dial($('#stage'), function(diff, distance) {
      var part;
      stage.bpm += diff * 32;
      part = stage.getPartAtDistance(distance);
      return stage.hoveringPartId = part ? part.radius : null;
    });
  });
  $('#stage').click(function(event) {
    var center, container, distance, x, y;
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
  showCenterItems = function() {
    var items, mainItem, selectedItem;
    mainItem = $('#center-items .center-main-item');
    items = $('#center-items .center-item');
    selectedItem = mainItem;
    return setInterval(function() {
      selectedItem.fadeOut('slow');
      if (selectedItem.hasClass('center-main-item')) {
        selectedItem = $(selectRandom(items));
      } else {
        selectedItem = mainItem;
      }
      return selectedItem.fadeIn('slow');
    }, 3000);
  };
  showCenterItems();
  setupYona = function() {
    var getNote, playYona, yonaList;
    yonaList = [0, 2, 5, 7, 9, 12];
    getNote = function(base) {
      return {
        type: 'sin',
        hz: base * Math.pow(Math.pow(2, 1 / 12), selectRandom(yonaList)),
        release: 0.9999
      };
    };
    playYona = function(base) {
      Beep.play(getNote(base));
      return Deferred.wait(Math.abs(120 / stage.bpm) * selectRandom([1, 1, 2, 0.5])).next(function() {
        return playYona(base);
      });
    };
    playYona(330);
    return playYona(110);
  };
  setupYona();
  setupCenterDance = function() {
    var centerElement, centerImages, change, index;
    centerElement = $('#center-items .center-main-item img');
    index = 0;
    centerImages = ['ossan_center.png', 'ossan_center_2.png', 'ossan_center.png', 'ossan_center_3.png'];
    change = function() {
      centerElement.attr({
        'src': centerImages[index]
      });
      index = (index + 1) % centerImages.length;
      return Deferred.wait(Math.abs(120 / stage.bpm) * 0.25).next(function() {
        return change();
      });
    };
    return change();
  };
  setupCenterDance();
  setupDog = function() {
    var animationLoop, attack_img, dog1, dog2, dog_img;
    dog_img = $('<img>').attr({
      src: 'dog.jpg'
    }).css({
      position: 'absolute',
      'z-index': 13000
    });
    $('body').append(dog_img);
    attack_img = $('<img>').attr({
      src: 'attack.jpg'
    }).css({
      position: 'absolute',
      'z-index': 13001
    });
    $('body').append(attack_img);
    dog1 = new Dog(dog_img);
    dog2 = new Dog(attack_img);
    animationLoop = function() {
      dog1.observe();
      dog2.observe();
      return window.requestAnimationFrame(animationLoop);
    };
    return animationLoop();
  };
  return setupYoutube = function() {
    var put_youtube;
    put_youtube = function() {
      var youtube;
      youtube = $("<iframe width='400' height='300' src='http://www.youtube.com/embed/lniVx_pFM_A?fs=1&autoplay=1&loop=1' frameborder='0' allowFullScreen=''></iframe>");
      youtube.css({
        position: 'absolute',
        'z-index': 14000,
        width: 400,
        height: 300,
        left: '40%',
        top: '40%'
      });
      $('body').append(youtube);
      return Deferred.wait(10).next(function() {
        return youtube.remove();
      });
    };
    return setInterval(function() {
      return put_youtube();
    }, 30 * 1000);
  };
});