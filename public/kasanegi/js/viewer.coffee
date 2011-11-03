class Viewer
  constructor: (@weather) ->

  setup: ->
    this.setupCityChanger()
    this.setupEvents()
    this.selectFirstPage()
    this.checkCurrentPositionIfNeeded()
    this.setShareLink()

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

  selectFirstPage: ->
    page_id = @weather.getLastPageId()
    this.selectPage(page_id, true)

  setupEvents: ->
    self = this
    $('select#city-selector').change ->
      self.printWeather()

    $('#reset-city').click ->
      self.getCurrentPositionAndPrint()

    $('.page-changer').click ->
      target_id = $(this).attr('href')
      target_id = target_id.replace(/^\#/, '')
      self.selectPage(target_id)
      return false

  checkCurrentPositionIfNeeded: ->
    city_code = $('select#city-selector').val()

    if city_code == "-1"           # 地域を選択 = -1
      $('#indicator').show()
      this.getCurrentPositionAndPrint()
    else
      this.printWeather()

  getCurrentPositionAndPrint: ->
    self = this
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
    selected = $('select#city-selector option:selected')
    city_code = selected.val()
    city_name = selected.text()
    city = @weather.getCityByCityCode(city_code)
    @weather.setLastCityCode(city_code)

    @weather.getWeatherReportForCity city, (report) ->
      $('#indicator').hide()
      $('#result #area').text city_name
      $('#result #date').text report.date
      $('#result #description').text report.description
      $('#result #max-temp').text report.max
      $('#result #min-temp').text report.min
      self.printWeatherIcons(report.description)

  printWeatherIcons: (text) ->
    container = $('#weather-icons')

    container.empty()

    matched = text.match(/(晴|雷雨|雨|雷|曇|霧|)/g)

    _.each matched, (code) ->
      rule =
        晴: 'images/icon-sun.png'
        雨: 'images/icon-rain.png'
        雷: 'images/icon-thunder.png'
        曇: 'images/icon-cloud.png'
        霧: 'images/icon-mist.png'
        雷雨: 'images/icon-thunder-rain.png'

      image_path = rule[code]
      return unless image_path

      $('<img>').attr
        src: 'images/a.jpg' # image_path
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
    width: 320,
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

  setTweetLink: (message, hashtag) ->
    message ?= "3枚です"
    hashtag ?= this.HASHTAG
    url = this.SERVICE_URL
    text = "#{message} #{hashtag}"
    share_url = "https://twitter.com/share?url=#{encodeURIComponent(url)}&text=#{encodeURIComponent(text)}"
    $("a#share-tweet").attr
      href: share_url

  selectPage: (target_id, force) ->
    if !force && target_id == @weather.getLastPageId
      # do nothing
      return

    this.setPageButton(target_id)

    target_page = $(document.body).find("#" + target_id)
    if target_page.length == 0
      throw "invalid page target id (#{target_id})"

    @weather.setLastPageId(target_id)

    $('.page').hide()
    target_page.show()

    if target_id == "share-page"
      this.setupSharePage()
    else
      this.destroySharePage()

  setPageButton: (target_id) ->
    $(".page-changer.selected").removeClass("selected")
    $("##{target_id}-selector").addClass("selected")

  # ----- constants -----
  HASHTAG: "#重ね着"
  SERVICE_URL: "http://higashi-dance-network.appspot.com/bon/"


