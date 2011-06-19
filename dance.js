var Note, Part, Stage;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Stage = (function() {
  function Stage(container) {
    this.container = container;
    this.parts = [];
    this.radius = 0;
    this.position = 0.0;
    this.loopCount = 0;
    this.last = Date.now();
    setInterval(__bind(function() {
      return this.observe();
    }, this), 100);
  }
  Stage.prototype.addPart = function(callback) {
    var button, part;
    this.radius += 100;
    part = new Part;
    part.callback = callback;
    part.radius = this.radius;
    this.parts.push(part);
    button = $('<button>OK</button>');
    $('#control').append(button);
    button.click(__bind(function() {
      part.addNote(this.position);
      return console.log(part);
    }, this));
    return part;
  };
  Stage.prototype.observe = function() {
    var bpm, now, part, _i, _len, _ref;
    bpm = +$('input#speed').val();
    now = Date.now();
    this.position += bpm / 60.0 * (now - this.last) / 1000 * Math.PI * 0.5;
    if (this.position > Math.PI * 2.0) {
      this.position -= Math.PI * 2.0;
      this.loopCount++;
    }
    if (this.position < 0.0) {
      this.position += Math.PI * 2.0;
      this.loopCount++;
    }
    _ref = this.parts;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      part = _ref[_i];
      part.observe(this.loopCount, this.position);
    }
    this.plot();
    return this.last = now;
  };
  Stage.prototype.plot = function() {
    var elem, note, part, stage, stageHeight, stageWidth, _i, _len, _ref, _results;
    stage = $('#stage');
    stageWidth = stage.width();
    stageHeight = stage.height();
    stage.empty();
    _ref = this.parts;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      part = _ref[_i];
      _results.push((function() {
        var _j, _len2, _ref2, _results2;
        _ref2 = part.notes;
        _results2 = [];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          note = _ref2[_j];
          elem = $('<img>');
          elem.attr({
            src: note.playing ? 'bucho.png' : 'ossan.png'
          });
          elem.css({
            position: 'absolute',
            left: Math.sin(this.position - note.position) * part.radius + stageWidth / 2,
            top: -Math.cos(this.position - note.position) * part.radius + stageHeight / 2
          });
          _results2.push(stage.append(elem));
        }
        return _results2;
      }).call(this));
    }
    return _results;
  };
  return Stage;
})();
Part = (function() {
  function Part() {
    this.notes = [];
  }
  Part.prototype.observe = function(loopCount, position) {
    var note, _i, _len, _ref, _results;
    _ref = this.notes;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      note = _ref[_i];
      _results.push(note.observe(loopCount, position));
    }
    return _results;
  };
  Part.prototype.play = function(note) {
    note.started();
    return this.callback().next(function() {
      return note.ended();
    });
  };
  Part.prototype.addNote = function(position) {
    return this.notes.push(new Note(this, position));
  };
  return Part;
})();
Note = (function() {
  function Note(part, position) {
    this.part = part;
    this.position = position;
    this.playing = false;
    this.lastLoop = 0;
  }
  Note.prototype.observe = function(count, position) {
    if (count > this.lastLoop && position > this.position && !this.playing) {
      this.part.play(this);
      return this.lastLoop = count;
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
  var part, stage;
  stage = new Stage($('#stage'));
  part = stage.addPart(function() {
    return Beep.playPulse(220, 100);
  });
  part.addNote(0.0);
  part.addNote(Math.PI * 1.0);
  part = stage.addPart(function() {
    return Beep.playPulse(2000, 200, 0.7, 0.3);
  });
  part.addNote(Math.PI * 0.75);
  part = stage.addPart(function() {
    return Beep.playBrownNoise(5, 100, 0.5);
  });
  return part.addNote(Math.PI * 1.75);
});