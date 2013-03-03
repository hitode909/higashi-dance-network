seems_japanese = ->
    language = (navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0,2).toLowerCase()
    language is 'ja'

document.body.style.opacity = '0.0' unless seems_japanese()

$ ->
  localize = ->

    $('[data-english]').each ->
      $element = $(this)
      $element.text $element.attr('data-english')

    $('title').text($('[data-english-title]').attr('data-english-title'))
    $('img#logo').attr
      src: 'service-logo-en.png'

  do localize unless seems_japanese()

  $('body').animate({'opacity': 1.0}, 1000)

  $('.photo-item a').colorbox
    rel: 'gallery'
    returnFocus: false

   $('#cboxContent').click ->
      $.colorbox.close()
