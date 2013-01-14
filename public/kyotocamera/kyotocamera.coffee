$ ->
  $('.photo-item a').colorbox
    rel: 'gallery'
    returnFocus: false

   $('#cboxContent').click ->
      $.colorbox.close()
