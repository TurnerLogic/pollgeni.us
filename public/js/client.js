var socket = io();
var chart;
var allPolls = [];
var poll = null;
var ctx = null;
var initialLoad = true;
var chartData = [];
var code = window.location.pathname.toString().split('/')[2];
var resultsPage = '/polls/' + code + '/results';
var pollsPage = '/polls';


var url = window.location.pathname.toString();
console.log(url);

var COLORS = [
	'#e21400', '#91580f', '#f8a700', '#f78b00',
	'#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
	'#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];
var chartColors = [
	"#F7464A", "#ACBEA3", "#157A6E", "#499F68",
	"#68A357", "#FF33CC", "#444545", "#666699",
	"#32213A", "#40090D", "#E3D26F"
];

var testPollData = [
	{
		value: 15,
		color: chartColors[0],
		label: 'Test'
	},
	{
		value: 12,
		color: chartColors[1],
		label: 'Wank'
	}
];
var chartOptions = {
	//Boolean - Whether we should show a stroke on each segment
	segmentShowStroke: true,

	//String - The colour of each segment stroke
	segmentStrokeColor : "#212635",

	//Number - The width of each segment stroke
	segmentStrokeWidth: 2,

	//Number - The percentage of the chart that we cut out of the middle
	percentageInnerCutout: 0, // This is 0 for Pie charts

	//Number - Amount of animation steps
	animationSteps: 100,

	//String - Animation easing effect
	animationEasing: "easeInOutSine",

	//Boolean - Whether we animate the rotation of the Doughnut
	animateRotate: true,

	//String - A legend template
	legendTemplate : "<div id=\"legend-container\"><% for (var i=0; i<chartData.length; i++){%><div class=\"legend-wrapper clearfix\"><div class=\"legend-color\" style=\"background-color:<%=chartColors[i]%>\"></div><div class=\"legend-label\"><%if(chartData[i].label){%><%=chartData[i].label%><%}%></div></div><%}%></div>"
};


var spawnChart = function(code, ctx) {
	var jsonResultsUrl = "/polls/" + code + "/json-results";

	$.get(jsonResultsUrl, function(data, status) {
		$( '#poll-title' ).text(data.question);
		console.log(status);
		chartData = formatJsonData(data);
		console.log(chartData);

		if (initialLoad) {
			console.log('on initial load');
			if (url === pollsPage) {
				poll = new Chart(ctx).Pie(chartData, chartOptions);
					allPolls.push({
						'pollId': code,
						'poll': ctx,
						'chart': poll
					});
			} else if ( url === resultsPage) {
				chart = new Chart(ctx).Pie(chartData, chartOptions);
				var legend = chart.generateLegend();
				$('.pie-box').prepend(legend);
			}
		} else {
			if (url === pollsPage) {
				for (var i = 0; i < allPolls.length; i++) {
					if(allPolls[i].pollId == code) {
						chart = allPolls[i].chart;
					}
				}
			}
			console.log(chartData);
			console.log('being sent to updateChartData');
			updateChartData(chartData);
		}
	});
};

var updateChartData = function(data) {
	console.log(chart.segments.length);
	for (var j = 0; j < data.length; j++) {
		for (var i = 0; i < chart.segments.length; i++) {
			if (data[j].label === chart.segments[i].label) {
				chart.segments[i].value = data[j].value;
				break;
			} else if ( i === chart.segments.length - 1) {
				chart.addData(data[j]);
			}
		}
	}
	console.log('calling update chart');
	chart.update();
};

var formatJsonData = function(poll) {
	var pollData = [];
	var colorLength = chartColors.length;
	poll.responses.forEach(function (element, index) {
		var i = null;
		if (index > colorLength) {
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

socket.on('poll submission', function(code) {
	initialLoad = false;
	console.log('poll submission');
	spawnChart(code, ctx);
});

$( document ).ready(function () {

	if (url === pollsPage) {
		console.log('subscribing to public');
		socket.emit('public');
		for (var a = 0; a < $('.poll_code').length; a++) {
			code = $('.poll_code')[a].innerHTML;
			ctx = document.getElementById(code).getContext("2d");
			spawnChart(code, ctx);
		}
	} else if (url === resultsPage) {
		socket.emit('subscribe', code);
		console.log(socket.rooms);
		console.log('spawning chart');
		ctx = $("#chart").get(0).getContext("2d");
		spawnChart(code, ctx); // code pulled from url
		$('.twitter-share-button').attr('href', "https://twitter.com/tweet?text=Hey!%20you%20can%20view%20my%20awesome%20poll!%20at%20pollgeni.us/polls/"+ code+"/");
	}
});
