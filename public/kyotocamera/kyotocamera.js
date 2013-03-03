document.body.style.opacity = '0.0';
$(function() {
  var localize;
  localize = function() {
    var language;
    language = (navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0, 2).toLowerCase();
    if (language === 'ja') {
      return;
    }
    $('[data-english]').each(function() {
      var $element;
      $element = $(this);
      return $element.text($element.attr('data-english'));
    });
    $('title').text($('[data-english-title]').attr('data-english-title'));
    return $('img#logo').attr({
      src: 'service-logo-en.png'
    });
  };
  localize();
  $('body').animate({
    'opacity': 1.0
  }, 1000);
  $('.photo-item a').colorbox({
    rel: 'gallery',
    returnFocus: false
  });
  return $('#cboxContent').click(function() {
    return $.colorbox.close();
  });
});