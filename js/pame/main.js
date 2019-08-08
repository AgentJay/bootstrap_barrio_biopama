/* MAIN SCRIPOT TO LOAD CARDS APPLICATIONS */
jQuery(document).ready(function($) {

  var first_load = true;
  var sequential = 0;

  // empty array = no background-imgs
  // var bkgd_imgs = [ '/themes/custom/bootstrap_barrio_biopama/img/landingpage/bkgd_satellite_01.jpg' ,
  //                  '/themes/custom/bootstrap_barrio_biopama/img/landingpage/bkgd_satellite_03.jpg',
  //                  '/themes/custom/bootstrap_barrio_biopama/img/landingpage/bkgd_satellite_05.jpg',
  //                  '/themes/custom/bootstrap_barrio_biopama/img/landingpage/bkgd_satellite_02.jpg' ];
  var bkgd_imgs = [];

  //preload images source test
  $.each(bkgd_imgs,function(idx,imgurl){
    $('#preload-images').append('<img src="'+imgurl+'"/>');
    //$('.masthead-img').css('background-image', 'url("'+bkgd_imgs[idx]+'")' );
  });


  function scrollFunction() {
      if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
          document.getElementById("myBtn_scrollTop").style.display = "block";
          $('nav').fadeOut(2000);
      } else {
          document.getElementById("myBtn_scrollTop").style.display = "none";
          $('nav').fadeIn(2000);
      }

      if (document.documentElement.scrollTop == 0 ){
        resetHeaderBkgd();
      }
  }



    function resetHeaderBkgd(){
      var idx = Math.floor(Math.round(Math.random() * (bkgd_imgs.length - 1),1));
      //sequential mode, initialized evry refresh of the page
      idx = sequential % bkgd_imgs.length;
      sequential+=1;

      if (first_load){
          // setTimeout(function(){
          //   $('.masthead-linear').fadeOut(1000);
          //   first_load = false;
          //   $('.masthead-img').css('background-image', 'url("'+bkgd_imgs[idx]+'")' );
          //   setTimeout(function(){    $('.masthead-img').fadeIn(3000);},1500);
          // },1500);

          setTimeout(function(){
            $('.masthead-linear').fadeOut(1000,function(){
              first_load = false;
              $('.masthead-img').css('background-image', 'url("'+bkgd_imgs[idx]+'")' );
              setTimeout(function(){ $('.masthead-img').fadeIn(3000);},200);
            });
          },1000);

      }else{
            $('.masthead-img').fadeOut(1000,function(){
                $('.masthead-img').css('background-image', 'url("'+bkgd_imgs[idx]+'")' );
                $('.masthead-img').fadeIn(4000);
            });
      }
    }


  // When the user clicks on the button, scroll to the top of the document
  function topFunction() {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      resetHeaderBkgd();
  }

  var hover_timeout;


//$( document ).ready(function() {

  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    //alert('navigating with mobile');
    console.log('mobile browsing');
  }

    // When the user scrolls down 20px from the top of the document, show the button
  resetHeaderBkgd();

  $('div.card-deck .card-body').hover(function(){
    //   $(this).find('p.card-text').slideDown(1500);
    var elem = $(this).find('p.card-text')[0];
    hover_timeout = setTimeout(function(){
        console.log(elem);
        // $($(elem)).slideDown(1500);
        $($(elem)).css('opacity', 0)
        .slideDown(1500)
        .animate(
          { opacity: 1 },
          { queue: false, duration: 1500 }
        );

    },500);
  },function(){
    //   $(this).find('p.card-text').slideUp(1500);
      clearTimeout(hover_timeout);
      // $(this).find('p.card-text').slideUp(1500);
      $(this).find('p.card-text').css('opacity', 1)
        .slideUp(1500)
        .animate(
          { opacity: 0 },
          { queue: false, duration: 1500 }
        );
  });


  $('.dashboard .card').hover(function(){
      $(this).addClass('card-zoomed');
  },function(){
      $(this).removeClass('card-zoomed');
  });

  $('#myBtn_scrollTop').on('click',function(){topFunction();});

  window.onscroll = function() {scrollFunction()};

  //background CARDS
  $('.hidden_background').each(function(){
    var img_url = $(this).html();
    if (img_url != ""){
      $(this).parent().css('background-image','url('+img_url+')');
      $(this).parent().css('background-size','cover');
      //$(this).parent().find('.card-body').css('margin-top','60%');
    }
  });

  $('.assessment-tools-more').on('click',function(){
    $(this).closest('.card').find('.assessment-tools-details').fadeToggle('slow');
  });


});
