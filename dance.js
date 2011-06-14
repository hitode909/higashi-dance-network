var Part, circle;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
circle = function(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.stroke();
  if (fill) {
    return ctx.fill();
  }
};
Part = (function() {
  function Part(canvas, sample, radius) {
    this.canvas = canvas;
    this.sample = sample;
    this.radius = radius;
    this.ctx = this.canvas.getContext('2d');
    this.notes = [];
    this.center_x = this.canvas.width / 2;
    this.center_y = this.canvas.height / 2;
    this.position = 0.0;
    this.setupElement();
  }
  Part.prototype.setupElement = function() {
    var ctx, element;
    element = $('<canvas>');
    element.attr({
      width: this.radius / 3,
      height: this.radius / 3
    });
    $('#control').append(element);
    ctx = element[0].getContext('2d');
    circle(ctx, this.radius / 6, this.radius / 6, this.radius / 10, true);
    return element.click(__bind(function() {
      return this.push(-this.position, true);
    }, this));
  };
  Part.prototype.html909 = new HTML909();
  Part.prototype.play = function() {
    return this.html909.play(this.sample);
  };
  Part.prototype.push = function(position, mute) {
    return this.notes.push({
      position: position,
      hit: !mute
    });
  };
  Part.prototype.step = function(position) {
    var note, x, y, _i, _len, _ref, _results;
    this.position = position;
    _ref = this.notes;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      note = _ref[_i];
      x = this.getX(position + note.position);
      y = this.getY(position + note.position);
      circle(this.ctx, x, y, this.radius / 10, false);
      _results.push(x > this.center_x && !note.hit ? (note.hit = true, this.play(), circle(this.ctx, x, y, this.radius / 4, true)) : x < this.center_x && note.hit ? note.hit = false : void 0);
    }
    return _results;
  };
  Part.prototype.getX = function(position) {
    return this.center_x + Math.sin(position) * this.radius;
  };
  Part.prototype.getY = function(position) {
    return this.center_y - Math.cos(position) * this.radius;
  };
  return Part;
})();
$(function() {
  var canvas, ctx, height, hh, kick, last, parts, position, rim, width;
  canvas = $('canvas')[0];
  width = canvas.width;
  height = canvas.height;
  ctx = canvas.getContext('2d');
  parts = [];
  kick = new Part(canvas, 'BT0A0A7.WAV', 240);
  kick.push(Math.PI * 0.0);
  parts.push(kick);
  hh = new Part(canvas, 'HHCD2.WAV', 140);
  parts.push(hh);
  rim = new Part(canvas, 'HANDCLP1.WAV', 50);
  parts.push(rim);
  position = 0.0;
  last = Date.now();
  return window.setInterval(function() {
    var bpm, now, part, _i, _len, _results;
    ctx.clearRect(0, 0, width, height);
    bpm = +$('input#speed').val();
    now = Date.now();
    position += bpm / 60.0 * (now - last) / 1000 * Math.PI * 0.5;
    last = now;
    if (position > Math.PI * 2.0) {
      position -= Math.PI * 2.0;
    }
    _results = [];
    for (_i = 0, _len = parts.length; _i < _len; _i++) {
      part = parts[_i];
      _results.push(part.step(position));
    }
    return _results;
  }, 50);
});