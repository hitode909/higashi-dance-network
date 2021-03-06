class Shiki
  constructor: (variable_name) ->
    @variable_name = variable_name
    @root = new Shiki.Operator('*')
    @root.left = new Shiki.Operand.Variable(@variable_name)
    @root.right = new Shiki.Operand.Number(1)

  getFunction: ->
    eval("(function(#{@variable_name}){return " + @getString() + ";})")

  getString: ->
    @root.getString()

  step: ->
    i = 0
    before = @root.getString()
    after = before
    while i < 10 && before == after
      node = @getRandomOperator(@root)
      Shiki.choise([@wrapNode, @cutNode, @bang]).apply(this, [node])
      after = @root.getString()
      i++

  getRandomOperator: (root)->
    current = root
    while Math.random() < 0.3
      index = current.randomIndex()
      if current[index].isOperator
        current = current[index]
      else
        return current

    return current

  getRandomNode: (root) ->
    current = root
    while current.isOperator && Math.random() < 0.8
      current = current[current.randomIndex()]

    return current

  getRandomOperand: (root)->
    current = root
    while current.isOperator
      current = current[current.randomIndex()]

    return current

  wrapNode: (node) ->
    index = node.randomIndex()
    operator = @randomOperator()
    lr = [node[index], @randomInstance()]
    lr = [lr[1], lr[0]] if Math.random() > 0.5
    operator.left = lr[0]
    operator.right = lr[1]
    node[index] = operator

  cutNode: (node) ->
    index = node.randomIndex()
    child = @getRandomNode(node[index])
    node[index] = child

  bang: (node) ->
    node.bang()

  changeValue: (node) ->
    node[node.randomIndex()] = @randomInstance()

  randomOperator: ->
    r = new Shiki.Operator(Shiki.choise(Shiki.Operator.operators))
    r.left = @randomInstance()
    r.right = @randomInstance()
    r

  randomInstance: ->
    rand = Math.random()

    if rand > 0.7
      @randomOperator()
    else if rand > 0.4
      new Shiki.Operand.Number
    else
      new Shiki.Operand.Variable(@variable_name)

Shiki.choise = (list) ->
  list[Math.floor(Math.random() * list.length)]

class Shiki.Operator
  constructor: (operator) ->
    if operator?
      @operator = operator
    else
      @bang()
    @left = new Shiki.Operand(0)
    @right = new Shiki.Operand(0)

  getString: ->
    "(" + [@left.getString(), @operator, @right.getString()].join('') + ")"

  bang: ->
    @operator = Shiki.choise(Shiki.Operator.operators)
    @left.bang() if @left
    @right.bang() if @right

  isOperator: true

  randomIndex: ->
    Shiki.choise(['left', 'right'])

Shiki.Operator.operators = '* % / + & | ^ << >>'.split(/\s+/)

class Shiki.Operand
  constructor: (value) ->
    @value = value

  getString: ->
    @value

  isOperator: false

class Shiki.Operand.Variable extends Shiki.Operand
  bang: ->

class Shiki.Operand.Number extends Shiki.Operand
  constructor: ->
    @bang()

  bang: ->
    @value = Math.floor(Math.random()*10)+1

Oneliner = (_args) ->
  @_ = {}
  @_.func = (t) -> t
  @_.phase = 0

Oneliner.prototype.seq = (seq_id) ->
  _ = @_
  cell = @cell

  if @seq_id != seq_id
    @seq_id = seq_id
    i = 0
    len = cell.length
    while i < len
      cell[i] = (((_.func(_.phase|0) % 256) / 128.0) - 1.0) * _.mul + _.add
      _.phase += 8000 / timbre.samplerate
      i++

  cell

Object.defineProperty Oneliner.prototype, "func",
  set: (value) ->
    if typeof  value == "function"
      @_.func = value
  get: ->
    @_.func

timbre.fn.register("oneliner", Oneliner)

choise = (array) ->
  array[Math.floor(Math.random() * array.length)]

genColorValue = ->
  if Math.random() > 0.5 then 255 else 0

randomColor = ->
  "hsl(#{Math.random()*360}, 100% ,50%)"

load_images = (srces) ->
  dfd = $.Deferred()

  imgs = []
  loaded_count = 0

  for src in srces
    img = new Image
    img.src = src
    imgs.push img

    img.onload = ->
      loaded_count++
      if loaded_count == srces.length
        dfd.resolve(imgs)

  dfd.promise()

