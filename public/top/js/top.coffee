$ ->
  $('.item').each ->
    item = this
    speed = Math.random() * 5
    setTimeout ->
      x = $(item).position().left
      y = $(item).position().top
      r = Math.random()
      max_x = $('.items').width()
      max_y = $('.items').height()
      setInterval ->
        r += (Math.random() - 0.5) * 0.5
        x += Math.sin(r) * speed
        y += Math.cos(r) * speed

        $(item).css
          left: x
          top:  y
      , 20
    ,1000 * Math.random()