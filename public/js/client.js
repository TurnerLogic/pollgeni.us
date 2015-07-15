var code = window.location.pathname.toString().split('/')[2];
var socket = io(); //namespace

socket.emit('subscribe', code);
var pollResults;
var poll = null;
var ctx = null;
var initialLoad = true;
var chartData = [];
var chartColors = ["#F7464A", "#ACBEA3", "#157A6E", "#499F68", "#68A357", "#FF33CC", "#444545", "#666699", "#32213A", "#40090D", "#E3D26F"];
var ctx = $("#poll-results").get(0).getContext("2d");

	var chartOptions = {
		    //Boolean - Whether we should show a stroke on each segment
		    segmentShowStroke : true,

		    //String - The colour of each segment stroke
		    segmentStrokeColor : "#212635",

		    //Number - The width of each segment stroke
		    segmentStrokeWidth : 2,

		    //Number - The percentage of the chart that we cut out of the middle
		    percentageInnerCutout : 0, // This is 0 for Pie charts

		    //Number - Amount of animation steps
		    animationSteps : 100,

		    //String - Animation easing effect
		    animationEasing : "easeInOutSine",

		    //Boolean - Whether we animate the rotation of the Doughnut
		    animateRotate : true,

		    //Boolean - Whether we animate scaling the Doughnut from the centre
		    animateScale : false,

		    //String - A legend template
		    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend row\"><% for (var i=0; i<chartData.length; i++){%><li class=\"col-md-2\"><span style=\"background-color:<%=chartColors[i]%>\"></span><%if(chartData[i].label){%><%=chartData[i].label%><%}%></li><%}%></ul>"


		};

var spawnChart = function(code)
{
	var jsonResultsUrl = "/polls/" + code + "/json-results";

	$.get(jsonResultsUrl, function(data)
	{
		chartData = formatJsonData(data);

		if( initialLoad )
		{
			pollResults = new Chart(ctx).Pie(chartData, chartOptions);
  			var legend = pollResults.generateLegend();
  			$( '#pollContainer' ).append(legend);
		} else {
			console.log('not inital load');
			updateChartData(chartData);
		}

		$( '#pollTitle' ).text(data.question);
	});
}

var updateChartData = function(data)
{
	console.log(pollResults.segments.length);
	for(var j = 0; j < data.length; j++)
	{
		console.log(data[j].label);
		for(var i = 0; i < pollResults.segments.length; i++)
		{
			console.log(pollResults.segments[i].label);
			if(data[j].label === pollResults.segments[i].label)
			{
				pollResults.segments[i].value = data[j].value;
				console.log("these match " + pollResults.segments[i].label + ' ' + data[j].label )
				break;
			} else if( i === pollResults.segments.length - 1) {
				console.log('no matches on ' + data[j].label);
				pollResults.addData(data[j]);
			}
		}
	}

	console.log(pollResults);

	pollResults.update();
}

var formatJsonData = function(poll)
{
	var pollData = [];
	var colorLength = chartColors.length;

	poll.responses.forEach(function(element, index)
	{

		var i = null;
		if(index > colorLength) {
			i = index - colorLength % colorLength;
		} else {
			i = index;
		}

		pollData.push({
			value: element.count,
			color: chartColors[i],
			label: element.choice

		});
	});

	return pollData;
 };


$( document ).ready(function()
{
	spawnChart(code); // code pulled from url
	console.log('spawning chart');
});

socket.on('poll submission', function(code)
{
	initialLoad = false;
	console.log('poll submission');
	spawnChart(code);
});
