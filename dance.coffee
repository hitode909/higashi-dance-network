# TODO
# - canvas使わないようにする
# - 軌道を■とかにする
# - YouTube再生できるようにする
# - ぼたんを押すとパートが増える

class Stage
  constructor: (@container) ->
    @parts = []
    @radius = 0
    @position = 0.0
    @loopCount = 0
    @last = Date.now()

    setInterval =>
      this.observe()
    ,100

  addPart: (callback) ->
    @radius += 100
    part = new Part
    part.callback = callback
    part.radius = @radius
    @parts.push(part)
    button = $('<button>OK</button>')
    $('#control').append(button)
    button.click =>
      part.addNote(@position)
      console.log part
    part

  observe: ->
    bpm = +$('input#speed').val()
    now = Date.now()
    @position += bpm / 60.0 * (now - @last) / 1000 * Math.PI * 0.5

    if @position > Math.PI * 2.0
      @position -= Math.PI * 2.0
      @loopCount++

    if @position < 0.0
      @position += Math.PI * 2.0
      @loopCount++

    for part in @parts
      part.observe(@loopCount, @position)
    this.plot()
    @last = now

  plot: ->
    stage = $('#stage')
    stageWidth = stage.width()
    stageHeight = stage.height()
    stage.empty()
    for part in @parts
      for note in part.notes
        elem = $('<img>')
        elem.attr
          src: if note.playing then 'bucho.png' else 'ossan.png'
        elem.css
          position: 'absolute'
          left: Math.sin(@position - note.position) * part.radius + stageWidth / 2
          top: - Math.cos(@position - note.position) * part.radius + stageHeight / 2
        stage.append(elem)

class Part
  constructor: ->
    @notes = []

  observe: (loopCount, position) ->
    for note in @notes
      note.observe(loopCount, position)

  play: (note)->
    note.started()
    @callback().next ->
      note.ended()

  addNote: (position) ->
    @notes.push(new Note(this, position))

class Note
  constructor: (@part, @position) ->
    @playing = false
    @lastLoop = 0

  observe: (count, position) ->
    if count > @lastLoop && position > @position && ! @playing
      @part.play(this)
      @lastLoop = count


  started: ->
    @playing = true

  ended: ->
    @playing = false


$ ->
  stage = new Stage($('#stage'))
  part = stage.addPart ->
    Beep.playPulse(220, 100)
  part.addNote(0.0)
  part.addNote(Math.PI * 1.0)

  part = stage.addPart ->
    Beep.playPulse(2000, 200, 0.7, 0.3)
  part.addNote(Math.PI * 0.75)

  part = stage.addPart ->
    Beep.playBrownNoise(5, 100, 0.5)
  part.addNote(Math.PI * 1.75)

