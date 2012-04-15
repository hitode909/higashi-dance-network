$(function() {
  var file_dropped, get_color_from_canvas, histogram, image_url_prepared, load_img_to_canvas, num_to_color, parse_query, pick_color, prepare_url_from_query, resize_to_fit, setup_click_color, setup_cursor, setup_delete_button, setup_drop, setup_load_on_submit, setup_select_on_click;
  parse_query = function() {
    var k, pair, query, v, _i, _len, _ref, _ref2;
    query = {};
    _ref = location.search.slice(1).split('&');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pair = _ref[_i];
      _ref2 = pair.split('='), k = _ref2[0], v = _ref2[1];
      query[decodeURIComponent(k)] = decodeURIComponent(v);
    }
    return query;
  };
  num_to_color = function(num) {
    return '#' + ('000000' + (+num).toString(16)).slice(-6).toLowerCase();
  };
  get_color_from_canvas = function(canvas, x, y) {
    var $canvas, ctx, data, rate, v;
    $canvas = $(canvas);
    rate = canvas.width / $(canvas).width();
    ctx = canvas.getContext('2d');
    data = (ctx.getImageData(x * rate, y * rate, 1, 1)).data;
    v = (data[0] << 16) + (data[1] << 8) + data[2];
    return num_to_color(v);
  };
  resize_to_fit = function(x1, y1, x2, y2) {
    var rate;
    if (x1 <= x2 && y1 <= y2) {
      return [x1, y1];
    }
    rate = _.min([x2 / x1, y2 / y1]);
    return _.map([x1, y1], function(v) {
      return Math.floor(v * rate);
    });
  };
  pick_color = (function() {
    var template;
    template = _.template($('#picked-color-template').text());
    return function(color) {
      return $('#picked-colors').append(template({
        color: color
      }));
    };
  })();
  load_img_to_canvas = function(img) {
    var $canvas, canvas, container_height, container_width, ctx, item_container, size;
    item_container = $('<div>').addClass('item');
    $('#image-container').append(item_container);
    $canvas = $('<canvas>').addClass('image');
    container_width = $('#image-container').width();
    container_height = $('#image-container').height();
    item_container.append($canvas);
    size = resize_to_fit(img.width, img.height, container_width, container_height);
    if (size[0] === container_width) {
      $canvas.addClass('fit-x');
    }
    if (size[1] === container_height) {
      $canvas.addClass('fit-y');
    }
    canvas = $canvas[0];
    canvas.width = size[0];
    canvas.height = size[1];
    ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, size[0], size[1]);
    return item_container;
  };
  image_url_prepared = function(url) {
    var img;
    img = new Image;
    img.onload = function() {
      var container;
      $('.item').remove();
      $('#stripe-container').empty();
      $('body').removeClass('hovering');
      $('body').addClass('dropped');
      container = load_img_to_canvas(img);
      return histogram(container);
    };
    img.onerror = function() {
      return alert("画像の読み込みに失敗しました．時間をおいて試してみてください．");
    };
    return img.src = url;
  };
  file_dropped = function(file) {
    var reader;
    reader = new FileReader;
    reader.onload = function() {
      return image_url_prepared(reader.result);
    };
    return reader.readAsDataURL(file);
  };
  histogram = function(container) {
    var $stripe_canvas, base, canvas, color, count, ctx, data, displayed_colors_length, famous_colors, i, img_data, len, list, rate, stripe_canvas, stripe_container, stripe_ctx, stripe_height, stripe_width, table, total, v, width, width_total, _i, _j, _len, _len2, _ref;
    canvas = container.find('canvas')[0];
    ctx = canvas.getContext('2d');
    img_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data = img_data.data;
    len = data.length;
    table = {};
    i = 0;
    while (i < len) {
      v = (data[i] << 16) + (data[i + 1] << 8) + data[i + 2];
            if ((_ref = table[v]) != null) {
        _ref;
      } else {
        table[v] = 0;
      };
      table[v]++;
      i += 4;
    }
    list = [];
    for (color in table) {
      count = table[color];
      list.push([color, count]);
    }
    famous_colors = (list.sort(function(a, b) {
      if (a[1] === b[1]) {
        return 0;
      }
      if (a[1] < b[1]) {
        return 1;
      } else {
        return -1;
      }
    })).slice(0, 501);
    displayed_colors_length = 0;
    base = canvas.width * canvas.height;
    stripe_container = $('#stripe-container');
    stripe_container.empty();
    total = 0;
    for (_i = 0, _len = famous_colors.length; _i < _len; _i++) {
      color = famous_colors[_i];
      total += color[1];
    }
    stripe_width = $('#stripe-container').width();
    width_total = 0;
    $stripe_canvas = $('<canvas>').addClass('stripe');
    stripe_width = $('#stripe-container').width();
    stripe_height = $('#stripe-container').width();
    stripe_canvas = $stripe_canvas[0];
    stripe_canvas.width = stripe_width;
    stripe_canvas.height = stripe_height;
    stripe_ctx = stripe_canvas.getContext('2d');
    for (_j = 0, _len2 = famous_colors.length; _j < _len2; _j++) {
      color = famous_colors[_j];
      rate = color[1] / total;
      width = Math.ceil(stripe_width * rate);
      if (width < 1) {
        width = 1;
      }
      displayed_colors_length++;
      stripe_ctx.fillStyle = num_to_color(color[0]);
      stripe_ctx.fillRect(width_total, 0, width, stripe_height);
      width_total += width;
      if (width_total > stripe_width) {
        break;
      }
    }
    $('a.download').attr({
      target: '_blank',
      href: stripe_canvas.toDataURL()
    });
    return $('#stripe-container').append($stripe_canvas);
  };
  setup_drop = function() {
    var enter_counter;
    enter_counter = 0;
    return $(document).on('dragover', function() {
      return false;
    }).on('dragleave', function() {
      if (enter_counter > 0) {
        enter_counter--;
      }
      if (enter_counter === 0) {
        $('body').removeClass('hovering');
      }
      return false;
    }).on('dragenter', function() {
      enter_counter++;
      if (enter_counter === 1) {
        $('body').addClass('hovering');
      }
      return false;
    }).on('drop', function(jquery_event) {
      var event, file;
      enter_counter = 0;
      $('body').removeClass('hovering');
      event = jquery_event.originalEvent;
      if (!(event.dataTransfer.files.length > 0)) {
        return false;
      }
      file = event.dataTransfer.files[0];
      file_dropped(file);
      return false;
    });
  };
  setup_drop();
  setup_click_color = function() {
    return $(document).on('click', 'canvas', function(event) {
      var canvas, color, position;
      canvas = event.target;
      position = $(canvas).offset();
      color = get_color_from_canvas(canvas, event.pageX - position.left, event.pageY - position.top);
      return pick_color(color);
    });
  };
  setup_click_color();
  setup_cursor = function() {
    var bg_color;
    bg_color = null;
    return $(document).on('mousemove', '.color', function(event) {
      bg_color = $(event.target).attr('data-color');
      return true;
    }).on('mousemove', 'canvas', function(event) {
      var canvas, position;
      canvas = event.target;
      position = $(canvas).offset();
      bg_color = get_color_from_canvas(canvas, event.pageX - position.left, event.pageY - position.top);
      return true;
    }).on('mousemove', function(event) {
      $('.cursor-preview').remove();
      if (!bg_color) {
        return;
      }
      $('<span>').addClass('cursor-preview').appendTo($('body')).css({
        left: event.pageX,
        top: event.pageY,
        backgroundColor: bg_color
      });
      bg_color = null;
      return true;
    });
  };
  setup_cursor();
  setup_delete_button = function() {
    return $(document).on('click', '.delete-button', function(event) {
      var delete_button, item;
      delete_button = $(event.target);
      item = delete_button.parents('.picked-color-item');
      return item.slideUp(150, function() {
        return item.remove();
      });
    }).on('click', '#delete-all-button', function() {
      return $('#picked-colors').fadeOut(150, function() {
        return $('#picked-colors').empty().css({
          display: 'block',
          opacity: 1.0
        });
      });
    });
  };
  setup_delete_button();
  setup_select_on_click = function() {
    return $(document).on('click', '.picked-color-item', function(event) {
      if ($(event.target).is('.delete-button')) {
        return;
      }
      if ($(event.target).is('input')) {
        event.target.select();
      }
      if ($(event.target).is('.picked-color-item')) {
        return $(event.target).find('input')[0].select();
      } else {
        return $(event.target).parents('.picked-color-item').find('input')[0].select();
      }
    }).on('click', 'input.url', function(event) {
      return event.target.select();
    });
  };
  setup_select_on_click();
  setup_load_on_submit = function() {
    return $('form').on('submit', function(event) {
      var img_url, proxy_url;
      img_url = $('input.url').val();
      if (!img_url.length) {
        return false;
      }
      proxy_url = '/proxy/' + img_url;
      image_url_prepared(proxy_url);
      return false;
    });
  };
  setup_load_on_submit();
  prepare_url_from_query = function() {
    var query, url;
    query = parse_query();
    url = query.url;
    if (!url) {
      return;
    }
    $('input.url').val(url);
    return $('form').trigger('submit');
  };
  return prepare_url_from_query();
});