main = (sources) ->
  character_images = sources.images
  character_images_rest = character_images[1..(character_images.length)]

  oneliner = T("oneliner")

  tracks = []
  setTracks = ->
    tracks = []
    for [0..(8-1)]
      t = new Shiki('t')
      t.step()
      t.step()
      tracks.push t

  setTracks()

  indexes = []
  setIndexes = ->
    indexes = ( Math.floor((i / 2) % tracks.length) for i in [0..(tracks.length*2-1)])
  setIndexes()


  # canvas

  canvas = $('canvas')[0]
  canvasWidth = 0
  canvasHeight = 0
  ctx = canvas.getContext('2d')

  resizeCanvas = _.throttle ->
    canvasWidth = $(window).width()
    canvasWidth = 1040 if canvasWidth < 1040
    canvasHeight = $(window).height()
    canvas.width = canvasWidth
    canvas.height = canvasHeight

  $(window).resize ->
    resizeCanvas()

  resizeCanvas()

  characterWidth = 250
  characterHeight = 400
  baseThreshold = 0.2
  bottomRate = 0.9
  footerHeight = 70

  characterColor = randomColor()
  setCharacterColor = ->
    characterColor = randomColor()

  resetStage = ->
    setTracks()
    setIndexes()
    setCharacterColor()

  clearStage = ->
    ctx.fillStyle = 'white'
    ctx.fillRect 0, 0, canvas.width, canvas.height

  drawCharacter = (index, power) ->
    offsetTotal = canvasWidth - characterWidth * 4
    offsetTotal = 0 if offsetTotal < 0
    offsetOne = offsetTotal / 5

    left = offsetOne + (characterWidth + offsetOne) * index

    bottom = _.min([canvasHeight * bottomRate, canvasHeight - footerHeight])
    chara = choise(character_images_rest)
    chara = character_images[0] if power < 0.2
    ctx.fillStyle = characterColor
    ctx.fillRect Math.floor(left), Math.floor(bottom - power * 50 - characterHeight), characterWidth, characterHeight
    ctx.drawImage chara, Math.floor(left), Math.floor(bottom - power * 50 - characterHeight), characterWidth, characterHeight

  drawEarth = (power) ->
    bottom = _.min([canvasHeight * bottomRate, canvasHeight - footerHeight]) - power * 50
    ctx.fillStyle = characterColor
    ctx.fillRect 0, bottom, canvasWidth, canvasHeight

  # fft

  fft = T("fft").listen(oneliner).off()
  fft.interval = 25
  fft.noSpectrum = true

  zeroTimes = 0

  fft.onfft = (res) ->

    len = 0
    sum = 0
    segments = [0,0,0,0]
    half = res.length / 2
    for v, i in res
      continue if i < 2
      break if i > half
      continue if isNaN(v)
      absv = Math.abs(v)
      sum += absv
      len++

      segments[Math.floor(i * segments.length / half)] += absv

    if len > 0
      sum /= len
      for i in [0..(segments.length-1)]
        segments[i] = segments[i] / len * segments.length

    # zero check
    if zeroTimes*fft.interval > 1000
      resetStage()
      zeroTimes = 0

    if sum < 1.0
      zeroTimes++
    else if zeroTimes > 0
      zeroTimes = 0

    segments[1]*=3
    segments[2]*=4
    segments[3]*=8

    # draw
    clearStage()

    drawEarth(sum)

    for i in [0..3]
      drawCharacter(i, segments[i])

  dac = T("*", oneliner, 1.0)
  dac.play()
  fft.on()

  timer = null

  timer = T "interval", 125, ->

    i = timer.count

    track = tracks[indexes[i%indexes.length]]
    oneliner.func = track.getFunction()

    if Math.random() < 0.05
      # step current track
      track.step()
      oneliner.func = track.getFunction()

    if Math.random() < 0.1
      # shuffle current track
      indexes[i%indexes.length] = Math.floor(Math.random() * tracks.length)

    if Math.random() < 0.1
      # slide
      indexes[i%indexes.length] = indexes[(i+indexes.length-1)%indexes.length]

    # last pattern

    if i%indexes.length == indexes.length - 1
      if Math.random() < 0.5 && indexes.length > 2
        indexes = indexes.slice(0, indexes.length/2)
      else if Math.random() < 0.5
        indexes = indexes.concat(indexes)

  timer.on()

  $('body').click ->
    return if $(this).is('a')
    resetStage()

  $('.sound-off').click ->
    dac.play()
    $('#volume').toggleClass('on')
    false

  $('.sound-on').click ->
    dac.pause()
    $('#volume').toggleClass('on')
    false

$ ->

  unless timbre.env
    message = $('<div>')
    message.addClass('sorry')
    message.text('Google ChromeかFirefoxで見てください')
    $('body').append(message)
    $('#footer').css
      background: 'black'
    return

  load_images(['/bon3/image/image1.png','/bon3/image/image2.png','/bon3/image/image3.png','/bon3/image/image4.png','/bon3/image/image5.png','/bon3/image/image6.png']).then (images) ->
    if navigator.userAgent.match(/(iPhone|iPad)/)
      $('#tap-to-start').show()
      $('#footer').addClass('wait-touch')
      $(document).click _.once ->
        $('#tap-to-start').hide()
        $('#footer').removeClass('wait-touch')
        main
          images: images

    else
      main
        images: images


