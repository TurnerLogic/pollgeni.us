$(document).ready(function() {
  $(window).resize(function(){
    if ($(window).width() < 480)
    {
      $('#chart').css("width", "360").css('height', "360");
    }
    else
    {
      $('#poll-results').css("width", "460").css('height', "460");
    }
  });
  var code = window.location.pathname.toString().split('/')[2];
  $('#share_button').click(function(e){
    e.preventDefault();
    FB.ui({
      method: 'feed',
      name: document.getElementById('pollTitle').innerHTML,
      link: ' http://jdgarza.com/',
      description: "you can vote and view this poll using the code: "+ code + " at pollgeni.us",
      message: ''
    });
  });
});
