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
    view_center = new google.maps.LatLng +info.center.lat+0.008, +info.center.long+0.004
    map_options =
      center: center
      zoom: 14
      disableDefaultUI: true
      mapTypeId: google.maps.MapTypeId.ROADMAP

    map = new google.maps.Map info.container, map_options
    map.panTo(view_center)

    character = new google.maps.Marker
      position: center
      map: map
      icon: SukiMap.icon_url_to_image info.icon_image

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

  icon_url_to_image: (url) ->
    size = 65
    image = new google.maps.MarkerImage url
    image.size = new google.maps.Size(size, size)
    image.scaledSize = new google.maps.Size(size, size)
    image

  update_map: (info) ->
    # info:
    #   icon_image
    #   comment

    # 先にrender_mapすること
    unless SukiMap.map
      throw "map not loaded"

    if info.icon_image
      SukiMap.character.setIcon SukiMap.icon_url_to_image(info.icon_image)

    if info.comment
      SukiMap.baloon.setContent info.comment
      SukiMap.baloon.open SukiMap.map, SukiMap.character

  add_shop_pin: (info) ->
    # info:
    #   lat:
    #   long:

    # 先にrender_mapすること
    unless SukiMap.map
      throw "map not loaded"

    position = new google.maps.LatLng(info.lat, info.long)

    marker = new google.maps.Marker
      position: position
      title: info.name

    marker.setMap(SukiMap.map)

    dfd = $.Deferred()

    google.maps.event.addListener marker, 'click', ->
      dfd.resolve()

    dfd

  fit_to_positions: (positions) ->
    bounds = new google.maps.LatLngBounds()
    bounds.extend(SukiMap.character.getPosition())
    for position in positions
      point = new google.maps.LatLng(+position.lat, +position.long)
      bounds.extend point
    SukiMap.map.fitBounds bounds

  icon_image_at: (value) ->
    value = +value || 1
    value = 1 unless 1 <= value <= 4
    "http://higashi-dance-network.appspot.com/sukimap/image/face#{value}.png"

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
      created: (new Date()).getTime()

    DataStorage.save(post_info).then (key) ->
      location.href = "/sukimap/suita/#{key}?edit=1"
    .fail ->
      alert "保存に失敗しました．"

  load_status: (key) ->
    DataStorage.get(key).then (info) ->
      SukiMap.render_map
        container: $('#map-preview')[0]
        center:
          lat: info.center.lat
          long: info.center.long
        icon_image: SukiMap.icon_image_at info.icon_value
        comment: info.comment

      SukiMap.setup_share info
      SukiMap.setup_time info.created

      GourmetMap.setup
        comment: info.comment
        position:
          lat: info.center.lat
          long: info.center.long

    .fail ->
      alert "情報の取得に失敗しました．トップページに戻ります．"
      location.href = Constants.PAGE_PATH.MAIN

  setup_share: (info) ->
    setup_twitter = ->
      text = "#{info.comment} #おなかすきまっぷ"
      url = SukiMap.url_for_share()
      $('.twitter-share').attr
        href: "https://twitter.com/share?url=#{encodeURIComponent(url)}&text=#{encodeURIComponent(text)}"

    setup_twitter()

    setup_facebook = ->
      query =
        app_id: '115613081921666'
        link: SukiMap.url_for_share()
        picture: SukiMap.icon_image_at info.icon_value
        name: 'おなかがすきまっぷ'
        description: info.comment
        redirect_uri: location.href
      $('.facebook-share').attr
        href: "https://www.facebook.com/dialog/feed?#{Page.createQuery(query)}"

    setup_facebook()

  setup_time: (time) ->
    date_str = (date) ->
      diff = Math.abs((new Date().getTime() - date.getTime()) / 1000)

      if diff < 60
        return "今さっき"

      diff = Math.floor(diff / 60)
      if diff < 60
        return "#{diff}分前"

      diff = Math.floor(diff / 60)
      if diff < 24
        return "#{diff}時間前"

      diff = Math.floor(diff / 24)
      if diff < 365
        return "#{diff}日前"

      diff = Math.floor(diff / 365)
      return "#{diff}年前"

    date = new Date(+time)
    $('#ago').text(date_str(date))

  url_for_share: ->
    location.href.replace(/\?edit=1/, '')

