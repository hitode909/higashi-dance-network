# TODO
# - canvas使わないようにする
# - 軌道を■とかにする
# - YouTube再生できるようにする
# - ぼたんを押すとパートが増える

circle = (ctx, x, y, r, fill) ->
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI*2, true);
  ctx.closePath()
  ctx.stroke()
  ctx.fill() if fill

class Part
  constructor: (@canvas, @sample, @radius) ->
    @ctx = @canvas.getContext('2d')
    @notes = []
    @center_x = @canvas.width / 2
    @center_y = @canvas.height / 2
    @position = 0.0
    this.setupElement()

  setupElement: () ->
    element = $('<canvas>')
    element.attr
      width: @radius / 3
      height: @radius / 3
    $('#control').append(element)
    ctx = element[0].getContext('2d')
    circle(ctx, @radius/6, @radius/6, @radius/10, true)

    element.click =>
      this.push(-@position, true)

  html909: new HTML909()

  play: ()->
    this.html909.play(@sample)

  push: (position, mute) ->
    @notes.push
      position: position
      hit: !mute

 # position: 0 ~ 2pi
  step: (position) ->
    @position = position
    for note in @notes
      x = this.getX(position + note.position)
      y = this.getY(position + note.position)
      circle(@ctx, x, y, @radius / 10, false)
      if x > @center_x && !note.hit
        note.hit = true
        this.play()
        circle(@ctx, x, y, @radius / 4, true)
      else if x < @center_x && note.hit
        note.hit = false

  getX: (position) ->
    @center_x + Math.sin(position) * @radius
  getY: (position) ->
    @center_y - Math.cos(position) * @radius


$ ->
  canvas = $('canvas')[0]
  width = canvas.width
  height = canvas.height
  ctx = canvas.getContext('2d')
  parts = []

  kick = new Part(canvas, 'BT0A0A7.WAV', 240)
  kick.push(Math.PI * 0.0)
  # kick.push(Math.PI * 0.5)
  # kick.push(Math.PI * 1.0)
  # kick.push(Math.PI * 1.5)
  parts.push(kick)

  hh = new Part(canvas, 'HHCD2.WAV', 140)
  parts.push(hh)

  rim = new Part(canvas, 'HANDCLP1.WAV', 50)
  parts.push(rim)

  position = 0.0

  last = Date.now()

  window.setInterval ->
      ctx.clearRect(0, 0, width, height)
      bpm = +$('input#speed').val()
      now = Date.now()
      position += bpm / 60.0 * (now - last) / 1000 * Math.PI * 0.5
      last = now
      position -= Math.PI * 2.0 if position > Math.PI * 2.0
      for part in parts
        part.step(position)
    ,50
