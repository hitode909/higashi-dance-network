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

    $('input[name=face]').change ->
      console.log 'change'
      SukiMap.update_map
        icon_image: SukiMap.icon_image_at($(this).val())

    $('textarea[name=comment]').change ->
      console.log 'change'
      SukiMap.update_map
        comment: _.escape($(this).val())

  permalink: ->
    console.log 'permalink'

# 呼び出し

$ ->
  Handlers.init()