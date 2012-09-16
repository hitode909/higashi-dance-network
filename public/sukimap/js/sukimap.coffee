# ユーティリティクラス

Page =
  parseQuery: (query_string) ->
    query = {}
    for pair in query_string.split('&')
      [k, v] = pair.split('=')
      query[decodeURIComponent(k)] = decodeURIComponent(v)
    query

  createQuery: (query) ->
    keys = (key for key of query).sort()
    ("#{encodeURIComponent(key)}=#{encodeURIComponent(query[key])}" for key in keys).join('&')

  createURL: (query) ->
    module = this
    location.protocol + '//' + location.host + location.pathname + '?' + module.createQuery(query)

DataStorage =
  save: (data) ->
    dfd = $.Deferred()
    json_data = JSON.stringify data
    $.ajax
      url: '/data/'
      data:
        data: json_data
      type: 'POST'
      dataType: 'text'
      success: (key) ->
        localStorage["data-#{key}"] = json_data
        dfd.resolve key
      error: ->
        dfd.reject()
    dfd.promise()

  get: (key) ->
    dfd = $.Deferred()
    dataKey = "data-#{key}"

    if localStorage[dataKey]
      json_data = localStorage[dataKey]
      dfd.resolve JSON.parse(json_data)
    else
      $.ajax
        url: "/data/#{key}"
        type: 'GET'
        dataType: 'text'
        success: (json_data) ->
          localStorage[dataKey] = json_data
          dfd.resolve JSON.parse(json_data)
        error: ->
          dfd.reject()

    dfd.promise()

  clearCache: ->
    localStorage.clear()


# 定数

Constants =
  PAGE_PATH:
    MAIN:  '/sukimap/'
    EDIT:  '/sukimap/edit/'
    SUITA: '/sukimap/suita/'

SukiMap =
  render_map: (info) ->
    # info:
    #   container:
    #   center:
    #     lat:
    #     long:
    #   icon_image
    #   comment

    # returns: map???

    center = new google.maps.LatLng +info.center.lat, +info.center.long
    map_options =
      center: center
      zoom: 10
      disableDefaultUI: true
      mapTypeId: google.maps.MapTypeId.ROADMAP

    map = new google.maps.Map info.container, map_options

    character = new google.maps.Marker
      position: center
      map: map
      icon: info.icon_image

    baloon = new google.maps.InfoWindow
      content: info.comment
      maxWidth: 200

    if info.comment
      # マップ表示後に
      setTimeout ->
        baloon.open map, character

      , 1000

    SukiMap.map = map
    SukiMap.character = character
    SukiMap.baloon = baloon
    # returns map

  update_map: (info) ->
    # info:
    #   icon_image
    #   comment

    # 先にrender_mapすること
    unless SukiMap.map
      throw "map not loaded"

    if info.icon_image
      SukiMap.character.setIcon info.icon_image

    if info.comment
      SukiMap.baloon.setContent info.comment
      SukiMap.baloon.open SukiMap.map, SukiMap.character

  icon_image_at: (value) ->
    'http://dl.dropbox.com/u/8270034/sketch/map/14.png'

  og_image_at: (value) ->
    'http://dl.dropbox.com/u/8270034/sketch/map/14.png'

  save_status: (info) ->
    # info:
    #   center:
    #     lat:
    #     long:
    #   icon_value:
    #   comment:

    post_info =
      center:
        lat: info.center.lat
        long: info.center.long
      icon_value: info.icon_value
      comment: info.comment

    DataStorage.save(post_info).then (key) ->
      location.href = "/sukimap/suita/#{key}"
    .fail ->
      alert "保存に失敗しました．"

  load_status: (key) ->
    DataStorage.get(key).then (info) ->
      console.log 'get done'
      console.log info
      SukiMap.render_map
        container: $('#map-preview')[0]
        center:
          lat: info.center.lat
          long: info.center.long
        icon_image: SukiMap.icon_image_at info.icon_value
        comment: info.comment

      SukiMap.setup_share info
    .fail ->
      alert "情報の取得に失敗しました．トップページに戻ります．"
      location.href = Constants.PAGE_PATH.MAIN

  setup_share: (info) ->
    setup_twitter = ->
      text = info.comment
      url = location.href
      $('.twitter-share').attr
        href: "https://twitter.com/share?url=#{encodeURIComponent(url)}&text=#{encodeURIComponent(text)}"

    setup_twitter()

    setup_facebook = ->
      query =
        app_id: '115613081921666'
        link: location.href
        picture: SukiMap.og_image_at info.icon_value
        name: 'おなかがすきまっぷ'
        description: info.comment
        redirect_uri: location.href
      $('.facebook-share').attr
        href: "https://www.facebook.com/dialog/feed?#{Page.createQuery(query)}"

    setup_facebook()

# 各ページのハンドラ

Handlers =
  init: ->
    Handlers.common()
    Handlers[$(document.body).attr('data-page-id')]()
    console.log 'done'

  common: ->
    console.log 'common'

  main: ->
    console.log 'main'

    check = ->
      navigator?.geolocation?.getCurrentPosition

    start = ->
      dfd = $.Deferred()
      navigator.geolocation.getCurrentPosition (position) ->
        dfd.resolve
          lat: position.coords.latitude
          long: position.coords.longitude
      , (error) ->
        dfd.reject error

      dfd

    unless check()
      alert "お使いのブラウザはおなかすきまっぷに対応していません．\nスマートフォンかGoogle ChromeかFirefoxでご利用ください．"
      return

    $('.start-button').click ->
      start().then (position) ->
        console.log position
        query = Page.createQuery position
        location.href = "#{Constants.PAGE_PATH.EDIT}?#{query}"
      , ->
        alert "現在地を取得できませでした．時間をおいて試してみてください．"

  edit: ->
    console.log 'edit'

    query = if location.search.length > 0 then Page.parseQuery location.search[1..-1] else null

    unless query
      alert "位置情報を取得できませんでした．トップページに戻ります．"
      location.href = Constants.PAGE_PATH.MAIN

    SukiMap.render_map
      container: $('#map-preview')[0]
      center:
        lat: query.lat
        long: query.long
      icon_image: 'http://dl.dropbox.com/u/8270034/sketch/map/14.png'

    $('input[name=face]').on 'change click', ->
      console.log 'change'
      SukiMap.update_map
        icon_image: SukiMap.icon_image_at($(this).val())

    $('textarea[name=comment]').on 'change keyup', _.debounce ->
      console.log 'change'
      SukiMap.update_map
        comment: _.escape($(this).val())
    , 100

    save_handler = _.once ->
      SukiMap.save_status(
        center:
          lat: query.lat
          long: query.long
        icon_value: +$('input[name=face]:checked').val()
        comment: $('textarea[name=comment]').val()
      )

    $('#edit-form').submit ->
      try
        save_handler(this)
      catch e
        console.log e
      false

  suita: ->
    console.log 'suita!!'
    matched = location.pathname.match(/suita\/(.+)$/)
    unless matched
      alert "情報の取得に失敗しました．トップページに戻ります．"
      location.href = Constants.PAGE_PATH.MAIN

    key = matched[1]
    SukiMap.load_status key


# 呼び出し

$ ->
  Handlers.init()