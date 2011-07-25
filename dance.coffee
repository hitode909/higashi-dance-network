window.requestAnimationFrame = (->
  window.requestAnimationFrame		||
  window.webkitRequestAnimationFrame	||
  window.mozRequestAnimationFrame		||
  window.oRequestAnimationFrame		||
  window.msRequestAnimationFrame		||
  (callback, element) ->
    window.setTimeout ->
      callback
    , 1000 / 60
)()

Dial = (container, callback) ->
  last = null
  center =
    left: $(container).position().left + $(container).width() / 2
    top:  $(container).position().top  + $(container).height() / 2
  $(container).mousemove $.throttle 100, (event) ->
    x = event.pageX - center.left
    y = event.pageY - center.top
    distance = Math.sqrt(x * x + y * y)
    rad = Math.atan(y / x)
    rad += Math.PI if x < 0
    last ?= rad
    diff = rad - last
    diff += Math.PI * 2 if diff < -Math.PI
    diff -= Math.PI * 2 if diff > Math.PI
    callback(diff, distance)
    last = rad

class Stage
  constructor: (@container) ->
    @parts = []
    @position = Math.PI * 3.0
    @loopCount = 0
    @last = Date.now()
    @bpm = 120.0
    @fps = 0
    @minRadius = 175

    animationLoop = =>
      this.observe()
      window.requestAnimationFrame(animationLoop)
    animationLoop()

  addPart: (callback) ->
    radius = 0
    if @parts.length > 0
      radius = @parts[@parts.length-1].getRadius() + @parts[@parts.length-1].getImageRadius()*2
    radius = @minRadius + Part.prototype.ImageRadius if radius < @minRadius
    part = new Part
    part.callback = callback
    part.radius = radius
    @parts.push(part)
    part

  observe: ->
    @fps++
    now = Date.now()
    @position += @bpm / 60.0 * (now - @last) / 1000 * Math.PI * 0.5

    while @position > Math.PI * 4.0
      @position -= Math.PI * 2.0

    while @position < Math.PI * 2.0
      @position += Math.PI * 2.0

    kills = []

    for part in @parts
      part.observe(@position, @bpm)
      kills.push(part) if part.getRadius() + part.getImageRadius() * 2 < @minRadius
    this.plot()

    for part in kills
      this.killPart(part)

    @last = now

  plot: ->
    stage = $('#stage')
    stageWidth = stage.width()
    stageHeight = stage.height()
    for part in @parts
      unless part.elem
        part.elem = $('<img>')
        part.elem.attr
          src: 'ossan_center.png'
        part.elem.addClass 'part'
        stage.append(part.elem)

      part.elem.css
        width: part.getImageRadius() * 2 + part.getRadius() * 2
        height: part.getImageRadius() * 2 + part.getRadius() * 2
        left: stageWidth  / 2 - part.getRadius() - part.getImageRadius()
        top:  stageHeight / 2 - part.getRadius() - part.getImageRadius()
        'z-index': parseInt(stageWidth  / 2 - part.getRadius()) + 5000
      part.elem.attr
        src: if part.radius == this.hoveringPartId then 'ossan1.png' else 'ossan_center.png'

      rate = part.getRate()
      for note in part.notes
        unless note.elem
          note.elem = $('<img>')
          note.elem.addClass 'note'
          stage.append(note.elem)

        img_size = if note.playing then 100 else 60

        note.elem.css
          left: (Math.sin(@position - note.position) * part.getRadius()) - part.getImageRadius() + stageWidth  / 2
          top: (-Math.cos(@position - note.position) * part.getRadius()) - part.getImageRadius() + stageHeight / 2
          width: part.getImageRadius() * 2
          height: part.getImageRadius() * 2

        note.elem.attr
          src: if note.playing then 'ossan2.png' else 'ossan1.png'

  killPart: (part) ->
    @parts = $.grep @parts, (v) ->
      v.radius != part.radius

    part.kill()

  getPartAtDistance: (distance) ->
    got = null
    for part in @parts.reverse()
      do (part) ->
        if part.getRadius() + part.getImageRadius() > distance
          got = part
    @parts.reverse()
    got

  actionAtDistance: (distance) ->
    part = this.getPartAtDistance(distance)
    unless part
      note =
        type: 'pulse'
        hz: Math.random() * 4000
        time: 400 * Math.random()
        rate: Math.random()

      if Math.random() < 0.2
        note = [
          {type: 'pulse', hz: Math.random() * 4000, time: 100 * Math.random(), rate: Math.random()},
          {type: 'pulse', hz: Math.random() * 4000, time: 100 * Math.random(), rate: Math.random()},
          {type: 'pulse', hz: Math.random() * 4000, time: 100 * Math.random(), rate: Math.random()},
        ]

      if Math.random() < 0.1
        note = {type: 'whiteNoise', time: 400 * Math.random() * Math.random()}

      if Math.random() < 0.1
        note = {type: 'brownNoise', time: 400 * Math.random() * Math.random()}

      part = this.addPart (volume) ->
        note.volume = volume
        Beep.play note

    pos = this.position
    part.addNote(pos)

