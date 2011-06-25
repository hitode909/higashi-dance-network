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
    x = event.offsetX - center.left
    y = event.offsetY - center.top
    rad = Math.atan(y / x)
    rad += Math.PI if x < 0
    last ?= rad
    diff = rad - last
    diff += Math.PI * 2 if diff < -Math.PI
    diff -= Math.PI * 2 if diff > Math.PI
    callback(diff)
    last = rad

class Stage
  constructor: (@container) ->
    @parts = []
    @radius = 0
    @position = Math.PI * 3.0
    @loopCount = 0
    @last = Date.now()
    @bpm = 120.0

    animationLoop = =>
        this.observe()
        window.requestAnimationFrame(animationLoop)
    animationLoop()

  addPart: (callback) ->
    @radius += 60
    part = new Part
    part.callback = callback
    part.radius = @radius
    @parts.push(part)
    button = $("<button>+ #{ @radius }</button>")
    $('#control').append(button)
    button.click =>
      part.addNote(@position)
    part

  observe: ->
    now = Date.now()
    @position += @bpm / 60.0 * (now - @last) / 1000 * Math.PI * 0.5

    if @position > Math.PI * 4.0
      @position -= Math.PI * 2.0

    if @position < Math.PI * 2.0
      @position += Math.PI * 2.0

    for part in @parts
      part.observe(@position, @bpm)
    this.plot()
    @last = now

  plot: ->
    stage = $('#stage')
    stageWidth = stage.width()
    stageHeight = stage.height()
    for part in @parts
      rate = part.rate()
      for note in part.notes
        unless note.elem
          note.elem = $('<img>')
          note.elem.css
            position: 'absolute'
          stage.append(note.elem)

        img_size = if note.playing then 100 else 60

        note.elem.css
          left: (Math.sin(@position - note.position) * part.radius - img_size * 0.5) * rate + stageWidth  / 2
          top: (-Math.cos(@position - note.position) * part.radius - img_size * 0.5) * rate + stageHeight / 2
          width: img_size * rate
          opacity: rate

        note.elem.attr
          src: if note.playing then 'ossan2.png' else 'ossan1.png'


class Part
  constructor: ->
    @notes = []
    @lastPosition = 0.0
    @birth = Date.now()

  rate: ->
    age = (Date.now() - @birth)
    rate = (60000.0 - age) / 60000.0
    rate = 0.0 if rate < 0.0
    rate

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
    note.started()
    @callback(this.rate()).next ->
      note.ended()

  addNote: (position) ->
    @notes.push(new Note(this, position))

class Note
  constructor: (@part, @position) ->
    @playing = false

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

  $('button#add-a').click ->
    note1 =
      type: 'pulse'
      hz: Math.random() * 4000
      time: 400 * Math.random()
      rate: Math.random()

    part1 = stage.addPart (volume) ->
      note1.volume = volume
      Beep.play note1

    part1.addNote(stage.position * (if stage.bpm > 0 then 1 else -1))


  $('button#add-b').click ->
    note2 = [
      {type: 'pulse', hz: Math.random() * 4000, time: 100 * Math.random(), rate: Math.random()},
      {type: 'pulse', hz: Math.random() * 4000, time: 100 * Math.random(), rate: Math.random()},
      {type: 'pulse', hz: Math.random() * 4000, time: 100 * Math.random(), rate: Math.random()},
      ]

    part2 = stage.addPart (volume) ->
      note2.volume = volume
      Beep.play note2

    part2.addNote(stage.position)

  $('button#add-c').click ->
    note3 = {type: 'whiteNoise', time: 400 * Math.random() * Math.random()}

    part3 = stage.addPart (volume)->
      note3.volume = volume
      Beep.play note3

    part3.addNote(stage.position)

  $('button#add-d').click ->
    note4 = {type: 'brownNoise', time: 400 * Math.random() * Math.random()}

    part4 = stage.addPart (volume) ->
      note4.volume = volume
      Beep.play note4

    part4.addNote(stage.position)

  $('button#add-a').click()

  Deferred.wait(1).next ->
    Dial $('#stage'), (diff) ->
      stage.bpm += diff * 4
      $('input#speed').val(stage.bpm)

  $('input#speed').change ->
    stage.bpm = +$(this).val()

