# state_code = 25 滋賀とか
# city_code = 1200 天気API用

class Weather
  constructor: ->

  getLastCityCode: ->
    localStorage.city_code

  setLastCityCode: (city_code)->
    localStorage.city_code = city_code

  getCurrentStateCode: (callback) ->
    self = this

    if self.statusCodeCache
      callback(self.statusCodeCache)
      return

    if !(navigator && navigator.geolocation)
      callback(SURFPOINT.getPrefCode())
      return

    navigator.geolocation.getCurrentPosition (position) ->
      lat = position.coords.latitude
      lon = position.coords.longitude
      self.getStatusCodeFromLatLon(lat, lon, callback)
    , (error) ->
      alert('位置情報を取得できませんでした')

  getStatusCodeFromLatLon: (lat, lon, callback) ->
    self = this
    $.ajax
      type: 'GET'
      url: "http://reverse.search.olp.yahooapis.jp/OpenLocalPlatform/V1/reverseGeoCoder"
      data:
        lat: lat
        lon: lon
        output: 'json'
        appid: self.YAHOO_APPLICATION_ID
      dataType: 'JSONP',
      success: (res) ->
        try
          code = res.Feature[0].Property.AddressElement[0].Code
        catch error
          code = self.getCurrentStateCodeFromIP()

        self.statusCodeCache = code
        callback(code)
      error: ->
        alert('error')

  getCurrentStateCodeFromIP: ->
    return SURFPOINT.getPrefCode()

  eachCity: (callback) ->
    _.each this.STATE_CODES, (cities, state_code) ->
      _.each cities, (city) ->
        callback(city)

  getCityByCityCode: (city_code) ->
    found = null

    this.eachCity (city) ->
      found = city if city.code == city_code

    found

  getDefaultCityForState: (state_code) ->
    state_code ?= this.getCurrentStateCode()

    cities = this.STATE_CODES[state_code]

    _.find cities, (city) ->
      city.is_primary

  _ajaxByProxy: (url, callback) ->
    $.get "/proxy/#{encodeURIComponent(url)}", callback

  # return: { date description min max }
  getWeatherReportForCity:  (city, callback) ->

    if false  # for debug
      res =
        date: '2011-11-02'
        description: '雲り'
        min: 11
        max: 24
      callback res
      return

    # ---------------------------------
    city_code = city.code
    self = this
    self._ajaxByProxy "http://#{self.TENKI_SERVER_ID}.tenkiapi.jp/#{self.TENKI_USER_ID}/daily/#{city_code}_01.json", (today) ->
      if today.daily.minTemp && today.daily.maxTemp
        callback
          date: today.daily.date
          description: today.daily.wDescription
          min: today.daily.minTemp
          max: today.daily.maxTemp
        return

      # when minTemp is empty, get tomorrow and merge results
      self._ajaxByProxy "http://#{self.TENKI_SERVER_ID}.tenkiapi.jp/#{self.TENKI_USER_ID}/daily/#{city_code}_02.json", (tomorrow) ->
        unless today.daily.minTemp or today.daily.maxTemp
          today.daily.date = tomorrow.daily.date

        if tomorrow.daily.minTemp
          today.daily.minTemp = tomorrow.daily.minTemp
        if tomorrow.daily.maxTemp
          today.daily.maxTemp = tomorrow.daily.maxTemp

        callback
          date: today.daily.date
          description: today.daily.wDescription
          min: today.daily.minTemp
          max: today.daily.maxTemp