class Part
  constructor: ->
    @notes = []
    @lastPosition = 0.0
    @birth = Date.now()

  ImageRadius: 30,

  getRate: ->
    limit = @radius * 500
    age = (Date.now() - @birth)
    rate = (limit - age) / limit
    rate = 0.0 if rate < 0.0
    rate

  getRadius: ->
    @radius * this.getRate()

  getImageRadius: ->
    Part.prototype.ImageRadius * this.getRate()

  observe: (position, bpm) ->
    offset = 0.0
    if bpm > 0 && position < @lastPosition
      offset = Math.PI * 2
    if bpm < 0 && position > @lastPosition
      offset = -Math.PI * 2

    position_offset = position + offset
    for note in @notes
      note.observe(position_offset, @lastPosition)

    @lastPosition = position

  play: (note)->
    return if note.playing
    note.started()
    @callback(Math.pow(this.getRate(), 3)).next ->
      note.ended()

  addNote: (position) ->
    note = new Note(this, position)
    @notes.push(note)
    this.play(note)

  kill: ->
    @elem.remove()
    for note in @notes
      note.elem.remove()

class Note
  constructor: (@part, @position) ->
    @playing = false
    while @position > Math.PI * 4.0
      @position -= Math.PI * 2.0

    while @position < Math.PI * 2.0
      @position += Math.PI * 2.0

  observe: (position, lastPosition) ->
    a = @position - position
    b = @position - lastPosition
    if a * b <= 0
      @part.play(this)

  started: ->
    @playing = true

  ended: ->
    @playing = false

$ ->
  stage = new Stage($('#stage'))

  setInterval ->
    $('#fps').text(stage.fps)
    stage.fps = 0
  ,1000

  Deferred.wait(1).next ->
    Dial $('#stage'), (diff, distance) ->
      stage.bpm += diff * 32
      part = stage.getPartAtDistance(distance)
      stage.hoveringPartId = if part then part.radius else null

  $('#stage').click (event) ->
    container = $('#stage')
    center =
      left: container.position().left + container.width() / 2
      top:  container.position().top  + container.height() / 2
    x = event.pageX - center.left
    y = event.pageY - center.top
    distance = Math.sqrt(x * x + y * y)
    stage.actionAtDistance(distance)

  yonaList = [0, 2, 5, 7, 9, 12]
  getNote = (base) ->
    type: 'sin'
    hz: base * Math.pow(Math.pow(2, 1/12), yonaList[Math.floor(Math.random()*yonaList.length)])
    release: 0.9999

  playYona = (base) ->
    Beep.play(getNote(base))
    Deferred.wait(Math.abs(120 / stage.bpm) * (if Math.random() > 0.6 then 1 else (if Math.random() > 0.5 then 0.5 else 2.0))).next ->
      playYona(base);

  playYona(330);
  playYona(110);
