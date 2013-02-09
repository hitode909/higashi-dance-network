class ColorMap
  constructor: (args) ->
    center = args.center
    throw "center required" unless center?

    container = args.container
    throw "container required" unless container?

    center = new google.maps.LatLng +center.lat, +center.long

    styles = [{},
      featureType: "landscape"
      stylers: [visibility: "off"]
    ,
      featureType: "poi"
      stylers: [visibility: "off"]
    ,
      featureType: "transit"
      stylers: [visibility: "off"]
    ,
      featureType: "administrative.locality"
      stylers: [visibility: "off"]
    ,
      featureType: "road"
      elementType: "labels"
      stylers: [visibility: "off"]
    ,
      elementType: "labels"
      stylers: [visibility: "off"]
    ,
      featureType: "road.highway"
      stylers: [visibility: "off"]
    ,
      featureType: "administrative.locality"
      stylers: [visibility: "on"]
    ,
      featureType: "road.arterial"
      stylers: [visibility: "off"]
    ,
      featureType: "water"
      stylers: [saturation: -100]
    ]

    map_options =
      center: center
      zoom: 13
      disableDefaultUI: true
      mapTypeId: google.maps.MapTypeId.ROADMAP
      styles: styles

    @map = new google.maps.Map container, map_options

  addCircle: (args) ->
    options =
      strokeColor: '#000000'
      strokeOpacity: 0.2
      strokeWeight: 1
      fillColor: args.color
      fillOpacity: 0.8
      map: @map
      center: new google.maps.LatLng args.lat, args.long
      radius: args.radius

    new google.maps.Circle options

handlers =
  'index-page': ->
    $('.photo-item a').colorbox
      rel: 'gallery'
      returnFocus: false

     $('#cboxContent').click ->
        $.colorbox.close()

  'map-page': ->
    rand = (max) ->
      Math.floor(Math.random() * max)

    map = new ColorMap
      center:
        lat: 35.0
        long: 135.75
      container: $('#map-container').get(0)

    for i in [0..100]
      map.addCircle
        lat: 35.0 + (Math.random() * 0.2 - 0.1)
        long: 135.75 + (Math.random() * 0.2 - 0.1)
        color: "hsl(#{ rand(360) }, 100%, 50%)"
        radius: 200

$ ->
  page_id = $(document.body).attr 'id'
  handler = handlers[page_id]
  do handler
