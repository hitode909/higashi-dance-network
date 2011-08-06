window.requestAnimationFrame = (->
  window.requestAnimationFrame		||
  window.webkitRequestAnimationFrame	||
  window.mozRequestAnimationFrame		||
  window.oRequestAnimationFrame		||
  window.msRequestAnimationFrame		||
  (callback, element) ->
    window.setTimeout ->
      callback()
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

selectRandom = (list) ->
  list[Math.floor(Math.random() * list.length)]

class Stage
  constructor: (@container) ->
    @parts = []
    @position = Math.PI * 3.0
    @totalPosition = 0.0
    @ageFrom = @parseAgeFrom()
    @loopCount = 0
    @last = Date.now()
    @bpm = 120.0
    @fps = 0
    @minRadius = 200
    @partIndex = 0

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
    part.age = @getAge()
    @parts.push(part)
    part

  observe: ->
    @fps++
    now = Date.now()
    diff = @bpm / 60.0 * (now - @last) / 1000 * Math.PI * 0.5
    @position += diff
    @totalPosition += diff

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
        bgs = ['images/maru1.svg', 'images/maru2.svg', 'images/maru3.svg', 'images/maru4.svg']
        @partIndex++
        @partIndex = 0 if @partIndex >= bgs.length
        part.elem = $('<img>')
        part.elem.attr
          src: bgs[@partIndex]
        part.elem.addClass 'part'
        stage.append(part.elem)

      part.elem.css
        width: part.getImageRadius() * 2 + part.getRadius() * 2
        height: part.getImageRadius() * 2 + part.getRadius() * 2
        left: stageWidth  / 2 - part.getRadius() - part.getImageRadius()
        top:  stageHeight / 2 - part.getRadius() - part.getImageRadius()
        'z-index': parseInt(stageWidth  / 2 - part.getRadius()) + 5000
      # part.elem.attr
      #   src: if part.radius == this.hoveringPartId then 'images/ossan1.png' else 'images/ossan_center.png'

      rate = part.getRate()
      for note in part.notes
        unless note.elem
          note.elem = $('<img>').addClass('note').css
            width: part.getImageRadius() * 2
            height: part.getImageRadius() * 2
          stage.append(note.elem)

        note.elem.css
          left: (Math.sin(@position - note.position) * part.getRadius()) - part.getImageRadius() + stageWidth  / 2
          top: (-Math.cos(@position - note.position) * part.getRadius()) - part.getImageRadius() + stageHeight / 2
          # width: part.getImageRadius() * 2
          # height: part.getImageRadius() * 2

        note.elem.attr
          src: if note.playing then 'images/ossan2.png' else 'images/ossan1.png'

  killPart: (part) ->
    @parts = $.grep @parts, (v) ->
      v.radius != part.radius

    part.kill()

  getPartAtDistance: (distance) ->
    got = null
    return null if distance < @minRadius
    for part in @parts.reverse()
      do (part) ->
        if part.getRadius() + part.getImageRadius() > distance
          got = part
    @parts.reverse()
    got

  actionAtDistance: (distance) ->
    # return if distance < @minRadius
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

  getAge: ->
    age = @ageFrom + @totalPosition
    age = age % 80
    age += 80 if age < 0
    age

  parseAgeFrom: ->
    match = location.hash.match(/\d+/)
    return 0 unless match
    parseInt(match, 10)

  getAgeKey: (age) ->
    # TODO 間隔は一定にする？
    keys = [3, 10, 15, 20, 40, 70]
    age ?= @getAge()
    index = 0

    return keys[0] if age < keys[0]
    return keys[keys.length-1] if age >= keys[keys.length-1]

    for i in [0..keys.length-1]
      return keys[i] if keys[i] <= age and age < keys[i+1]

    return keys[keys.length-1]  #wrong

  getURL: ->
    location.host + location.pathname

  getHatenaBookmarkURL: ->
    "http://b.hatena.ne.jp/add?url=#{encodeURIComponent(@getURL())}"

  getTshirtsURL: ->
    # TシャツURLは決め打ち
    'http://tshirts.com'

  getTweetURL: ->
    # tweetは年齢含む
    url = @getURL() + '#' + @getAgeKey()
    "tweet?url=#{encodeURIComponent(url)}"

class Part
  constructor: ->
    @notes = []
    @lastPosition = 0.0
    @birth = Date.now()
    @age = 0

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
    Part.prototype.ImageRadius

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

class Dog
  constructor: (@element)->
    @f = 0.0

  observe: ->
    opacity = Math.sin(@f += (Math.random() / 20)) * 0.5 + 0.5
    @element.css
      opacity: opacity

    if opacity < 0.01
      @element.css
        width: "#{ Math.random()*100}%"
        height: "#{ Math.random()*100}%"
        left: "#{ Math.random()*100}%"
        top: "#{ Math.random()*100}%"

$ ->
  stage = new Stage($('#stage'))

  setInterval ->
    $('#fps').text(stage.fps)
    stage.fps = 0
  ,1000

  Deferred.wait(1).next ->
    Dial $('#stage'), (diff, distance) ->
      stage.bpm += diff * 32
      bpmMin = 1.0
      stage.bpm = bpmMin * stage.bpm / Math.abs(stage.bpm) if Math.abs(stage.bpm) < bpmMin
      part = stage.getPartAtDistance(distance)
      stage.hoveringPartId = if part then part.radius else null

  $('#stage').click (event) ->
    return if $(event.target).parents('a').length > 0
    container = $('#stage')
    center =
      left: container.position().left + container.width() / 2
      top:  container.position().top  + container.height() / 2
    x = event.pageX - center.left
    y = event.pageY - center.top
    distance = Math.sqrt(x * x + y * y)
    stage.actionAtDistance(distance)

  setupShowCenterItems = ->
    mainItem = $('#center-items .center-main-item')
    items = $('#center-items .center-item')
    selectedItem = mainItem
    waitMain = 25
    waitLink = 5

    change = ->
      selectedItem.fadeOut('slow')
      if selectedItem.hasClass('center-main-item')
        selectedItem = $(selectRandom(items))
      else
        selectedItem = mainItem
      selectedItem.fadeIn('slow')

      Deferred.wait(if selectedItem.hasClass('center-main-item') then waitMain else waitLink).next ->
        change()

    Deferred.wait(waitMain).next ->
      change()

  setupShowCenterItems()

  setupYona = ->
    yonaList = [0, 2, 5, 7, 9, 12]
    getNote = (base) ->
      type: 'sin'
      hz: base * Math.pow(Math.pow(2, 1/12), selectRandom(yonaList))
      release: 0.9999

    playYona = (base) ->
      Beep.play(getNote(base))
      Deferred.wait(Math.abs(120 / stage.bpm) * selectRandom([1, 1, 2, 0.5])).next ->
        playYona(base)

    playYona(330)
    playYona(110)

  setupYona()

  setupCenterDance = ->
    centerElement = $('#center-items .center-main-item img')
    index = 0
    centerImages = ['images/ossan_center.png', 'images/ossan_center_2.png', 'images/ossan_center.png', 'images/ossan_center_3.png']

    tweetLink = $('a#tweet-link')
    hatenaBookmarkLink = $('a#hatena-bookmark-link')
    buyTshirtsLink = $('a#buy-tshirts-link')

    hatenaBookmarkLink.attr('href', stage.getHatenaBookmarkURL())

    change = ->
      tweetLink.attr('href', stage.getTweetURL())
      buyTshirtsLink.attr('href', stage.getTshirtsURL())
      centerElement.attr('src': centerImages[index])
      index = (index + 1) % centerImages.length
      Deferred.wait(Math.abs(120 / stage.bpm) * 0.25).next ->
        change()
    change()

  setupCenterDance()

  setupDog = ->
    dog_img = $('<img>').attr({ src: 'dog.jpg' }).css
      position: 'absolute'
      'z-index': 13000
    $('body').append(dog_img)
    attack_img = $('<img>').attr({ src: 'attack.jpg' }).css
      position: 'absolute'
      'z-index': 13001
    $('body').append(attack_img)
    dog1 = new Dog(dog_img)
    dog2 = new Dog(attack_img)
    animationLoop = ->
      dog1.observe()
      dog2.observe()
      window.requestAnimationFrame(animationLoop)
    animationLoop()

  setupYoutube = ->
    put_youtube = ->
      youtube = $("<iframe width='400' height='300' src='http://www.youtube.com/embed/lniVx_pFM_A?fs=1&autoplay=1&loop=1' frameborder='0' allowFullScreen=''></iframe>")
      youtube.css
        position: 'absolute'
        'z-index': 14000
        width: 400
        height: 300
        left: '40%'
        top: '40%'
      $('body').append(youtube)

      Deferred.wait(10).next ->
        youtube.remove()

    setInterval ->
      put_youtube()
    ,30 * 1000