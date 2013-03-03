document.body.style.opacity = '0.0'

$ ->
  localize = ->
    language = (navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0,2).toLowerCase()
    return if language is 'ja'

    $('[data-english]').each ->
      $element = $(this)
      $element.text $element.attr('data-english')

    $('title').text($('[data-english-title]').attr('data-english-title'))
    $('img#logo').attr
      src: 'service-logo-en.png'

  do localize

  $('body').animate({'opacity': 1.0}, 1000)

  $('.photo-item a').colorbox
    rel: 'gallery'
    returnFocus: false

   $('#cboxContent').click ->
      $.colorbox.close()
