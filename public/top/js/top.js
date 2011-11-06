$(function() {
  return $('.item').each(function() {
    var item, speed;
    item = this;
    speed = Math.random() * 5;
    return setTimeout(function() {
      var max_x, max_y, r, x, y;
      x = $(item).position().left;
      y = $(item).position().top;
      r = Math.random();
      max_x = $('.items').width();
      max_y = $('.items').height();
      return setInterval(function() {
        r += (Math.random() - 0.5) * 0.5;
        x += Math.sin(r) * speed;
        y += Math.cos(r) * speed;
        return $(item).css({
          left: x,
          top: y
        });
      }, 20);
    }, 1000 * Math.random());
  });
});