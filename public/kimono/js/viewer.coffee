class Viewer
  constructor: (@kimono) ->

  setup: ->
    this.setupCityChanger()
    this.setupEvents()
    this.printWeather()

  setupCityChanger: ->
    self = this
    current_state_code = @kimono.getCurrentStateCode()
    found = false

    select = $('<select>').attr
      name: 'city'
      id: 'city-selector'

    @kimono.eachCity (city) ->
      option = $('<option>').attr
        name: 'city'
        value: city.code
      option.text city.state_name + " " + city.area_name

      if ! found && city.state_code == current_state_code && city.is_primary
        option.attr
          selected: 'selected'
        self.defaultCity = option

        found = true

      select.append option

    $('#city-selector-container').append(select)

  setupEvents: ->
    self = this
    $('select#city-selector').change ->
      self.printWeather()

    $('#reset-city').click ->
      self.selectDefaultCity()

  # ----- actions -----


  printWeather: ->
    city_code = +$('select#city-selector').val()
    city = @kimono.getCityByCityCode(city_code)

    @kimono.getWeatherReportForCity city, (report) ->

      $('#result #date').text report.daily.date
      $('#result #description').text report.daily.wDescription
      $('#result #max-temp').text report.daily.maxTemp
      $('#result #min-temp').text report.daily.minTemp

  selectDefaultCity: ->
    @defaultCity.attr
          selected: 'selected'

    this.printWeather()
