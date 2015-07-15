$(window).resize(function(){

  if ($(window).width() < 700)
  {
  	$('.poll-holder').removeClass('col-md-12');
  	$('.poll-holder').addClass('row');
  	$('.choice-holder').removeClass('col-xs-4');
  	$('.choice-holder').addClass('col-xs-6');
  } else {
  	$('.poll-holder').addClass('col-md-12');
  	$('.poll-holder').removeClass('row');
  	$('.choice-holder').addClass('col-xs-4');
  	$('.choice-holder').removeClass('col-xs-6');
  }
  
});
