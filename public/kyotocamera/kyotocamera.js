$(function() {
  $('.photo-item a').colorbox({
    rel: 'gallery',
    returnFocus: false
  });
  return $('#cboxContent').click(function() {
    return $.colorbox.close();
  });
});