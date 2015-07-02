var myApp = angular.module('myApp', ['chart.js','angular.filter'], function($interpolateProvider) {

	// interpolate tags are changed in order to be compatible with Hogan-Express
    $interpolateProvider.startSymbol('{%');
    $interpolateProvider.endSymbol('%}');
});

myApp.controller('appCtrl',['$scope','$http',function($scope,$http) {

	var socket = io(); //socket.io

	// call the items to be retrieved from DB
	var refresh = function () {
		$http.get('/polls').success(function(response) {
			console.log("i got the data");
			$scope.polls = response;
			$scope.poll = "";
		});
	};

	refresh();

	// this will refresh poll when called
	var refreshOnePoll = function (index) {
		$http.get('/polls/' + $scope.polls[index]._id).success(function (response) {
			$scope.polls[index] = response;
			$scope.poll = "";

		});
	};

	$scope.addPoll = function() {


		// $scope.polls.labels will equal the options for each poll 
		$scope.poll.labels = [];

		// $scope.polls.data will equal the number of votes for each answer that is selected
		$scope.poll.data = [];


		// POST $scope.poll and if successful refresh the data.
		$http.post('/polls',$scope.poll).success(function (response) {
			refresh();
		});
	};

	// when called will remove poll
	$scope.remove = function(id) {
		$http.delete('/polls/' + id).success(function (response) {
			refresh();
		});
	};

	// can be used for editing polls
	$scope.edit = function(id) {
		$http.get('/polls/' + id).success(function (response) {
			$scope.poll = response;
		});
	};

	// can be used for updating polls
	$scope.update = function () {
		$http.put('/polls/' + $scope.poll._id, $scope.poll).success(function (response) {
			refresh();
		});


	}


	$scope.deselect = function () {
		$scope.poll = "";
	};

	$scope.incrementOption = function(index,choice) {
		// if option1incremented or option2incremented is true return nothing
		// this will prevent user from being able to vote more than once
			// if (option1Incremented) {return;}
			// if(option2Incremented){return;}

			var indexToIncrement =  $scope.polls[index].labels.indexOf(choice);

			// // gets case parameter that is passed in on function and increments by one based on choice
			socket.emit('voted',$scope.polls[index].data[indexToIncrement]+=1,indexToIncrement);

  	};

  
}]);

myApp.directive("addchoice", function($compile){
	var number = 2;
	return function(scope, element, attrs){
		element.bind("click", function(){
			angular.element(document.getElementById('inputOptions')).append($compile("<div class='col-md-6'><br><input class='form-control' placeholder='What is the next option?' ng-model='poll.option["+ number +"]'></div>")(scope));
			number++;
		});
	};
});

myApp.directive("voteoptions", function($compile){
	var number = 0;
	return function(scope, element){
			angular.element(document.getElementById('allPolls')).replaceWith($compile('<a class="btn btn-primary" role="button" data-toggle="collapse" href="#collapse'+number+'" aria-expanded="false" aria-controls="collapse">Click To Vote</a><div class="collapse" id="collapse'+number+'"><div class="well"><button class="btn btn-danger" ng-click="incrementOption($index = '+ number +', eachChoice)" ng-repeat="eachChoice in eachPoll.option">{% eachChoice %}</button></div></div>')(scope));
			number++;			
	};
});


