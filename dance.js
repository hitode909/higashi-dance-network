var Dial, Note, Part, Stage;
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
    var diff, rad, x, y;
    x = event.offsetX - center.left;
    y = event.offsetY - center.top;
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
    callback(diff);
    return last = rad;
  }));
};
Stage = (function() {
  function Stage(container) {
    var animationLoop;
    this.container = container;
    this.parts = [];
    this.radius = 0;
    this.position = Math.PI * 3.0;
    this.loopCount = 0;
    this.last = Date.now();
    this.bpm = 120.0;
    this.partRadius = 60;
    animationLoop = __bind(function() {
      this.observe();
      return window.requestAnimationFrame(animationLoop);
    }, this);
    animationLoop();
  }
  Stage.prototype.addPart = function(callback) {
    var button, part;
    this.radius += this.partRadius;
    part = new Part;
    part.callback = callback;
    part.radius = this.radius;
    this.parts.push(part);
    button = $("<button>+ " + this.radius + "</button>");
    button.attr({
      'data-radius': this.radius
    });
    $('#control').append(button);
    button.click(__bind(function() {
      return part.addNote(this.position);
    }, this));
    return part;
  };
  Stage.prototype.observe = function() {
    var kills, now, part, _i, _j, _len, _len2, _ref;
    now = Date.now();
    this.position += this.bpm / 60.0 * (now - this.last) / 1000 * Math.PI * 0.5;
    if (this.position > Math.PI * 4.0) {
      this.position -= Math.PI * 2.0;
    }
    if (this.position < Math.PI * 2.0) {
      this.position += Math.PI * 2.0;
    }
    kills = [];
    _ref = this.parts;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      part = _ref[_i];
      part.observe(this.position, this.bpm);
      if (part.rate() < 0.1) {
        kills.push(part);
      }
    }
    this.plot();
    for (_j = 0, _len2 = kills.length; _j < _len2; _j++) {
      part = kills[_j];
      this.killPart(part);
      this.radius -= this.partRadius;
    }
    return this.last = now;
  };
  Stage.prototype.plot = function() {
    var img_size, note, part, rate, stage, stageHeight, stageWidth, _i, _len, _ref, _results;
    stage = $('#stage');
    stageWidth = stage.width();
    stageHeight = stage.height();
    _ref = this.parts;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      part = _ref[_i];
      rate = part.rate();
      _results.push((function() {
        var _j, _len2, _ref2, _results2;
        _ref2 = part.notes;
        _results2 = [];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          note = _ref2[_j];
          if (!note.elem) {
            note.elem = $('<img>');
            note.elem.css({
              position: 'absolute'
            });
            stage.append(note.elem);
          }
          img_size = note.playing ? 100 : 60;
          note.elem.css({
            left: (Math.sin(this.position - note.position) * part.radius - img_size * 0.5) * rate + stageWidth / 2,
            top: (-Math.cos(this.position - note.position) * part.radius - img_size * 0.5) * rate + stageHeight / 2,
            width: img_size * rate,
            opacity: rate
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
  return Stage;
})();
Part = (function() {
  function Part() {
    this.notes = [];
    this.lastPosition = 0.0;
    this.birth = Date.now();
  }
  Part.prototype.rate = function() {
    var age, rate;
    age = Date.now() - this.birth;
    rate = (60000.0 - age) / 60000.0;
    if (rate < 0.0) {
      rate = 0.0;
    }
    return rate;
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
    note.started();
    return this.callback(this.rate()).next(function() {
      return note.ended();
    });
  };
  Part.prototype.addNote = function(position) {
    return this.notes.push(new Note(this, position));
  };
  Part.prototype.kill = function() {
    var note, _i, _len, _ref, _results;
    $("button[data-radius='" + this.radius + "']").remove();
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
  var stage;
  stage = new Stage($('#stage'));
  $('button#add-a').click(function() {
    var note, part;
    note = {
      type: 'pulse',
      hz: Math.random() * 4000,
      time: 400 * Math.random(),
      rate: Math.random()
    };
    part = stage.addPart(function(volume) {
      note.volume = volume;
      return Beep.play(note);
    });
    return part.addNote(stage.position * (stage.bpm > 0 ? 1 : -1));
  });
  $('button#add-b').click(function() {
    var note, part;
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
    part = stage.addPart(function(volume) {
      note.volume = volume;
      return Beep.play(note);
    });
    return part.addNote(stage.position);
  });
  $('button#add-c').click(function() {
    var note, part;
    note = {
      type: 'whiteNoise',
      time: 400 * Math.random() * Math.random()
    };
    part = stage.addPart(function(volume) {
      note.volume = volume;
      return Beep.play(note);
    });
    return part.addNote(stage.position);
  });
  $('button#add-d').click(function() {
    var note, part;
    note = {
      type: 'brownNoise',
      time: 400 * Math.random() * Math.random()
    };
    part = stage.addPart(function(volume) {
      note.volume = volume;
      return Beep.play(note);
    });
    return part.addNote(stage.position);
  });
  $('button#add-a').click();
  Deferred.wait(1).next(function() {
    return Dial($('#stage'), function(diff) {
      stage.bpm += diff * 4;
      return $('input#speed').val(stage.bpm);
    });
  });
  return $('input#speed').change(function() {
    return stage.bpm = +$(this).val();
  });
});