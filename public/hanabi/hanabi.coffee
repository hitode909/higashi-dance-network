Page =
  parsePageQuery: ->
    module = this
    module.parseQuery location.search[1..-1]

  parseQuery: (query_string) ->
    query = {}
    for pair in query_string.split('&')
      [k, v] = pair.split('=')
      query[decodeURIComponent(k)] = decodeURIComponent(v)
    query

  createQuery: (params) ->
    throw "TODO"

DataStorage =
  save: (data) ->
    dfd = $.Deferred()
    $.ajax
      url: '/data/'
      data:
        data: data
      type: 'POST'
      dataType: 'text'
      success: (key) ->
        localStorage["data-#{key}"] = data
        dfd.resolve key
      error: ->
        dfd.reject()
    dfd.promise()

  get: (key) ->
    dfd = $.Deferred()
    dataKey = "data-#{key}"

    if localStorage[dataKey]
      dfd.resolve localStorage[dataKey]
    else
      $.ajax
        url: "/data/#{key}"
        type: 'GET'
        dataType: 'text'
        success: (data) ->
          localStorage[dataKey] = data
          dfd.resolve data
        error: ->
          dfd.reject()

    dfd.promise()

  clearCache: ->
    localStorage.clear()

Hanabi =
  postUchiage: (text) ->
    DataStorage.save(text).then (key) ->
      location.href = "/hanabi/uchiage/#{key}"
    .fail ->
      # fallback
      location.href = "/hanabi/uchiage/?data=#{encodeURIComponent(text)}"

  getUchiage: ->
    dfd = $.Deferred()
    module = this

    module.getBody().then (body) ->
      dfd.resolve new module.Uchiage(body)
    .fail ->
      dfd.reject()

    dfd.promise()

  getBody: ->
    dfd = $.Deferred()
    matched = location.pathname.match(/uchiage\/(.+)$/)
    if matched
      key = matched[1]
      DataStorage.get(key).then (body) ->
        dfd.resolve body
        new Hanabi.Button($("#button-container"), key)
      .fail ->
        dfd.reject()
    else
      body = Page.parsePageQuery()['body']
      if body
        dfd.resolve body
      else
        dfd.reject()

    dfd.promise()

class Hanabi.Uchiage
  constructor: (body) ->
    @body = body
    @container = $("#uchiage-flash")

  show: ->
    if @canUseFlash()
      @loadFlash()
    else
      @loadByBanner()

  canUseFlash: ->
    deconcept.SWFObjectUtil.getPlayerVersion().major > 0

  loadFlash: ->
    container = @container[0]
    width = 1000
    height = 700
    requiredVersion = 9

    # '/hanabi/hanabi.swf'
    # src = "http://d.hatena.ne.jp/hitode909/files/hanabi.swf?d=y"
    src = 'http://dl.dropbox.com/u/8270034/hanabi.swf'
    so = new SWFObject(src, 'canvas', width, height, requiredVersion, '#000000')
    so.useExpressInstall('/hanabi/expressinstall.swf')
    so.addVariable('body', @body)
    so.setAttribute('useGetFlashImageFallback', true)
    so.addParam('allowScriptAccess', 'always')
    so.write(container)

  loadByBanner: ->
    $("#uchiage-flash").remove()
    bodyContainer =     $("#uchiage-image .body")
    for text in @body.split("\n")
      line = $('<div>').text(text)
      bodyContainer.append line
    $("#uchiage-image").css
      display: 'table-cell'

  # つかってない
  setTweetLink: ->
    message = "打ち上げました"
    hashtag = "#今夜も打ち上げナイト"
    text = "#{message} #{hashtag}"
    url = location.href
    share = "https://twitter.com/share?url=#{encodeURIComponent(url)}&text=#{encodeURIComponent(text)}"
    $("a#uchiage-tweet").attr
      href: share

  # つかってない
  setAnimationFinishHandler: ->
    window.uchiageAnimationFinished = ->
      console.log 'finish'
      $(document.body).addClass("animation-finished")

class Hanabi.Button
  constructor: (container, key) ->
    @container = container
    @button = @container.find('.button')
    @key = key
    @bindClick()
    @loadStamps()
    @appendedCount = 0
    @cachedPostCount = 0

  bindClick: ->
    @button.on 'click', =>
      @appendStamps(1)
      @postCountCached()

  loadStamps: ->
    @getCount().then (count) =>
      @appendStamps(count) if count


  appendStamps: (count, from) ->
    html = ''

    for i in [0...count]
      @appendedCount++
      html += "<img src=\"/hanabi/img/stamp-#{ @appendedCount % 3 }.png\">"

    @container.append(html)

  postCountCached: ->
    if @timer
      clearTimeout(@timer)
    @cachedPostCount++
    @timer = setTimeout =>
      @postCount(@cachedPostCount)
      @cachedPostCount = 0
      @timer = null
    , 500

  getCount: ->
    dfd = $.Deferred()

    ajax = $.ajax
      url: "/data/#{@key}"
      type: 'GET'
      dataType: 'text'
      success: (data) ->
        count = ajax.getResponseHeader('X-Count')
        dfd.resolve count
      error: ->
        dfd.reject()

    dfd.promise()

  postCount: (count) ->
    dfd = $.Deferred()

    count = 1 unless count

    ajax = $.ajax
      url: "/data/#{@key}"
      data:
        count: count
      type: 'POST'
      dataType: 'text'
      success: (data) ->
        count = ajax.getResponseHeader('X-Count')
        dfd.resolve count
      error: ->
        dfd.reject()

    dfd.promise()

$ ->
  router =
    always: ->
    hanabi: ->
      $("form#create-uchiage").submit (event) ->
        try
          body = $(this).find("textarea").val()
          return false unless body.length > 0
          $(this).find(".submit").prop("disabled", true)
          Hanabi.postUchiage body
        false
    uchiage: ->
      Hanabi.getUchiage().then (u) ->
        u.show()
      .fail ->
        alert("申し訳ございません．打ち合げの読み込みに失敗しました．トップページに戻ります．")
        location.href = "/hanabi/"

  pageId = $(document.documentElement).attr('data-page-id')
  router['always']()
  router[pageId]() if router[pageId]
