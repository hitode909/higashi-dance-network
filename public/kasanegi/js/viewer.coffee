class Viewer
  constructor: (@weather) ->

  setup: ->
    self = this
    self.setupCityChanger()
    self.setupEvents()
    self.selectFirstPage()
    self.checkCurrentPositionIfNeeded()
    self.appendTwitterWidget()


  selectFirstPage: ->
    if location.hash
      $(window).trigger('hashchange')
      return

    page_id = @weather.getLastPageId()
    this.selectPage(page_id, true)

  selectPage: (target_id, force) ->
    if !force && target_id == @weather.getLastPageId
      # do nothing
      return

    this.setPageButton(target_id)
    target_page = $(document.body).find("##{target_id}-page")
    if target_page.length == 0
      target_id = 'main'
      target_page = $(document.body).find("##{target_id}-page")
    @weather.setLastPageId(target_id)

    $('.page').hide()
    target_page.show()

    if target_id == "main"
      $('#help-button').show()
      $('#back-to-main').hide()
    else
      $('#help-button').hide()
      $('#back-to-main').show()


  setupCityChanger: ->
    self = this
    lat_state_code = self.weather.getLastCityCode()
    found = false

    select = $('<select>').attr
      name: 'city'
      id: 'city-selector'

    label = $('<option>').attr
      name: 'city'
      value: -1
      disabled: 'disabled'

    label.text('地域を選択')

    select.append label

    @weather.eachCity (city) ->
      option = $('<option>').attr
        name: 'city'
        value: city.code
      option.text city.state_name + " " + city.area_name

      if ! found && city.code == lat_state_code
        option.attr
          selected: true

        found = true

      select.append option

    button = $("<button>").attr
      id: 'reset-city'
    .text '現在位置に設定'

    $('#city-selector-container').append(select)
    $('#city-selector-container').append(button)

  setupEvents: ->
    self = this
    $('select#city-selector').change ->
      self.hideFirstTimeGuide()
      self.printWeather()

    $('#reset-city').click ->
      self.hideFirstTimeGuide()
      self.getCurrentPositionAndPrint()


    $(window).bind 'hashchange', ->
      target_id = location.hash
      target_id = target_id.replace(/^\#/, '')
      self.selectPage(target_id)
      if target_id == 'clear'
        localStorage.clear()

      setTimeout ->
        window.scrollTo(0, 0)

  checkCurrentPositionIfNeeded: ->
    self = this
    city_code = $('select#city-selector').val()

    # 地域を選択 = -1
    if +city_code == -1
      self.printFirstTimeGuide()
    else
      this.printWeather()

  printFirstTimeGuide: ->
    $("#indicator .message").hide()
    setTimeout ->
      $("#first-time-guide").show()
    ,500

  hideFirstTimeGuide: ->
    $("#first-time-guide").hide()
    $("#indicator .message").show()

  getCurrentPositionAndPrint: ->
    self = this

    $('#indicator').show()
    $('#result').hide()

    self.weather.getCurrentStateCode (state_code) ->
      city = self.weather.getDefaultCityForState state_code
      city_code = city.code

      option = $("option[value=#{city_code}]")
      option.attr
        selected: 'selected'

      self.printWeather()

  # ----- actions -----


  printWeather: ->
    self = this
    $('#indicator').show()
    $('#result').hide()
    selected = $('select#city-selector option:selected')
    city_code = selected.val()
    city_name = selected.text()
    city = @weather.getCityByCityCode(city_code)
    @weather.setLastCityCode(city_code)

    @weather.getWeatherReportForCity city, (report) ->

      if report.min == "" || report.max == ""
        alert("申し訳ございません，天気を取得できませんでした．時間をおいて試すか，ほかの地域で試してください．")
        return

      $('#indicator').hide()
      $('#result').show()
      $('#result #area').text city_name
      $('#result #date').text self.convertDate(report.date)
      $('#result #description').text report.description
      $('#result #max-temp').text report.max
      $('#result #min-temp').text report.min
      self.printWeatherIcons(report.description)

      wear_info = self.getWearInformationFromMinAndMax(report.min, report.max)

      comment = self.dayInfo(report.date) + wear_info.comment

      $('#result #comment').text comment

      self.setTweetLink "#{city_name} #{comment}"

      self.fillDay $('#result #day-max'), wear_info.daytime
      self.fillDay $('#result #day-min'), wear_info.night

      self.checkScroll()

  # 2011-11-04 -> 11/4
  convertDate: (date_text) ->
    fragments = date_text.match(/(\d+)/g)

    if fragments.length != 3
      return date_text

    year  = fragments[0]
    month = fragments[1]
    day   = fragments[2]

    date = new Date(+year, +month-1, +day) # month = 0 ~ 11
    wod = "日月火水木金土"[date.getDay()]

    return "#{+ month}/#{+ day} (#{wod})"

  # 2011-11-04 -> 今日は or 明日は
  dayInfo: (date_text) ->
    fragments = date_text.match(/(\d+)/g)

    if fragments.length != 3
      return "今日は"

    year  = fragments[0]
    month = fragments[1]
    day   = fragments[2]

    date = new Date(+year, +month-1, +day) # month = 0 ~ 11
    today = new Date
    if date.getDay() == today.getDay()
      return "今日は"
    else
      return "明日は"

  fillDay:  (target, wears) ->
    self = this
    image_container = target.find('.wear-image')
    icons_container = target.find('.wear-icons')

    icons_container.empty()
    image_container.empty()

    bg_path = null
    if target.attr('id') == 'day-max'
      bg_path = "images/day.png"
    else
      bg_path = "images/night.png"

    $('<img>').attr
      src: bg_path
    .appendTo image_container

    _.each wears, (wear_name) ->
      $('<img>').attr
        src: "images/icon-#{wear_name}.png"
        title: self.getWearName wear_name
      .appendTo icons_container

      $('<img>').attr
        src: "images/#{wear_name}.png"
        title: self.getWearName wear_name
      .appendTo image_container

  getWearName: (wear) ->
    table =
      shirts:   'シャツ'
      cardigan: 'カーディガン'
      sweater:  'セーター'
      jacket:  'ジャケット'
      coat:     'コート'
      muffler:  'マフラー'

    table[wear]

  printWeatherIcons: (text) ->
    container = $('#weather-icons')

    container.empty()

    text = text.replace /\(.*\)/, ''
    matched = text.match /(晴|雷雨|雪|雨|雷|曇|霧|)/g

    _.each matched, (code) ->
      rule =
        晴:   'images/weather-sunny.png'
        雨:   'images/weather-rain.png'
        雷:   'images/weather-thunder.png'
        雪:   'images/weather-snow.png'
        曇:   'images/weather-cloudy.png'
        霧:   'images/weather-mist.png'
        雷雨: 'images/weather-thunderstorm.png'

      image_path = rule[code]
      return unless image_path

      $('<img>').attr
        src: image_path
        title: code
      .appendTo container

  setupSharePage: ->
    this.appendTwitterWidget()

  destroySharePage: ->
    this.removeTwitterWidget()


  removeTwitterWidget: ->
    $('#widget-container').empty()

  appendTwitterWidget: () ->
    self = this
    this.removeTwitterWidget()

    # javascript
    `new TWTR.Widget({
      id: 'widget-container',
      version: 2,
      type: 'search',
      search: self.HASHTAG,
      interval: 30000,
      title: self.HASHTAG,
      subject: '',
      width: 310,
      height: 480,
      theme: {
        shell: {
          background: '#8cd5ef',
          color: '#fff'
        },
        tweets: {
          background: '#ffffff',
          color: '#424242',
          links: '#436a94'
        }
      },
      features: {
        scrollbar: false,
        loop: false,
          live: true,
        behavior: 'all',
      }
    }).render().start();`

  # return { daytime: [image_pathes] night: [image_pathes] message: text }
  getWearInformationFromMinAndMax: (min, max) ->
    # あらかじめ決められたペアから一番近いのを探してきます

    rules = this.CLOTH_RULES
    selected = null
    distance = null

    #       .  point 2
    #
    # .  point 1
    getDistance = (x1, x2, y1, y2) ->
      if x1 <= x2 && y1 <= y2
        Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
      else
        100000

    _.each rules, (rule) ->
      distance_now = getDistance(min, rule.min, max, rule.max)
      if !selected || distance_now < distance
        selected = rule
        distance = distance_now

    return selected

  setTweetLink: (message, hashtag) ->
    message ?= "3枚です"
    hashtag ?= this.HASHTAG
    url = this.SERVICE_URL
    text = "#{message} #{hashtag}"
    share_url = "https://twitter.com/share?url=#{encodeURIComponent(url)}&text=#{encodeURIComponent(text)}"
    $("a#share-tweet").attr
      href: share_url

  setPageButton: (target_id) ->
    $(".page-changer.selected").removeClass("selected")
    $("##{target_id}-selector").addClass("selected")

  checkScroll: ->
    if @weather.getLastPageId() != 'main'
      return
    if navigator.appVersion.match(/iPhone OS/)
      setTimeout ->
        window.scrollTo(0, $('#result').position().top)
      ,500

  # ----- constants -----
  HASHTAG: "#重ね着"
  SERVICE_URL: "http://higashi-dance-network.appspot.com/kasanegi/"

  CLOTH_RULES: (->
    CLOTH_SHIRTS   = 'shirts'
    CLOTH_CARDIGAN = 'cardigan'
    CLOTH_SWEATER  = 'sweater'
    CLOTH_JACKET   = 'jacket'
    CLOTH_COAT     = 'coat'
    CLOTH_MUFFLER  = 'muffler'

    return [
      # エラー対策
      {
        min: 100
        max: 100
        daytime: [
          CLOTH_SHIRTS
        ]
        night: [
          CLOTH_SHIRTS
        ]
        comment: '異常な暑さです'
      }

      {
        min: 25
        max: 25
        daytime: [
          CLOTH_SHIRTS
        ]
        night: [
          CLOTH_SHIRTS
        ]
        comment: '暖かくていい天気なのでシャツ一枚で大丈夫です'
      }
      {
        min: 18
        max: 25
        daytime: [
          CLOTH_SHIRTS
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
        ]
        comment: '昼は暑く夜はカーディガンがあればいいくらいです'
      }
      {
        min: 15
        max: 25
        daytime: [
          CLOTH_SHIRTS
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_JACKET
        ]
        comment: '少し冷えるのでジャケットを着ましょう'
      }
      {
        min: 10
        max: 25
        daytime: [
          CLOTH_SHIRTS
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
          CLOTH_JACKET
        ]
        comment: '冷えるのでカーディガンとジャケットを着ましょう'
      }
      {
        min: 7
        max: 25
        daytime: [
          CLOTH_SHIRTS
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
          CLOTH_COAT
        ]
        comment: '冷えるのでカーディガンとコートを着ましょう'
      }
      {
        min: 5
        max: 25
        daytime: [
          CLOTH_SHIRTS
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
          CLOTH_COAT
          CLOTH_MUFFLER
        ]
        comment: 'すごく冷えるのでカーディガンとコートとマフラーを着ましょう'
      }

      {
        min: 18
        max: 18
        daytime: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
        ]
        comment: '一日中同じくらいの気温なのでカーディガンです'
      }
      {
        min: 15
        max: 18
        daytime: [
          CLOTH_SHIRTS
          CLOTH_JACKET
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_JACKET
        ]
        comment: '一日中同じくらいの気温なのでジャケットです'
      }
      {
        min: 10
        max: 18
        daytime: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
          CLOTH_JACKET
        ]
        comment: 'カーディガンにジャケットを羽織ります'
      }
      {
        min: 7
        max: 18
        daytime: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
          CLOTH_COAT
        ]
        comment: 'カーディガンにコートを羽織ります'
      }
      {
        min: 5
        max: 18
        daytime: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
          CLOTH_COAT
          CLOTH_MUFFLER
        ]
        comment: '夜は寒いのでコートにマフラーがいいです'
      }

      {
        min: 14
        max: 14
        daytime: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
        ]
        comment: '一日セーターです'
      }
      {
        min: 10
        max: 14
        daytime: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
          CLOTH_JACKET
        ]
        comment: 'セーターにジャケットを羽織ります'
      }
      {
        min: 7
        max: 14
        daytime: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
          CLOTH_COAT
        ]
        comment: 'もこもこセーターにコート羽織って出かけましょう'
      }
      {
        min: 5
        max: 14
        daytime: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
          CLOTH_COAT
          CLOTH_MUFFLER
        ]
        comment: '夜は冷え込むのでたくさん着ていきましょう'
      }

      {
        min: 12
        max: 12
        daytime: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
          CLOTH_COAT
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
          CLOTH_COAT
        ]
        comment: '一日少し寒いのでカーディガンとコートを着ましょう'
      }
      {
        min: 8
        max: 12
        daytime: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
          CLOTH_COAT
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
          CLOTH_COAT
        ]
        comment: '一日寒いのでセータとコートを着ましょう'
      }
      {
        min: 5
        max: 12
        daytime: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
          CLOTH_COAT
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
          CLOTH_COAT
          CLOTH_MUFFLER
        ]
        comment: '一日寒いので昼でもコート夜はマフラーです'
      }

      {
        min: 5
        max: 5
        daytime: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
          CLOTH_COAT
          CLOTH_MUFFLER
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
          CLOTH_COAT
          CLOTH_MUFFLER
        ]
        comment: 'すごく寒いので一日マフラーが手放せません'
      }

    ]
  )()
