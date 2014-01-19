var Bacon = {
  init: function () {
    $('.triggers li a').on('click', function () {
      var type = $(this).data('type');
    });

    if (!navigator.userAgent.match(/Android|IEMobile|BlackBerry|iPhone|iPad|iPod|Opera Mini/i)) {
      $('.triggers li').hover(
        function () {
          var title = $('a', this).data('title');

          $('.description').show().html(title);
        },
        function () {
          $('.description').hide().html('');
        }
      );
    }

    this.loader.start();

    this.arrange();

    this.loader.stop();

    var ready = setInterval(function () {
      var error = 0;

      if (!error) {
        $.event.trigger({
          type: 'Bacon'
        });

        clearInterval(ready);
      }
    }, 500);
  },

  arrange: function() {
    var total = $('.triggers li').size();
    var degree = 360/total;

    if ("TransitionEvent" in window || "WebKitTransitionEvent" in window || "OTransitionEvent" in window) {

      $('.triggers li').each(function (i) {
        var animate = i+1;
        var trigger_rotate = degree*i;
        var icon_rotate = 45-trigger_rotate;

        var trigger_css = {
          'transform': 'rotate('+ trigger_rotate +'deg) translate(0, -160px)',
          'animation-delay': '1.'+ animate +'s'
        };

        var icon_css = {
          'transform': 'rotate('+ icon_rotate +'deg)'
        };

        $(this).css(trigger_css);
        $(this).find('i').css(icon_css);
      });

      $('.main').addClass('animate');
    } else {
      var radius = 175;
      var angle = 0;
      var step = (2*Math.PI) / $('.triggers li').length;

      $('.triggers li').each(function (i) {
        var x = Math.round(200/2 + radius * Math.cos(angle) - $(this).width()/2);
        var y = Math.round(200/2 + radius * Math.sin(angle) - $(this).height()/2);

        $(this).css({
          left: x + 'px',
          top: y + 'px'
        });

        angle += step;
      });

      $('.triggers').css({ 'margin-left': '-100px', 'margin-top': '-150px' })
      $('.triggers li').css('opacity', '1');
    }
  },

  loader: {
    start: function () {
      $('.loader').addClass('show');
    },
    stop: function () {
      $('.loader').removeClass('show');
    }
  }
};

Bacon.init();