GourmetMap =
  setup: (info) ->
    # info:
    #   comment: (comment)
    #   position:
    #     lat:
    #     long:

    GourmetMap.extract_keyword(info.comment).done (keyword) ->
      GourmetMap.search(keyword, info.position).done (res) ->
        shops = res.results.shop
        if shops.length > 0
          # 検索結果あったとき
          GourmetMap.render_shops shops
        else
          # 検索した結果なにもなかったら近くの店を出す
          GourmetMap.search(null, info.position).done (res) ->
            shops = res.results.shop
            GourmetMap.render_shops res.results.shop

  render_shops: (shops) ->
    return if shops.length == 0

    $('.shoptitle-back').show()

    template = _.template $('#shop-template').html()
    positions = []
    for shop, i in shops
      shop_html = template
        shop: shop

      # リストには出さないけど
      if i < 10
        $('#shops').append shop_html

        positions.push
          lat: shop.lat
          long: shop.lng

      # ピンは出す
      SukiMap.add_shop_pin
        name: shop.name
        lat: shop.lat
        long: shop.lng
      .done do (shop_html) ->
        ->
          $('#shop-preview').html shop_html

    # あきらめる
    # SukiMap.fit_to_positions(positions)

  search: (keyword, position) ->
    $.ajax
      type: 'get'
      url: 'http://webservice.recruit.co.jp/hotpepper/gourmet/v1/'
      dataType: 'jsonp'
      data:
        key: '94eef068f7a6eab9'
        format: 'jsonp'
        lat: position.lat
        lng: position.long
        keyword: keyword
        range: 5
        # is_open_time: 'now'
        count: 30
        # order: 4

  extract_keyword: (text) ->
    dfd = $.Deferred()
    # http://developer.yahoo.co.jp/webapi/jlp/ma/v1/parse.html
    url = 'http://jlp.yahooapis.jp/MAService/V1/parse?' + $.param
      appid: 'J17Tyuixg65goAW301d5vBkBWtO9gLQsJnC0Y7OyJJk96wumaSU2U3odNwj5PdIU1A--'
      sentence: text
      results: 'ma'
      filter: 9
    GourmetMap.get_by_proxy(url)
    .done (doc) ->
      surface = $(doc).find('surface')[0]
      if surface
        dfd.resolve $(surface).text()
      else
        dfd.resolve null
    .fail (error) ->
      alert('通信時にエラーが発生しました．時間をおいて試してみてください．')

    dfd

  get_by_proxy: (url) ->
    $.ajax
      type: 'get'
      url: "/proxy/#{encodeURIComponent(url)}"

# 各ページのハンドラ

Handlers =
  init: ->
    Handlers.common()
    Handlers[$(document.body).attr('data-page-id')]()

  common: ->

  main: ->

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
        query = Page.createQuery position
        location.href = "#{Constants.PAGE_PATH.EDIT}?#{query}"
      , ->
        alert "現在地を取得できませでした．時間をおいて試してみてください．"

  edit: ->

    query = if location.search.length > 0 then Page.parseQuery location.search[1..-1] else null

    unless query
      alert "位置情報を取得できませんでした．トップページに戻ります．"
      location.href = Constants.PAGE_PATH.MAIN

    SukiMap.render_map
      container: $('#map-preview')[0]
      center:
        lat: query.lat
        long: query.long
      icon_image: SukiMap.icon_image_at($('input[name=face]:checked').val())

    $('input[name=face]').on 'change click', ->
      SukiMap.update_map
        icon_image: SukiMap.icon_image_at($(this).val())

    $('textarea[name=comment]').on 'change keyup', _.debounce ->
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
    matched = location.pathname.match(/suita\/([^?&\/]+)/)
    unless matched
      alert "情報の取得に失敗しました．トップページに戻ります．"
      location.href = Constants.PAGE_PATH.MAIN

    key = matched[1]
    SukiMap.load_status key

    query = if location.search.length > 0 then Page.parseQuery location.search[1..-1] else {}

    if query.edit
      $('.share').show()
      $('.guest').hide()
      $('.created-message').show()
    else
      $('.share').hide()
      $('.guest').show()


# 呼び出し

$ ->
  Handlers.init()