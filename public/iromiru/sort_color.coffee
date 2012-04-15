$ ->

  # ----- utilities -----

  parse_query = ->
    query = {}
    for pair in location.search[1..-1].split('&')
      [k, v] = pair.split('=')
      query[decodeURIComponent(k)] = decodeURIComponent(v)
    query

  num_to_color = (num) ->
    '#' + ('000000' + (+num).toString(16))[-6..-1].toLowerCase()

  get_color_from_canvas = (canvas, x, y) ->
    $canvas = $(canvas)
    rate = canvas.width / $(canvas).width()
    ctx = canvas.getContext '2d'
    data = (ctx.getImageData x * rate, y * rate, 1, 1).data
    v = (data[0] << 16) + (data[1] << 8) + (data[2])
    num_to_color v

  resize_to_fit = (x1, y1, x2, y2) ->
    return [x1, y1] if x1 <= x2 and y1 <= y2
    rate = _.min [x2 / x1, y2 / y1]
    return _.map [x1, y1], (v) -> Math.floor(v * rate)

  pick_color = do ->
    template = _.template($('#picked-color-template').text())

    (color) ->
      $('#picked-colors').append(
        template
          color: color
      )

  load_img_to_canvas = (img) ->
    item_container = $('<div>')
    .addClass 'item'

    $('#image-container')
    .append(item_container)

    $canvas = $('<canvas>')
    .addClass('image')

    container_width = $('#image-container').width()
    container_height =  $('#image-container').height()
    item_container.append $canvas
    size = [img.width, img.height]

    if size[0] == container_width
      $canvas.addClass 'fit-x'
    if size[1] == container_height
      $canvas.addClass 'fit-y'
    canvas = $canvas[0]
    canvas.width = size[0]
    canvas.height = size[1]
    ctx = canvas.getContext('2d')
    ctx.drawImage img, 0, 0, img.width, img.height, 0, 0, size[0], size[1]

    item_container

  image_url_prepared = (url) ->
    console.log 'prepared'
    img = new Image
    img.onload = ->
      $('.item').remove()
      $('#stripe-container').empty()
      $('body').removeClass('hovering')
      $('body').addClass('dropped')
      container = load_img_to_canvas img
      histogram(container)
    img.onerror = ->
      alert "画像の読み込みに失敗しました．時間をおいて試してみてください．"
    img.src = url

  file_dropped = (file) ->
    reader = new FileReader
    reader.onload = ->
      image_url_prepared reader.result
    reader.readAsDataURL file

  histogram = (container) ->
    canvas = container.find('canvas')[0]
    ctx = canvas.getContext('2d')
    img_data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    data = img_data.data
    len = data.length
    table = {}

    i = 0
    while i < len
      v = (data[i] << 16) + (data[i+1] << 8) + (data[i+2])
      table[v] ?= 0
      table[v]++
      i+= 4

    list = []
    for color, count of table
      list.push [color, count]

    famous_colors = (list.sort (a, b) ->
      return 0 if a[1] == b[1]
      if a[1] < b[1] then 1 else -1
    )[0..500]

    displayed_colors_length = 0

    base = canvas.width * canvas.height

    stripe_container = $('#stripe-container')
    stripe_container.empty()

    total = 0
    for color in famous_colors
      total += color[1]

    stripe_width = $('#stripe-container').width()
    width_total = 0

    $stripe_canvas = $('<canvas>').addClass('stripe')
    stripe_width = $('#stripe-container').width()
    stripe_height = $('#stripe-container').width()
    stripe_canvas = $stripe_canvas[0]
    stripe_canvas.width = stripe_width
    stripe_canvas.height = stripe_height
    stripe_ctx = stripe_canvas.getContext('2d')

    for color in famous_colors
      rate = (color[1] / total)
      width = Math.ceil(stripe_width * rate)
      width = 1 if width < 1
      displayed_colors_length++
      stripe_ctx.fillStyle = num_to_color(color[0])
      stripe_ctx.fillRect(width_total, 0, width, stripe_height)
      width_total += width
      break if width_total > stripe_width

    $('a.download').attr
      target: '_blank'
      href: stripe_canvas.toDataURL()

    $('#stripe-container').append($stripe_canvas)

  # ----- events -----

  setup_drop = ->
    enter_counter = 0

    $(document)
    .on 'dragover', ->
      false

    .on 'dragleave', ->
      if enter_counter > 0
        enter_counter--
      if enter_counter == 0
        $('body').removeClass('hovering')
      false

    .on 'dragenter', ->
      enter_counter++
      if enter_counter == 1
        $('body').addClass('hovering')
      false

    .on 'drop', (jquery_event) ->
      enter_counter = 0
      $('body').removeClass('hovering')
      event = jquery_event.originalEvent

      return false unless event.dataTransfer.files.length > 0

      file = event.dataTransfer.files[0]
      file_dropped(file)
      false

  setup_drop()

  setup_click_color = ->
    $(document)
    .on 'click', 'canvas', (event) ->
      canvas = event.target
      position = $(canvas).offset()
      color = get_color_from_canvas(canvas, event.pageX - position.left, event.pageY - position.top)
      pick_color(color)

  setup_click_color()

  setup_cursor = ->
    bg_color = null

    $(document)
    .on 'mousemove', '.color', (event)->
      bg_color = $(event.target).attr('data-color')
      true

    .on 'mousemove', 'canvas', (event)->
      canvas = event.target
      position = $(canvas).offset()
      bg_color = get_color_from_canvas(canvas, event.pageX - position.left, event.pageY - position.top)
      true

    .on 'mousemove', (event)->
      $('.cursor-preview').remove()
      return unless bg_color
      $('<span>').addClass('cursor-preview').appendTo($('body')).css
        left: event.pageX
        top: event.pageY
        backgroundColor: bg_color
      bg_color = null
      true

  setup_cursor()

  setup_delete_button = ->
    $(document)
    .on 'click', '.delete-button', (event) ->
      delete_button = $(event.target)
      item = delete_button.parents('.picked-color-item')
      item.slideUp 150, ->
        item.remove()

    .on 'click', '#delete-all-button', ->
      $('#picked-colors').fadeOut 150, ->
        $('#picked-colors')
         .empty()
         .css
           display: 'block'
           opacity: 1.0

  setup_delete_button()

  setup_select_on_click = ->
    $(document)
    .on 'click', '.picked-color-item', (event) ->

      if $(event.target).is('.delete-button')
        return

      if $(event.target).is('input')
        event.target.select()
      if $(event.target).is('.picked-color-item')
        $(event.target).find('input')[0].select()
      else
        $(event.target).parents('.picked-color-item').find('input')[0].select()

    .on 'click', 'input.url', (event) ->
      event.target.select()

  setup_select_on_click()

  setup_load_on_submit = ->
    $('form').on 'submit', (event) ->
      img_url = $('input.url').val()
      return false unless img_url.length
      proxy_url = '/proxy/' + img_url
      image_url_prepared(proxy_url)
      false

  setup_load_on_submit()

  prepare_url_from_query = ->
    query = parse_query()
    url = query.url
    return unless url
    $('input.url').val(url)
    $('form').trigger('submit')

  prepare_url_from_query()
