Beep =
  play: (args) ->
    samples = []
    if $.isArray(args)
      $.each args, (i, v) =>
        samples = samples.concat(this.getSamples(v))
    else
      samples = samples.concat(this.getSamples(args))

    this.playSamples(samples)

  getSamples: (args) ->
    type = args.type || 'sin'
    type = type[0].toUpperCase() + type[1..-1]
    method = "get#{ type }Samples"
    this[method](args)

  playSamples: (samples) ->
    signals = this._samplesToSignals(samples)
    url = this._convertSignalsToURL(signals)
    this._playURL(url)

  getSinSamples: (args) ->
    hz = args.hz || 440
    release = args.release
    time = args.time || 500
    time = 4000 if release
    volume = args.volume || 0.7
    samplingRate = 44100
    samples = []
    requiredLength = Math.floor(samplingRate * time * 0.001)
    freq = hz * 2.0 * Math.PI / samplingRate

    phase = 0.0
    for i in [0..requiredLength]
      samples.push Math.sin(phase) * 10000 * volume
      volume *= release if release
      phase += freq
      break if volume < 0.005

    samples

  getPulseSamples: (args) ->
    hz = args.hz || 440
    release = args.release
    time = args.time || 500
    time = 4000 if release
    volume = args.volume || 0.7
    rate = args.rate || 0.5
    samplingRate = 44100
    samples = []
    requiredLength = Math.floor(samplingRate * time * 0.001)
    changeAt = Math.floor(samplingRate / hz);
    value = 0.5

    for i in [0..requiredLength]
      if value > 0
        value *= -1.0 if i % Math.floor(changeAt * rate) == 0
      else
        value *= -1.0 if i % changeAt == 0
      samples.push value * 10000 * volume
      volume *= release if release
      break if volume < 0.005
    samples

  getMuteSamples: (args) ->
    time = args.time || 500
    samplingRate = 44100
    samples = []
    requiredLength = Math.floor(samplingRate * time * 0.001)

    for i in [0..requiredLength]
      samples.push(0.0)

    samples

  getWhiteNoiseSamples: (args) ->
    time = args.time || 500
    volume = args.volume || 0.7
    rate = args.rate || 1.0
    changeAt = 1.0 / rate

    change = 1 if change < 1
    volume ?= 0.7
    samplingRate = 44100
    samples = []
    requiredLength = Math.floor(samplingRate * time * 0.001)
    get = ->
      Math.random() * 2 - 1.0
    value = get()

    for i in [0..requiredLength]
      value = get() if (i % changeAt) == 0
      samples.push value * 10000 * volume

    samples

  getBrownNoiseSamples: (args) ->
    time = args.time || 500
    volume = args.volume || 0.7
    rate = args.rate || 1.0
    changeAt = 1.0 / rate

    change = 1 if change < 1
    volume ?= 0.7
    samplingRate = 44100
    samples = []
    requiredLength = Math.floor(samplingRate * time * 0.001)
    value = 0.0

    for i in [0..requiredLength]
      value += (Math.random() - 0.5) if (i % changeAt) == 0
      value = 1.0 if value > 1.0
      value = -1.0 if value < -1.0
      samples.push value * 10000 * volume

    samples

  _samplesToSignals: (samples) ->
    signals = ''
    for i in samples
      signals += String.fromCharCode(i & 0xff) + String.fromCharCode(i >> 8 & 0xff)
    signals

  _convertSignalsToURL: (signals) ->
    header = "WAVEfmt " + String.fromCharCode(16, 0, 0, 0);
    header += String.fromCharCode(1, 0) #  format id
    header += String.fromCharCode(1, 0) #  channels
    header += String.fromCharCode(68, 172, 0, 0) #  sampling rate
    header += String.fromCharCode(68, 172, 0, 0) #  byte/sec
    header += String.fromCharCode(2, 0) #  block size
    header += String.fromCharCode(16, 0) #  byte/sample
    header += "data" # data chunk label

    siglen = signals.length;

    sigsize = String.fromCharCode(
      (siglen >> 0 & 0xFF)
      (siglen >> 8 & 0xFF)
      (siglen >> 16 & 0xFF)
      (siglen >> 24 & 0xFF)
    )

    header += sigsize;
    wavlen = header.length + signals.length;
    riff = "RIFF"
    riff += String.fromCharCode((wavlen >> 0 & 0xFF),
      (wavlen >> 8 & 0xFF),
      (wavlen >> 16 & 0xFF),
      (wavlen >> 24 & 0xFF))
    wavefile = riff + header + signals
    "data:audio/wav;base64," + Base64.encode(wavefile)

  _playURL: (url) ->
    deferred = new Deferred()
    $audio = $('<audio>').attr
      src: url
    $('body').append($audio)
    $audio.bind 'canplay', ->
      this.play()
    $audio.bind 'ended', ->
      $(this).remove()
      deferred.call()

    deferred
