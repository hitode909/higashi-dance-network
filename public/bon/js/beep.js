var Beep;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Beep = {
  play: function(args) {
    var samples;
    samples = [];
    if ($.isArray(args)) {
      $.each(args, __bind(function(i, v) {
        return samples = samples.concat(this.getSamples(v));
      }, this));
    } else {
      samples = samples.concat(this.getSamples(args));
    }
    return this.playSamples(samples);
  },
  getSamples: function(args) {
    var method, type;
    type = args.type || 'sin';
    type = type[0].toUpperCase() + type.slice(1);
    method = "get" + type + "Samples";
    return this[method](args);
  },
  playSamples: function(samples) {
    var signals, url;
    signals = this._samplesToSignals(samples);
    url = this._convertSignalsToURL(signals);
    return this._playURL(url);
  },
  getSinSamples: function(args) {
    var freq, hz, i, phase, release, requiredLength, samples, samplingRate, time, volume;
    hz = args.hz || 440;
    release = args.release;
    time = args.time || 500;
    if (release) {
      time = 4000;
    }
    volume = args.volume || 0.7;
    samplingRate = 44100;
    samples = [];
    requiredLength = Math.floor(samplingRate * time * 0.001);
    freq = hz * 2.0 * Math.PI / samplingRate;
    phase = 0.0;
    for (i = 0; 0 <= requiredLength ? i <= requiredLength : i >= requiredLength; 0 <= requiredLength ? i++ : i--) {
      samples.push(Math.sin(phase) * 10000 * volume);
      if (release) {
        volume *= release;
      }
      phase += freq;
      if (volume < 0.005) {
        break;
      }
    }
    return samples;
  },
  getPulseSamples: function(args) {
    var changeAt, hz, i, rate, release, requiredLength, samples, samplingRate, time, value, volume;
    hz = args.hz || 440;
    release = args.release;
    time = args.time || 500;
    if (release) {
      time = 4000;
    }
    volume = args.volume || 0.7;
    rate = args.rate || 0.5;
    samplingRate = 44100;
    samples = [];
    requiredLength = Math.floor(samplingRate * time * 0.001);
    changeAt = Math.floor(samplingRate / hz);
    value = 0.5;
    for (i = 0; 0 <= requiredLength ? i <= requiredLength : i >= requiredLength; 0 <= requiredLength ? i++ : i--) {
      if (value > 0) {
        if (i % Math.floor(changeAt * rate) === 0) {
          value *= -1.0;
        }
      } else {
        if (i % changeAt === 0) {
          value *= -1.0;
        }
      }
      samples.push(value * 10000 * volume);
      if (release) {
        volume *= release;
      }
      if (volume < 0.005) {
        break;
      }
    }
    return samples;
  },
  getMuteSamples: function(args) {
    var i, requiredLength, samples, samplingRate, time;
    time = args.time || 500;
    samplingRate = 44100;
    samples = [];
    requiredLength = Math.floor(samplingRate * time * 0.001);
    for (i = 0; 0 <= requiredLength ? i <= requiredLength : i >= requiredLength; 0 <= requiredLength ? i++ : i--) {
      samples.push(0.0);
    }
    return samples;
  },
  getWhiteNoiseSamples: function(args) {
    var change, changeAt, get, i, rate, requiredLength, samples, samplingRate, time, value, volume;
    time = args.time || 500;
    volume = args.volume || 0.7;
    rate = args.rate || 1.0;
    changeAt = 1.0 / rate;
    if (change < 1) {
      change = 1;
    }
        if (volume != null) {
      volume;
    } else {
      volume = 0.7;
    };
    samplingRate = 44100;
    samples = [];
    requiredLength = Math.floor(samplingRate * time * 0.001);
    get = function() {
      return Math.random() * 2 - 1.0;
    };
    value = get();
    for (i = 0; 0 <= requiredLength ? i <= requiredLength : i >= requiredLength; 0 <= requiredLength ? i++ : i--) {
      if ((i % changeAt) === 0) {
        value = get();
      }
      samples.push(value * 10000 * volume);
    }
    return samples;
  },
  getBrownNoiseSamples: function(args) {
    var change, changeAt, i, rate, requiredLength, samples, samplingRate, time, value, volume;
    time = args.time || 500;
    volume = args.volume || 0.7;
    rate = args.rate || 1.0;
    changeAt = 1.0 / rate;
    if (change < 1) {
      change = 1;
    }
        if (volume != null) {
      volume;
    } else {
      volume = 0.7;
    };
    samplingRate = 44100;
    samples = [];
    requiredLength = Math.floor(samplingRate * time * 0.001);
    value = 0.0;
    for (i = 0; 0 <= requiredLength ? i <= requiredLength : i >= requiredLength; 0 <= requiredLength ? i++ : i--) {
      if ((i % changeAt) === 0) {
        value += Math.random() - 0.5;
      }
      if (value > 1.0) {
        value = 1.0;
      }
      if (value < -1.0) {
        value = -1.0;
      }
      samples.push(value * 10000 * volume);
    }
    return samples;
  },
  _samplesToSignals: function(samples) {
    var i, signals, _i, _len;
    signals = '';
    for (_i = 0, _len = samples.length; _i < _len; _i++) {
      i = samples[_i];
      signals += String.fromCharCode(i & 0xff) + String.fromCharCode(i >> 8 & 0xff);
    }
    return signals;
  },
  _convertSignalsToURL: function(signals) {
    var header, riff, siglen, sigsize, wavefile, wavlen;
    header = "WAVEfmt " + String.fromCharCode(16, 0, 0, 0);
    header += String.fromCharCode(1, 0);
    header += String.fromCharCode(1, 0);
    header += String.fromCharCode(68, 172, 0, 0);
    header += String.fromCharCode(68, 172, 0, 0);
    header += String.fromCharCode(2, 0);
    header += String.fromCharCode(16, 0);
    header += "data";
    siglen = signals.length;
    sigsize = String.fromCharCode(siglen >> 0 & 0xFF, siglen >> 8 & 0xFF, siglen >> 16 & 0xFF, siglen >> 24 & 0xFF);
    header += sigsize;
    wavlen = header.length + signals.length;
    riff = "RIFF";
    riff += String.fromCharCode(wavlen >> 0 & 0xFF, wavlen >> 8 & 0xFF, wavlen >> 16 & 0xFF, wavlen >> 24 & 0xFF);
    wavefile = riff + header + signals;
    return "data:audio/wav;base64," + Base64.encode(wavefile);
  },
  _playURL: function(url) {
    var $audio, deferred;
    deferred = new Deferred();
    $audio = $('<audio>').attr({
      src: url
    });
    $('body').append($audio);
    $audio.bind('canplay', function() {
      return this.play();
    });
    $audio.bind('ended', function() {
      $(this).remove();
      return deferred.call();
    });
    return deferred;
  }
};