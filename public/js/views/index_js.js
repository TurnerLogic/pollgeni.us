var socket, numUsers;

// numUsers = parseInt($( '#active-users' ).text(), 10);
$( '#home-nav' ).addClass('active');
socket = io();
socket.emit('index');

    socket.on('meta-connection', function (numUsers) {
      console.log('connected');
      $( '#active-users' ).text(numUsers);
    });

    socket.on('meta-disconnect', function (numUsers) {
      console.log('diconnect');
      console.log(numUsers);
      $( '#active-users' ).text(numUsers);
    });

    socket.on('poll creation', function () {
      var totalPolls = parseInt( $('#total-polls').text() );
      totalPolls++;
      $( '#total-polls' ).text(totalPolls);
    })
        var myColor = ["#ECD078","#D95B43","#C02942","#542437","#53777A","#5B43B2","#245437"];
        var myData = [65,45,25,35,104,99,80];

        function getTotal(){
            var myTotal = 0;
            for (var j = 0; j < myData.length; j++) {
                myTotal += (typeof myData[j] == 'number') ? myData[j] : 0;
            }
            return myTotal;
        }

        function plotData() {
            var canvas;
            var ctx;
            var lastend = 0;
            var myTotal = getTotal();

            canvas = document.getElementById("canvas");
            ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (var i = 0; i < myData.length; i++) {
                ctx.fillStyle = myColor[i];
                ctx.beginPath();
                ctx.moveTo(200,150);
                ctx.arc(200,150,150,lastend,lastend+
                  (Math.PI*2*(myData[i]/myTotal)),false);
                ctx.lineTo(200,150);
                ctx.fill();
                lastend += Math.PI*2*(myData[i]/myTotal);
            }
        }

        plotData();

        socket.on('poll submission', function() {
          console.log('poll submissions');
          console.log();
          var currentValue = parseInt($( '#poll-submissions' ).text(), 10);
          currentValue++;
          $( '#poll-submissions').text(currentValue);
        });
