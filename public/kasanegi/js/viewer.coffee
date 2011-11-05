class Viewer
  constructor: (@weather) ->

  setup: ->
    self = this
    self.setupCityChanger()
    self.setupEvents()
    self.checkCurrentPositionIfNeeded()
    self.appendTwitterWidget()
    self.showCitySelectorContainer()

  # マニフェストキャッシュがいい感じなので使ってない
  preloadImages: (callback) ->
    callback()
    return
    images = [
      "/kasanegi/images/cardigan.png"
      "/kasanegi/images/coat.png"
      "/kasanegi/images/day.png"
      "/kasanegi/images/docodoco_logo.gif"
      "/kasanegi/images/icon-cardigan.png"
      "/kasanegi/images/icon-coat.png"
      "/kasanegi/images/icon-jacket.png"
      "/kasanegi/images/icon-shirts.png"
      "/kasanegi/images/icon-sweater.png"
      "/kasanegi/images/jacket.png"
      "/kasanegi/images/night.png"
      "/kasanegi/images/shirts.png"
      "/kasanegi/images/sweater.png"
      "/kasanegi/images/tenki_logo.gif"
    ]
    called = false
    count = 0
    _.each images, (src) ->
      image = new Image
      image.src = src
      image.onload = ->
        count++
        if count == images.length
          unless called
            called = true
            callback()

    setTimeout ->
      unless called
        called = true
        callback()
    , 5000

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

    $('#city-selector-container').prepend(select)

  setupEvents: ->
    self = this
    $('select#city-selector').change ->
      self.printWeather()

    $('#reset-city').click ->
      self.getCurrentPositionAndPrint()

  checkCurrentPositionIfNeeded: ->
    city_code = $('select#city-selector').val()

    if city_code == "-1"           # 地域を選択 = -1
      $('#indicator').show()
      $('#result').hide()
      this.getCurrentPositionAndPrint()
    else
      this.printWeather()

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
      $('#indicator').hide()
      $('#result').show()
      $('#result #area').text city_name
      $('#result #date').text self.convertDate(report.date)
      $('#result #description').text report.description
      $('#result #max-temp').text report.max
      $('#result #min-temp').text report.min
      self.printWeatherIcons(report.description)

      wear_info = self.getWearInformationFromMinAndMax(report.min, report.max)

      $('#result #comment').text wear_info.comment

      self.setTweetLink "#{city_name} #{wear_info.comment}"

      self.fillDay $('#result #day-max'), wear_info.daytime
      self.fillDay $('#result #day-min'), wear_info.night

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
    matched = text.match /(晴|雷雨|雨|雷|曇|霧|)/g

    _.each matched, (code) ->
      rule =
        晴:   'images/weather-icon/sun.png'
        雨:   'images/weather-icon/rain.png'
        雷:   'images/weather-icon/thunder.png'
        曇:   'images/weather-icon/cloud.png'
        霧:   'images/weather-icon/mist.png'
        雷雨: 'images/weather-icon/thunder-rain.png'

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

  showCitySelectorContainer: ->
    $('#city-selector-container').show()


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
          background: '#98c6d1',
          color: '#3c576e'
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

    getDistance = (x1, x2, y1, y2) ->
      Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))

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
      {
        min: 20
        max: 30
        daytime: [
          CLOTH_SHIRTS
        ]
        night: [
          CLOTH_SHIRTS
        ]
        comment: 'シャツ1枚です'
      }
      {
        min: 18
        max: 22
        daytime: [
          CLOTH_SHIRTS
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
        ]
        comment: '夜はカーディガンいります'
      }
      {
        min: 11
        max: 18
        daytime: [
          CLOTH_SHIRTS
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_JACKET
        ]
        comment: '夜はジャケットいります'
      }
      {
        min: 11
        max: 14
        daytime: [
          CLOTH_SHIRTS
          CLOTH_JACKET
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_JACKET
        ]
        comment: 'ジャケットいります'
      }
      {
        min: 9
        max: 13
        daytime: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
        ]
        comment: 'セーターいります'
      }
      {
        min: 6
        max: 10
        daytime: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_CARDIGAN
          CLOTH_COAT
        ]
        comment: '夜はコートいります'
      }
      {
        min: 3
        max: 7
        daytime: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
        ]
        night: [
          CLOTH_SHIRTS
          CLOTH_SWEATER
          CLOTH_COAT
        ]
        comment: '夜はコートいります'
      }
    ]
  )()