# ------------------------------------------------------------------------------------

  STATUS_CODE_TOKYO: "13"

  TENKI_SERVER_ID: 'w002'
  TENKI_USER_ID: 'c43a005f71747c2dab7ffa9c3c392ba6386bb5c2'

  YAHOO_APPLICATION_ID: 'J17Tyuixg65goAW301d5vBkBWtO9gLQsJnC0Y7OyJJk96wumaSU2U3odNwj5PdIU1A--'


  STATE_CODES: {"1":[{"code":"1100","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"宗谷地方","capital_name":"稚内"},{"code":"1200","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"上川地方","capital_name":"旭川"},{"code":"1300","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"留萌地方","capital_name":"留萌"},{"code":"1400","state_code":"01","is_primary":true,"state_name":"北海道","area_name":"石狩地方","capital_name":"札幌"},{"code":"1500","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"空知地方","capital_name":"岩見沢"},{"code":"1600","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"後志地方","capital_name":"倶知安"},{"code":"1710","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"網走地方","capital_name":"網走"},{"code":"1720","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"北見地方","capital_name":"北見"},{"code":"1730","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"紋別地方","capital_name":"紋別"},{"code":"1800","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"根室地方","capital_name":"根室"},{"code":"1900","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"釧路地方","capital_name":"釧路"},{"code":"2000","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"十勝地方","capital_name":"帯広"},{"code":"2100","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"胆振地方","capital_name":"室蘭"},{"code":"2200","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"日高地方","capital_name":"浦河"},{"code":"2300","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"渡島地方","capital_name":"函館"},{"code":"2400","state_code":"01","is_primary":false,"state_name":"北海道","area_name":"檜山地方","capital_name":"江差"}],"2":[{"code":"3110","state_code":"02","is_primary":true,"state_name":"青森県","area_name":"津軽","capital_name":"青森"},{"code":"3120","state_code":"02","is_primary":false,"state_name":"青森県","area_name":"下北","capital_name":"むつ"},{"code":"3130","state_code":"02","is_primary":false,"state_name":"青森県","area_name":"三八上北","capital_name":"八戸"}],"5":[{"code":"3210","state_code":"05","is_primary":true,"state_name":"秋田県","area_name":"沿岸","capital_name":"秋田"},{"code":"3220","state_code":"05","is_primary":false,"state_name":"秋田県","area_name":"内陸","capital_name":"横手"}],"3":[{"code":"3310","state_code":"03","is_primary":true,"state_name":"岩手県","area_name":"内陸","capital_name":"盛岡"},{"code":"3320","state_code":"03","is_primary":false,"state_name":"岩手県","area_name":"沿岸北部","capital_name":"宮古"},{"code":"3330","state_code":"03","is_primary":false,"state_name":"岩手県","area_name":"沿岸南部","capital_name":"大船渡"}],"4":[{"code":"3410","state_code":"04","is_primary":true,"state_name":"宮城県","area_name":"東部","capital_name":"仙台"},{"code":"3420","state_code":"04","is_primary":false,"state_name":"宮城県","area_name":"西部","capital_name":"白石"}],"6":[{"code":"3510","state_code":"06","is_primary":true,"state_name":"山形県","area_name":"村山","capital_name":"山形"},{"code":"3520","state_code":"06","is_primary":false,"state_name":"山形県","area_name":"置賜","capital_name":"米沢"},{"code":"3530","state_code":"06","is_primary":false,"state_name":"山形県","area_name":"庄内","capital_name":"酒田"},{"code":"3540","state_code":"06","is_primary":false,"state_name":"山形県","area_name":"最上","capital_name":"新庄"}],"7":[{"code":"3610","state_code":"07","is_primary":true,"state_name":"福島県","area_name":"中通り","capital_name":"福島"},{"code":"3620","state_code":"07","is_primary":false,"state_name":"福島県","area_name":"浜通り","capital_name":"小名浜"},{"code":"3630","state_code":"07","is_primary":false,"state_name":"福島県","area_name":"会津","capital_name":"若松"}],"22":[{"code":"5010","state_code":"22","is_primary":true,"state_name":"静岡県","area_name":"中部","capital_name":"静岡"},{"code":"5020","state_code":"22","is_primary":false,"state_name":"静岡県","area_name":"伊豆","capital_name":"網代"},{"code":"5030","state_code":"22","is_primary":false,"state_name":"静岡県","area_name":"東部","capital_name":"三島"},{"code":"5040","state_code":"22","is_primary":false,"state_name":"静岡県","area_name":"西部","capital_name":"浜松"}],"23":[{"code":"5110","state_code":"23","is_primary":true,"state_name":"愛知県","area_name":"西部","capital_name":"名古屋"},{"code":"5120","state_code":"23","is_primary":false,"state_name":"愛知県","area_name":"東部","capital_name":"豊橋"}],"21":[{"code":"5210","state_code":"21","is_primary":true,"state_name":"岐阜県","area_name":"美濃地方","capital_name":"岐阜"},{"code":"5220","state_code":"21","is_primary":false,"state_name":"岐阜県","area_name":"飛騨地方","capital_name":"高山"}],"24":[{"code":"5310","state_code":"24","is_primary":true,"state_name":"三重県","area_name":"北中部","capital_name":"津"},{"code":"5320","state_code":"24","is_primary":false,"state_name":"三重県","area_name":"南部","capital_name":"尾鷲"}],"16":[{"code":"5510","state_code":"16","is_primary":true,"state_name":"富山県","area_name":"東部","capital_name":"富山"},{"code":"5520","state_code":"16","is_primary":false,"state_name":"富山県","area_name":"西部","capital_name":"伏木"}],"17":[{"code":"5610","state_code":"17","is_primary":true,"state_name":"石川県","area_name":"加賀","capital_name":"金沢"},{"code":"5620","state_code":"17","is_primary":false,"state_name":"石川県","area_name":"能登","capital_name":"輪島"}],"18":[{"code":"5710","state_code":"18","is_primary":true,"state_name":"福井県","area_name":"嶺北","capital_name":"福井"},{"code":"5720","state_code":"18","is_primary":false,"state_name":"福井県","area_name":"嶺南","capital_name":"敦賀"}],"15":[{"code":"5410","state_code":"15","is_primary":true,"state_name":"新潟県","area_name":"下越","capital_name":"新潟"},{"code":"5420","state_code":"15","is_primary":false,"state_name":"新潟県","area_name":"中越","capital_name":"長岡"},{"code":"5430","state_code":"15","is_primary":false,"state_name":"新潟県","area_name":"上越","capital_name":"高田"},{"code":"5440","state_code":"15","is_primary":false,"state_name":"新潟県","area_name":"佐渡","capital_name":"相川"}],"8":[{"code":"4010","state_code":"08","is_primary":true,"state_name":"茨城県","area_name":"北部","capital_name":"水戸"},{"code":"4020","state_code":"08","is_primary":false,"state_name":"茨城県","area_name":"南部","capital_name":"土浦"}],"9":[{"code":"4110","state_code":"09","is_primary":true,"state_name":"栃木県","area_name":"南部","capital_name":"宇都宮"},{"code":"4120","state_code":"09","is_primary":false,"state_name":"栃木県","area_name":"北部","capital_name":"大田原"}],"10":[{"code":"4210","state_code":"10","is_primary":true,"state_name":"群馬県","area_name":"南部","capital_name":"前橋"},{"code":"4220","state_code":"10","is_primary":false,"state_name":"群馬県","area_name":"北部","capital_name":"みなかみ"}],"11":[{"code":"4310","state_code":"11","is_primary":true,"state_name":"埼玉県","area_name":"南部","capital_name":"さいたま"},{"code":"4320","state_code":"11","is_primary":false,"state_name":"埼玉県","area_name":"北部","capital_name":"熊谷"},{"code":"4330","state_code":"11","is_primary":false,"state_name":"埼玉県","area_name":"秩父地方","capital_name":"秩父"}],"13":[{"code":"4410","state_code":"13","is_primary":true,"state_name":"東京都","area_name":"東京地方","capital_name":"東京"},{"code":"4420","state_code":"13","is_primary":false,"state_name":"東京都","area_name":"伊豆諸島北部","capital_name":"大島"},{"code":"4430","state_code":"13","is_primary":false,"state_name":"東京都","area_name":"伊豆諸島南部","capital_name":"八丈島"},{"code":"4440","state_code":"13","is_primary":false,"state_name":"東京都","area_name":"小笠原地方","capital_name":"父島"}],"12":[{"code":"4510","state_code":"12","is_primary":true,"state_name":"千葉県","area_name":"北西部","capital_name":"千葉"},{"code":"4520","state_code":"12","is_primary":false,"state_name":"千葉県","area_name":"北東部","capital_name":"銚子"},{"code":"4530","state_code":"12","is_primary":false,"state_name":"千葉県","area_name":"南部","capital_name":"館山"}],"14":[{"code":"4610","state_code":"14","is_primary":true,"state_name":"神奈川県","area_name":"東部","capital_name":"横浜"},{"code":"4620","state_code":"14","is_primary":false,"state_name":"神奈川県","area_name":"西部","capital_name":"小田原"}],"20":[{"code":"4810","state_code":"20","is_primary":true,"state_name":"長野県","area_name":"北部","capital_name":"長野"},{"code":"4820","state_code":"20","is_primary":false,"state_name":"長野県","area_name":"中部","capital_name":"松本"},{"code":"4830","state_code":"20","is_primary":false,"state_name":"長野県","area_name":"南部","capital_name":"飯田"}],"19":[{"code":"4910","state_code":"19","is_primary":true,"state_name":"山梨県","area_name":"中西部","capital_name":"甲府"},{"code":"4920","state_code":"19","is_primary":false,"state_name":"山梨県","area_name":"東部・富士五湖","capital_name":"河口湖"}],"25":[{"code":"6010","state_code":"25","is_primary":true,"state_name":"滋賀県","area_name":"南部","capital_name":"大津"},{"code":"6020","state_code":"25","is_primary":false,"state_name":"滋賀県","area_name":"北部","capital_name":"彦根"}],"26":[{"code":"6100","state_code":"26","is_primary":true,"state_name":"京都府","area_name":"南部","capital_name":"京都"},{"code":"0400","state_code":"26","is_primary":false,"state_name":"京都府","area_name":"北部","capital_name":"舞鶴"}],"27":[{"code":"6200","state_code":"27","is_primary":true,"state_name":"大阪府","area_name":"大阪","capital_name":"大阪"}],"28":[{"code":"6310","state_code":"28","is_primary":true,"state_name":"兵庫県","area_name":"南部","capital_name":"神戸"},{"code":"6320","state_code":"28","is_primary":false,"state_name":"兵庫県","area_name":"北部","capital_name":"豊岡"}],"29":[{"code":"6410","state_code":"29","is_primary":true,"state_name":"奈良県","area_name":"北部","capital_name":"奈良"},{"code":"6420","state_code":"29","is_primary":false,"state_name":"奈良県","area_name":"南部","capital_name":"風屋"}],"30":[{"code":"6510","state_code":"30","is_primary":true,"state_name":"和歌山県","area_name":"北部","capital_name":"和歌山"},{"code":"6520","state_code":"30","is_primary":false,"state_name":"和歌山県","area_name":"南部","capital_name":"潮岬"}],"33":[{"code":"6610","state_code":"33","is_primary":true,"state_name":"岡山県","area_name":"南部","capital_name":"岡山"},{"code":"6620","state_code":"33","is_primary":false,"state_name":"岡山県","area_name":"北部","capital_name":"津山"}],"34":[{"code":"6710","state_code":"34","is_primary":true,"state_name":"広島県","area_name":"南部","capital_name":"広島"},{"code":"6720","state_code":"34","is_primary":false,"state_name":"広島県","area_name":"北部","capital_name":"庄原"}],"32":[{"code":"6810","state_code":"32","is_primary":true,"state_name":"島根県","area_name":"東部","capital_name":"松江"},{"code":"6820","state_code":"32","is_primary":false,"state_name":"島根県","area_name":"西部","capital_name":"浜田"},{"code":"6830","state_code":"32","is_primary":false,"state_name":"島根県","area_name":"隠岐","capital_name":"西郷"}],"31":[{"code":"6910","state_code":"31","is_primary":true,"state_name":"鳥取県","area_name":"東部","capital_name":"鳥取"},{"code":"6920","state_code":"31","is_primary":false,"state_name":"鳥取県","area_name":"中・西部","capital_name":"米子"}],"35":[{"code":"8110","state_code":"35","is_primary":false,"state_name":"山口県","area_name":"西部","capital_name":"下関"},{"code":"8120","state_code":"35","is_primary":true,"state_name":"山口県","area_name":"中部","capital_name":"山口"},{"code":"8130","state_code":"35","is_primary":false,"state_name":"山口県","area_name":"東部","capital_name":"柳井"},{"code":"8140","state_code":"35","is_primary":false,"state_name":"山口県","area_name":"北部","capital_name":"萩"}],"36":[{"code":"7110","state_code":"36","is_primary":true,"state_name":"徳島県","area_name":"北部","capital_name":"徳島"},{"code":"7120","state_code":"36","is_primary":false,"state_name":"徳島県","area_name":"南部","capital_name":"日和佐"}],"37":[{"code":"7200","state_code":"37","is_primary":true,"state_name":"香川県","area_name":"高松","capital_name":"高松"}],"38":[{"code":"7310","state_code":"38","is_primary":true,"state_name":"愛媛県","area_name":"中予","capital_name":"松山"},{"code":"7320","state_code":"38","is_primary":false,"state_name":"愛媛県","area_name":"東予","capital_name":"新居浜"},{"code":"7330","state_code":"38","is_primary":false,"state_name":"愛媛県","area_name":"南予","capital_name":"宇和島"}],"39":[{"code":"7410","state_code":"39","is_primary":true,"state_name":"高知県","area_name":"中部","capital_name":"高知"},{"code":"7420","state_code":"39","is_primary":false,"state_name":"高知県","area_name":"東部","capital_name":"室戸"},{"code":"7430","state_code":"39","is_primary":false,"state_name":"高知県","area_name":"西部","capital_name":"清水"}],"40":[{"code":"8210","state_code":"40","is_primary":true,"state_name":"福岡県","area_name":"福岡地方","capital_name":"福岡"},{"code":"8220","state_code":"40","is_primary":false,"state_name":"福岡県","area_name":"北九州","capital_name":"八幡"},{"code":"8230","state_code":"40","is_primary":false,"state_name":"福岡県","area_name":"筑豊地方","capital_name":"飯塚"},{"code":"8240","state_code":"40","is_primary":false,"state_name":"福岡県","area_name":"筑後地方","capital_name":"久留米"}],"44":[{"code":"8310","state_code":"44","is_primary":true,"state_name":"大分県","area_name":"中部","capital_name":"大分"},{"code":"8320","state_code":"44","is_primary":false,"state_name":"大分県","area_name":"北部","capital_name":"中津"},{"code":"8330","state_code":"44","is_primary":false,"state_name":"大分県","area_name":"西部","capital_name":"日田"},{"code":"8340","state_code":"44","is_primary":false,"state_name":"大分県","area_name":"南部","capital_name":"佐伯"}],"42":[{"code":"8410","state_code":"42","is_primary":true,"state_name":"長崎県","area_name":"南部","capital_name":"長崎"},{"code":"8420","state_code":"42","is_primary":false,"state_name":"長崎県","area_name":"北部","capital_name":"佐世保"},{"code":"8430","state_code":"42","is_primary":false,"state_name":"長崎県","area_name":"壱岐対馬","capital_name":"厳原"},{"code":"8440","state_code":"42","is_primary":false,"state_name":"長崎県","area_name":"五島","capital_name":"福江"}],"41":[{"code":"8510","state_code":"41","is_primary":true,"state_name":"佐賀県","area_name":"南部","capital_name":"佐賀"},{"code":"8520","state_code":"41","is_primary":false,"state_name":"佐賀県","area_name":"北部","capital_name":"伊万里"}],"43":[{"code":"8610","state_code":"43","is_primary":true,"state_name":"熊本県","area_name":"熊本地方","capital_name":"熊本"},{"code":"8620","state_code":"43","is_primary":false,"state_name":"熊本県","area_name":"阿蘇地方","capital_name":"阿蘇乙姫"},{"code":"8630","state_code":"43","is_primary":false,"state_name":"熊本県","area_name":"天草地方","capital_name":"牛深"},{"code":"8640","state_code":"43","is_primary":false,"state_name":"熊本県","area_name":"球磨地方","capital_name":"人吉"}],"45":[{"code":"8710","state_code":"45","is_primary":true,"state_name":"宮崎県","area_name":"南部平野部","capital_name":"宮崎"},{"code":"8720","state_code":"45","is_primary":false,"state_name":"宮崎県","area_name":"北部平野部","capital_name":"延岡"},{"code":"8730","state_code":"45","is_primary":false,"state_name":"宮崎県","area_name":"南部山沿い","capital_name":"都城"},{"code":"8740","state_code":"45","is_primary":false,"state_name":"宮崎県","area_name":"北部山沿い","capital_name":"高千穂"}],"46":[{"code":"8810","state_code":"46","is_primary":true,"state_name":"鹿児島県","area_name":"薩摩地方","capital_name":"鹿児島"},{"code":"8820","state_code":"46","is_primary":false,"state_name":"鹿児島県","area_name":"大隅地方","capital_name":"鹿屋"},{"code":"8830","state_code":"46","is_primary":false,"state_name":"鹿児島県","area_name":"種子島屋久島地方","capital_name":"西之表"},{"code":"1000","state_code":"46","is_primary":false,"state_name":"鹿児島県","area_name":"奄美地方","capital_name":"名瀬"}],"47":[{"code":"9110","state_code":"47","is_primary":true,"state_name":"沖縄県","area_name":"本島中南部","capital_name":"那覇"},{"code":"9120","state_code":"47","is_primary":false,"state_name":"沖縄県","area_name":"本島北部","capital_name":"名護"},{"code":"9130","state_code":"47","is_primary":false,"state_name":"沖縄県","area_name":"久米島","capital_name":"久米島"},{"code":"9200","state_code":"47","is_primary":false,"state_name":"沖縄県","area_name":"大東島地方","capital_name":"南大東島"},{"code":"9300","state_code":"47","is_primary":false,"state_name":"沖縄県","area_name":"宮古島地方","capital_name":"宮古島"},{"code":"9410","state_code":"47","is_primary":false,"state_name":"沖縄県","area_name":"石垣島地方","capital_name":"石垣島"},{"code":"9420","state_code":"47","is_primary":false,"state_name":"沖縄県","area_name":"与那国島地方","capital_name":"与那国島"}]}






