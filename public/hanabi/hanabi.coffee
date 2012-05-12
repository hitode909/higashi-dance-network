Page =
  parsePageQuery: ->
    module = this
    module.parseQuery location.search[1..-1]

  parseQuery: (query_string) ->
    query = {}
    for pair in query_string.split('&')
      [k, v] = pair.split('=')
      query[decodeURIComponent(k)] = decodeURIComponent(v)
    query

  createQuery: (params) ->
    throw "TODO"


Hanabi =
  encode: (text) ->
    encodeURIComponent(text).split('').reverse().join('')

  decode: (text) ->
    decodeURIComponent(text.split('').reverse().join(''))

class Hanabi.Uchiage
  constructor: (body) ->
    @body = body
    @container = $("#utiage-flash")

  show: ->
    $("form#uchiage textarea").val(@body)
    $("#body").text(@body + " を打ち上げました")
    @loadFlash()

  loadFlash: ->
    container = @container[0]
    width = 500
    height = 300
    requiredVersion = 9

    so = new SWFObject('/hanabi/hanabi.swf', 'canvas', width, height, requiredVersion, '#000000')
    so.useExpressInstall('/hanabi/expressinstall.swf')
    so.addVariable('body', @body)
    so.setAttribute('useGetFlashImageFallback', true)
    so.addParam('allowScriptAccess', 'always')
    so.write(container)

$ ->
  body = Page.parsePageQuery()['body']

  uchiage = new Hanabi.Uchiage(body)
  uchiage.show()
