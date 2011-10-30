class Viewer
  constructor: (@kimono) ->

  setup: ->
    this.setupCityChanger()
    this.setupEvents()
    this.checkCurrentPositionIfNeeded()

  setupCityChanger: ->
    self = this
    lat_state_code = self.kimono.getLastCityCode()
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

    @kimono.eachCity (city) ->
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
      this.getCurrentPositionAndPrint()
    else
      this.printWeather()

  getCurrentPositionAndPrint: ->
    self = this
    self.kimono.getCurrentStateCode (state_code) ->
      city = self.kimono.getDefaultCityForState state_code
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
    city = @kimono.getCityByCityCode(city_code)
    @kimono.setLastCityCode(city_code)

    @kimono.getWeatherReportForCity city, (report) ->
      $('#indicator').hide()
      $('#result #area').text city_name
      $('#result #date').text report.daily.date
      $('#result #description').text report.daily.wDescription
      $('#result #max-temp').text report.daily.maxTemp
      $('#result #min-temp').text report.daily.minTemp
