var Oneliner, Shiki, choise, genColorValue, load_images, main, randomColor;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
Shiki = (function() {
  function Shiki(variable_name) {
    this.variable_name = variable_name;
    this.root = new Shiki.Operator('*');
    this.root.left = new Shiki.Operand.Variable(this.variable_name);
    this.root.right = new Shiki.Operand.Number(1);
  }
  Shiki.prototype.getFunction = function() {
    return eval(("(function(" + this.variable_name + "){return ") + this.getString() + ";})");
  };
  Shiki.prototype.getString = function() {
    return this.root.getString();
  };
  Shiki.prototype.step = function() {
    var after, before, i, node, _results;
    i = 0;
    before = this.root.getString();
    after = before;
    _results = [];
    while (i < 10 && before === after) {
      node = this.getRandomOperator(this.root);
      Shiki.choise([this.wrapNode, this.cutNode, this.bang]).apply(this, [node]);
      after = this.root.getString();
      _results.push(i++);
    }
    return _results;
  };
  Shiki.prototype.getRandomOperator = function(root) {
    var current, index;
    current = root;
    while (Math.random() < 0.3) {
      index = current.randomIndex();
      if (current[index].isOperator) {
        current = current[index];
      } else {
        return current;
      }
    }
    return current;
  };
  Shiki.prototype.getRandomNode = function(root) {
    var current;
    current = root;
    while (current.isOperator && Math.random() < 0.8) {
      current = current[current.randomIndex()];
    }
    return current;
  };
  Shiki.prototype.getRandomOperand = function(root) {
    var current;
    current = root;
    while (current.isOperator) {
      current = current[current.randomIndex()];
    }
    return current;
  };
  Shiki.prototype.wrapNode = function(node) {
    var index, lr, operator;
    index = node.randomIndex();
    operator = this.randomOperator();
    lr = [node[index], this.randomInstance()];
    if (Math.random() > 0.5) {
      lr = [lr[1], lr[0]];
    }
    operator.left = lr[0];
    operator.right = lr[1];
    return node[index] = operator;
  };
  Shiki.prototype.cutNode = function(node) {
    var child, index;
    index = node.randomIndex();
    child = this.getRandomNode(node[index]);
    return node[index] = child;
  };
  Shiki.prototype.bang = function(node) {
    return node.bang();
  };
  Shiki.prototype.changeValue = function(node) {
    return node[node.randomIndex()] = this.randomInstance();
  };
  Shiki.prototype.randomOperator = function() {
    var r;
    r = new Shiki.Operator(Shiki.choise(Shiki.Operator.operators));
    r.left = this.randomInstance();
    r.right = this.randomInstance();
    return r;
  };
  Shiki.prototype.randomInstance = function() {
    var rand;
    rand = Math.random();
    if (rand > 0.7) {
      return this.randomOperator();
    } else if (rand > 0.4) {
      return new Shiki.Operand.Number;
    } else {
      return new Shiki.Operand.Variable(this.variable_name);
    }
  };
  return Shiki;
})();
Shiki.choise = function(list) {
  return list[Math.floor(Math.random() * list.length)];
};
Shiki.Operator = (function() {
  function Operator(operator) {
    if (operator != null) {
      this.operator = operator;
    } else {
      this.bang();
    }
    this.left = new Shiki.Operand(0);
    this.right = new Shiki.Operand(0);
  }
  Operator.prototype.getString = function() {
    return "(" + [this.left.getString(), this.operator, this.right.getString()].join('') + ")";
  };
  Operator.prototype.bang = function() {
    this.operator = Shiki.choise(Shiki.Operator.operators);
    if (this.left) {
      this.left.bang();
    }
    if (this.right) {
      return this.right.bang();
    }
  };
  Operator.prototype.isOperator = true;
  Operator.prototype.randomIndex = function() {
    return Shiki.choise(['left', 'right']);
  };
  return Operator;
})();
Shiki.Operator.operators = '* % / + & | ^ << >>'.split(/\s+/);
Shiki.Operand = (function() {
  function Operand(value) {
    this.value = value;
  }
  Operand.prototype.getString = function() {
    return this.value;
  };
  Operand.prototype.isOperator = false;
  return Operand;
})();
Shiki.Operand.Variable = (function() {
  __extends(Variable, Shiki.Operand);
  function Variable() {
    Variable.__super__.constructor.apply(this, arguments);
  }
  Variable.prototype.bang = function() {};
  return Variable;
})();
Shiki.Operand.Number = (function() {
  __extends(Number, Shiki.Operand);
  function Number() {
    this.bang();
  }
  Number.prototype.bang = function() {
    return this.value = Math.floor(Math.random() * 10) + 1;
  };
  return Number;
})();
Oneliner = function(_args) {
  this._ = {};
  this._.func = function(t) {
    return t;
  };
  return this._.phase = 0;
};
Oneliner.prototype.seq = function(seq_id) {
  var cell, i, len, _;
  _ = this._;
  cell = this.cell;
  if (this.seq_id !== seq_id) {
    this.seq_id = seq_id;
    i = 0;
    len = cell.length;
    while (i < len) {
      cell[i] = (((_.func(_.phase | 0) % 256) / 128.0) - 1.0) * _.mul + _.add;
      _.phase += 8000 / timbre.samplerate;
      i++;
    }
  }
  return cell;
};
Object.defineProperty(Oneliner.prototype, "func", {
  set: function(value) {
    if (typeof value === "function") {
      return this._.func = value;
    }
  },
  get: function() {
    return this._.func;
  }
});
timbre.fn.register("oneliner", Oneliner);
choise = function(array) {
  return array[Math.floor(Math.random() * array.length)];
};
genColorValue = function() {
  if (Math.random() > 0.5) {
    return 255;
  } else {
    return 0;
  }
};
randomColor = function() {
  return "hsl(" + (Math.random() * 360) + ", 100% ,50%)";
};
load_images = function(srces) {
  var dfd, img, imgs, loaded_count, src, _i, _len;
  dfd = $.Deferred();
  imgs = [];
  loaded_count = 0;
  for (_i = 0, _len = srces.length; _i < _len; _i++) {
    src = srces[_i];
    img = new Image;
    img.src = src;
    imgs.push(img);
    img.onload = function() {
      loaded_count++;
      if (loaded_count === srces.length) {
        return dfd.resolve(imgs);
      }
    };
  }
  return dfd.promise();
};
main = function(sources) {
  var baseThreshold, bottomRate, canvas, canvasHeight, canvasWidth, characterColor, characterHeight, characterWidth, character_images, character_images_rest, clearStage, ctx, dac, drawCharacter, drawEarth, fft, footerHeight, indexes, oneliner, resetStage, resizeCanvas, setCharacterColor, setIndexes, setTracks, timer, tracks, zeroTimes;
  character_images = sources.images;
  character_images_rest = character_images.slice(1, (character_images.length + 1) || 9e9);
  oneliner = T("oneliner");
  tracks = [];
  setTracks = function() {
    var t, _i, _ref, _results;
    tracks = [];
    _results = [];
    for (_i = 0, _ref = 8 - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--) {
      t = new Shiki('t');
      t.step();
      t.step();
      _results.push(tracks.push(t));
    }
    return _results;
  };
  setTracks();
  indexes = [];
  setIndexes = function() {
    var i;
    return indexes = (function() {
      var _ref, _results;
      _results = [];
      for (i = 0, _ref = tracks.length * 2 - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        _results.push(Math.floor((i / 2) % tracks.length));
      }
      return _results;
    })();
  };
  setIndexes();
  canvas = $('canvas')[0];
  canvasWidth = 0;
  canvasHeight = 0;
  ctx = canvas.getContext('2d');
  resizeCanvas = _.throttle(function() {
    canvasWidth = $(window).width();
    if (canvasWidth < 1040) {
      canvasWidth = 1040;
    }
    canvasHeight = $(window).height();
    canvas.width = canvasWidth;
    return canvas.height = canvasHeight;
  });
  $(window).resize(function() {
    return resizeCanvas();
  });
  resizeCanvas();
  characterWidth = 250;
  characterHeight = 400;
  baseThreshold = 0.2;
  bottomRate = 0.9;
  footerHeight = 70;
  characterColor = randomColor();
  setCharacterColor = function() {
    return characterColor = randomColor();
  };
  resetStage = function() {
    setTracks();
    setIndexes();
    return setCharacterColor();
  };
  clearStage = function() {
    ctx.fillStyle = 'white';
    return ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  drawCharacter = function(index, power) {
    var bottom, chara, left, offsetOne, offsetTotal;
    offsetTotal = canvasWidth - characterWidth * 4;
    if (offsetTotal < 0) {
      offsetTotal = 0;
    }
    offsetOne = offsetTotal / 5;
    left = offsetOne + (characterWidth + offsetOne) * index;
    bottom = _.min([canvasHeight * bottomRate, canvasHeight - footerHeight]);
    chara = choise(character_images_rest);
    if (power < 0.2) {
      chara = character_images[0];
    }
    ctx.fillStyle = characterColor;
    ctx.fillRect(Math.floor(left), Math.floor(bottom - power * 50 - characterHeight), characterWidth, characterHeight);
    return ctx.drawImage(chara, Math.floor(left), Math.floor(bottom - power * 50 - characterHeight), characterWidth, characterHeight);
  };
  drawEarth = function(power) {
    var bottom;
    bottom = _.min([canvasHeight * bottomRate, canvasHeight - footerHeight]) - power * 50;
    ctx.fillStyle = characterColor;
    return ctx.fillRect(0, bottom, canvasWidth, canvasHeight);
  };
  fft = T("fft").listen(oneliner).off();
  fft.interval = 25;
  fft.noSpectrum = true;
  zeroTimes = 0;
  fft.onfft = function(res) {
    var absv, half, i, len, segments, sum, v, _len, _ref, _results;
    len = 0;
    sum = 0;
    segments = [0, 0, 0, 0];
    half = res.length / 2;
    for (i = 0, _len = res.length; i < _len; i++) {
      v = res[i];
      if (i < 2) {
        continue;
      }
      if (i > half) {
        break;
      }
      if (isNaN(v)) {
        continue;
      }
      absv = Math.abs(v);
      sum += absv;
      len++;
      segments[Math.floor(i * segments.length / half)] += absv;
    }
    if (len > 0) {
      sum /= len;
      for (i = 0, _ref = segments.length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        segments[i] = segments[i] / len * segments.length;
      }
    }
    if (zeroTimes * fft.interval > 1000) {
      resetStage();
      zeroTimes = 0;
    }
    if (sum < 1.0) {
      zeroTimes++;
    } else if (zeroTimes > 0) {
      zeroTimes = 0;
    }
    segments[1] *= 3;
    segments[2] *= 4;
    segments[3] *= 8;
    clearStage();
    drawEarth(sum);
    _results = [];
    for (i = 0; i <= 3; i++) {
      _results.push(drawCharacter(i, segments[i]));
    }
    return _results;
  };
  dac = T("*", oneliner, 1.0);
  dac.play();
  fft.on();
  timer = null;
  timer = T("interval", 125, function() {
    var i, track;
    i = timer.count;
    track = tracks[indexes[i % indexes.length]];
    oneliner.func = track.getFunction();
    if (Math.random() < 0.05) {
      track.step();
      oneliner.func = track.getFunction();
    }
    if (Math.random() < 0.1) {
      indexes[i % indexes.length] = Math.floor(Math.random() * tracks.length);
    }
    if (Math.random() < 0.1) {
      indexes[i % indexes.length] = indexes[(i + indexes.length - 1) % indexes.length];
    }
    if (i % indexes.length === indexes.length - 1) {
      if (Math.random() < 0.5 && indexes.length > 2) {
        return indexes = indexes.slice(0, indexes.length / 2);
      } else if (Math.random() < 0.5) {
        return indexes = indexes.concat(indexes);
      }
    }
  });
  timer.on();
  $('body').click(function() {
    if ($(this).is('a')) {
      return;
    }
    return resetStage();
  });
  $('.sound-off').click(function() {
    dac.play();
    $('#volume').toggleClass('on');
    return false;
  });
  return $('.sound-on').click(function() {
    dac.pause();
    $('#volume').toggleClass('on');
    return false;
  });
};
$(function() {
  var message;
  if (!timbre.env) {
    message = $('<div>');
    message.addClass('sorry');
    message.text('Google ChromeかFirefoxで見てください');
    $('body').append(message);
    $('#footer').css({
      background: 'black'
    });
    return;
  }
  return load_images(['/bon3/image/image1.png', '/bon3/image/image2.png', '/bon3/image/image3.png', '/bon3/image/image4.png', '/bon3/image/image5.png', '/bon3/image/image6.png']).then(function(images) {
    if (navigator.userAgent.match(/(iPhone|iPad)/)) {
      $('#tap-to-start').show();
      $('#footer').addClass('wait-touch');
      return $(document).click(_.once(function() {
        $('#tap-to-start').hide();
        $('#footer').removeClass('wait-touch');
        return main({
          images: images
        });
      }));
    } else {
      return main({
        images: images
      });
    }
  });
});