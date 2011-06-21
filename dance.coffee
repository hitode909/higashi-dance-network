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
    ,50

  addPart: (callback) ->
    @radius += 50
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
          left: Math.sin(@position - note.position) * part.radius + stageWidth / 2 - 30
          top: - Math.cos(@position - note.position) * part.radius + stageHeight / 2 - 30
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

  $('button#add-a').click ->
    note1 =
      type: 'pulse'
      hz: Math.random() * 4000
      time: 400 * Math.random()
      rate: Math.random()

    part1 = stage.addPart ->
      Beep.play note1

    part1.addNote(stage.position)


  $('button#add-b').click ->
    note2 = [
      {type: 'pulse', hz: Math.random() * 4000, time: 100 * Math.random(), rate: Math.random()},
      {type: 'pulse', hz: Math.random() * 4000, time: 100 * Math.random(), rate: Math.random()},
      {type: 'pulse', hz: Math.random() * 4000, time: 100 * Math.random(), rate: Math.random()},
      ]

    part2 = stage.addPart ->
      Beep.play note2

    part2.addNote(stage.position)

  $('button#add-c').click ->
    note3 = {type: 'whiteNoise', time: 400 * Math.random()}

    part3 = stage.addPart ->
      Beep.play note3

    part3.addNote(stage.position)

  $('button#add-d').click ->
    note4 = {type: 'brownNoise', time: 400 * Math.random()}

    part4 = stage.addPart ->
      Beep.play note4

    part4.addNote(stage.position)

  $('button#add-a').click()