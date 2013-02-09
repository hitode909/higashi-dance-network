var ColorMap, handlers;
ColorMap = (function() {
  function ColorMap(args) {
    var center, container, map_options, styles;
    center = args.center;
    if (center == null) {
      throw "center required";
    }
    container = args.container;
    if (container == null) {
      throw "container required";
    }
    center = new google.maps.LatLng(+center.lat, +center.long);
    styles = [
      {}, {
        featureType: "landscape",
        stylers: [
          {
            visibility: "off"
          }
        ]
      }, {
        featureType: "poi",
        stylers: [
          {
            visibility: "off"
          }
        ]
      }, {
        featureType: "transit",
        stylers: [
          {
            visibility: "off"
          }
        ]
      }, {
        featureType: "administrative.locality",
        stylers: [
          {
            visibility: "off"
          }
        ]
      }, {
        featureType: "road",
        elementType: "labels",
        stylers: [
          {
            visibility: "off"
          }
        ]
      }, {
        elementType: "labels",
        stylers: [
          {
            visibility: "off"
          }
        ]
      }, {
        featureType: "road.highway",
        stylers: [
          {
            visibility: "off"
          }
        ]
      }, {
        featureType: "administrative.locality",
        stylers: [
          {
            visibility: "on"
          }
        ]
      }, {
        featureType: "road.arterial",
        stylers: [
          {
            visibility: "off"
          }
        ]
      }, {
        featureType: "water",
        stylers: [
          {
            saturation: -100
          }
        ]
      }
    ];
    map_options = {
      center: center,
      zoom: 13,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styles
    };
    this.map = new google.maps.Map(container, map_options);
  }
  ColorMap.prototype.addCircle = function(args) {
    var options;
    options = {
      strokeColor: '#000000',
      strokeOpacity: 0.2,
      strokeWeight: 1,
      fillColor: args.color,
      fillOpacity: 0.8,
      map: this.map,
      center: new google.maps.LatLng(args.lat, args.long),
      radius: args.radius
    };
    return new google.maps.Circle(options);
  };
  return ColorMap;
})();
handlers = {
  'index-page': function() {
    $('.photo-item a').colorbox({
      rel: 'gallery',
      returnFocus: false
    });
    return $('#cboxContent').click(function() {
      return $.colorbox.close();
    });
  },
  'map-page': function() {
    var i, map, rand, _results;
    rand = function(max) {
      return Math.floor(Math.random() * max);
    };
    map = new ColorMap({
      center: {
        lat: 35.0,
        long: 135.75
      },
      container: $('#map-container').get(0)
    });
    _results = [];
    for (i = 0; i <= 100; i++) {
      _results.push(map.addCircle({
        lat: 35.0 + (Math.random() * 0.2 - 0.1),
        long: 135.75 + (Math.random() * 0.2 - 0.1),
        color: "hsl(" + (rand(360)) + ", 100%, 50%)",
        radius: 200
      }));
    }
    return _results;
  }
};
$(function() {
  var handler, page_id;
  page_id = $(document.body).attr('id');
  handler = handlers[page_id];
  return handler();
});