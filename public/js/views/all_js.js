var number = 0;
$(document).ready(function(){
  $.each( $('.col-xs-4'), function (index, value) {
    $(this).prepend('<canvas id="'+ $('.poll_code')[number].innerHTML +'" class="multiple-results" width="200px" height="200px" ></canvas> ');
    number++;
  });

  for(var i = 0; i < $('.col-xs-4').length; i+=3) {
      $('.col-xs-4').slice(i, i+3).wrapAll("<div class='row'><div class='three-by-one container'></div></div>");
  }
  $(window).resize(function(){
    if($(window).width() < 1200)
    {
      $('canvas').css('width','200px').css('height','200px');
    }
    if($(window).width() < 991)
    {
      $('canvas').css('width','200px').css('height','200px');
    }
    if($(window).width() < 640)
    {
      $('canvas').css('width','150px').css('height','150px');
    }
    if($(window).width() < 500)
    {
      $('canvas').css('width','100px').css('height','100px');
    }
  });
  $( '#polls-nav' ).addClass('active');
});
