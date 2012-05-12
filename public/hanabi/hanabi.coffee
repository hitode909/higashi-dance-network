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
    $("form#uchiage textarea").val(@body)
    $("#body").text(@body + " を打ち上げました")
    @loadFlash()
    @setTweetLink()

  loadFlash: ->
    container = @container[0]
    width = 960
    height = 600
    requiredVersion = 9

    so = new SWFObject('/hanabi/hanabi.swf', 'canvas', width, height, requiredVersion, '#000000')
    so.useExpressInstall('/hanabi/expressinstall.swf')
    so.addVariable('body', @body)
    so.setAttribute('useGetFlashImageFallback', true)
    so.addParam('allowScriptAccess', 'always')
    so.write(container)

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
