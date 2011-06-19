var Beep, gomi;
Beep = {
  playSamples: function(samples) {
    var signals, url;
    signals = this._samplesToSignals(samples);
    url = this._convertSignalsToURL(signals);
    return this._playURL(url);
  },
  playSin: function(hz, time, volume) {
    var freq, i, phase, requiredLength, samples, samplingRate;
        if (volume != null) {
      volume;
    } else {
      volume = 0.7;
    };
    samplingRate = 44100;
    samples = [];
    requiredLength = Math.floor(samplingRate * time * 0.001);
    freq = hz * 2.0 * Math.PI / samplingRate;
    phase = 0.0;
    for (i = 0; 0 <= requiredLength ? i <= requiredLength : i >= requiredLength; 0 <= requiredLength ? i++ : i--) {
      samples.push(Math.sin(phase) * 10000 * volume);
      phase += freq;
    }
    return this.playSamples(samples);
  },
  playPulse: function(hz, time, rate, volume) {
    var changeAt, i, requiredLength, samples, samplingRate, value;
        if (rate != null) {
      rate;
    } else {
      rate = 0.5;
    };
        if (volume != null) {
      volume;
    } else {
      volume = 0.7;
    };
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
    }
    return this.playSamples(samples);
  },
  playWhiteNoise: function(changeAt, time, volume) {
    var change, get, i, requiredLength, samples, samplingRate, value;
        if (changeAt != null) {
      changeAt;
    } else {
      changeAt = 1;
    };
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
    return this.playSamples(samples);
  },
  playBrownNoise: function(changeAt, time, volume) {
    var change, i, requiredLength, samples, samplingRate, value;
        if (changeAt != null) {
      changeAt;
    } else {
      changeAt = 1;
    };
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
    return this.playSamples(samples);
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
gomi = function() {
  return setInterval(function() {
    var hz, i, _ref, _ref2, _ref3;
    hz = 100;
    for (i = 0, _ref = Math.floor(Math.random() * 8); 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
      hz += 10;
    }
    Beep.playSin(hz, 4);
    hz = 400;
    for (i = 0, _ref2 = Math.floor(Math.random() * 8); 0 <= _ref2 ? i <= _ref2 : i >= _ref2; 0 <= _ref2 ? i++ : i--) {
      hz += 40;
    }
    Beep.playSin(hz, 4);
    hz = 1000;
    for (i = 0, _ref3 = Math.floor(Math.random() * 8); 0 <= _ref3 ? i <= _ref3 : i >= _ref3; 0 <= _ref3 ? i++ : i--) {
      hz += 100;
    }
    Beep.playSin(hz, 4);
    return new HTML909().play(Math.random() > 0.7 ? 'BT0A0A7.WAV' : 'HANDCLP1.WAV');
  }, 4000);
};
$(function() {});