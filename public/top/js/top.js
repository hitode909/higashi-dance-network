$(function() {
  return $('.item').each(function() {
    var item, max_x, max_y, r, x, y;
    item = this;
    x = Math.random() * 200 + 50;
    y = Math.random() * 200 + 50;
    r = Math.random();
    max_x = $('.items').width();
    max_y = $('.items').height();
    return setInterval(function() {
      r += (Math.random() - 0.5) * 0.5;
      x += Math.sin(r) * 3;
      y += Math.cos(r) * 3;
      return $(item).css({
        left: x,
        top: y
      });
    }, 20);
  });
});