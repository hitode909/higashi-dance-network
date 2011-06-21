var Note, Part, Stage;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Stage = (function() {
  function Stage(container) {
    this.container = container;
    this.parts = [];
    this.radius = 0;
    this.position = Math.PI * 3.0;
    this.loopCount = 0;
    this.last = Date.now();
    this.bpm = 120.0;
    setInterval(__bind(function() {
      return this.observe();
    }, this), 50);
  }
  Stage.prototype.addPart = function(callback) {
    var button, part;
    this.radius += 50;
    part = new Part;
    part.callback = callback;
    part.radius = this.radius;
    this.parts.push(part);
    button = $("<button>+ " + this.radius + "</button>");
    $('#control').append(button);
    button.click(__bind(function() {
      return part.addNote(this.position);
    }, this));
    return part;
  };
  Stage.prototype.observe = function() {
    var now, part, _i, _len, _ref;
    this.bpm = +$('input#speed').val();
    now = Date.now();
    this.position += this.bpm / 60.0 * (now - this.last) / 1000 * Math.PI * 0.5;
    if (this.position > Math.PI * 4.0) {
      this.position -= Math.PI * 2.0;
    }
    if (this.position < Math.PI * 2.0) {
      this.position += Math.PI * 2.0;
    }
    _ref = this.parts;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      part = _ref[_i];
      part.observe(this.position, this.bpm);
    }
    this.plot();
    return this.last = now;
  };
  Stage.prototype.plot = function() {
    var note, part, stage, stageHeight, stageWidth, _i, _len, _ref, _results;
    stage = $('#stage');
    stageWidth = stage.width();
    stageHeight = stage.height();
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
          if (!note.elem) {
            note.elem = $('<img>');
            note.elem.css({
              position: 'absolute'
            });
            stage.append(note.elem);
          }
          note.elem.css({
            left: Math.sin(this.position - note.position) * part.radius + stageWidth / 2 - 30,
            top: -Math.cos(this.position - note.position) * part.radius + stageHeight / 2 - 30
          });
          _results2.push(note.elem.attr({
            src: note.playing ? 'bucho.png' : 'ossan.png'
          }));
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
    this.lastPosition = 0.0;
  }
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
    var note1, part1;
    note1 = {
      type: 'pulse',
      hz: Math.random() * 4000,
      time: 400 * Math.random(),
      rate: Math.random()
    };
    part1 = stage.addPart(function() {
      return Beep.play(note1);
    });
    return part1.addNote(stage.position * (stage.bpm > 0 ? 1 : -1));
  });
  $('button#add-b').click(function() {
    var note2, part2;
    note2 = [
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
    part2 = stage.addPart(function() {
      return Beep.play(note2);
    });
    return part2.addNote(stage.position);
  });
  $('button#add-c').click(function() {
    var note3, part3;
    note3 = {
      type: 'whiteNoise',
      time: 400 * Math.random()
    };
    part3 = stage.addPart(function() {
      return Beep.play(note3);
    });
    return part3.addNote(stage.position);
  });
  $('button#add-d').click(function() {
    var note4, part4;
    note4 = {
      type: 'brownNoise',
      time: 400 * Math.random()
    };
    part4 = stage.addPart(function() {
      return Beep.play(note4);
    });
    return part4.addNote(stage.position);
  });
  return $('button#add-a').click();
});