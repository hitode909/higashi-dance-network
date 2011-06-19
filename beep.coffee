Beep =
  playSamples: (samples) ->
    signals = this._samplesToSignals(samples)
    url = this._convertSignalsToURL(signals)
    this._playURL(url)

  playSin: (hz, time, volume) ->
    volume ?= 0.7
    samplingRate = 44100
    samples = []
    requiredLength = Math.floor(samplingRate * time)
    freq = hz * 2.0 * Math.PI / samplingRate

    phase = 0.0
    for i in [0..requiredLength]
      samples.push Math.sin(phase) * 10000 * volume
      phase += freq

    this.playSamples(samples)

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
    $audio = $('<audio>').attr
      src: url
    $('body').append($audio)
    $audio.bind 'canplay', ->
      this.play()
    $audio.bind 'ended', ->
      $(this).remove()


$ ->

  setInterval ->
    hz = 100
    for i in [0..Math.floor(Math.random()*8)]
      hz += 10
    Beep.playSin hz, 4

    hz = 400
    for i in [0..Math.floor(Math.random()*8)]
      hz += 40
    Beep.playSin hz, 4

    hz = 1000
    for i in [0..Math.floor(Math.random()*8)]
      hz += 100
    Beep.playSin hz, 4

    new HTML909().play if Math.random() > 0.7 then 'BT0A0A7.WAV' else 'HANDCLP1.WAV'
  , 4000
