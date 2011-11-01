class Viewer
  constructor: (@weather) ->

  setup: ->
    this.setupCityChanger()
    this.setupEvents()
    this.checkCurrentPositionIfNeeded()

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

    $('#city-selector-container').append(select)

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
    $('#indicator').show()
    selected = $('select#city-selector option:selected')
    city_code = selected.val()
    city_name = selected.text()
    city = @weather.getCityByCityCode(city_code)
    @weather.setLastCityCode(city_code)

    @weather.getWeatherReportForCity city, (report) ->
      $('#indicator').hide()
      $('#result #area').text city_name
      $('#result #date').text report.daily.date
      $('#result #description').text report.daily.wDescription
      $('#result #max-temp').text report.daily.maxTemp
      $('#result #min-temp').text report.daily.minTemp

    state_name = city_name.split(/\s+/)[0]
    state_name = state_name.slice(0, state_name.length - 1)
    this.appendWidget(state_name)
    this.setTweetLink(state_name)

  appendWidget: (state_name) ->
    $('#widget-container').empty()
    `new TWTR.Widget({
    id: 'widget-container',
    version: 2,
    type: 'search',
    search: state_name,
    interval: 30000,
    title: state_name,
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

  setTweetLink: (state_name) ->
    url = "http://higashi-dance-network.appspot.com/bon/"
    text = "盆のご案内です #盆 #盆#{state_name}"
    share_url = "https://twitter.com/share?url=#{encodeURIComponent(url)}&text=#{encodeURIComponent(text)}"
    $("a#share-tweet").attr
      href: share_url







