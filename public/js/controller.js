    var myApp = angular.module('myApp', ["chart.js"], function($interpolateProvider) {
        $interpolateProvider.startSymbol('{%');
        $interpolateProvider.endSymbol('%}');
    });


myApp.controller('appCtrl',['$scope','$http',function($scope,$http) {

	var option1Incremented = false;
	var option2Incremented = false;
	$scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
  	$scope.data = [300, 500, 100];	
  console.log($scope.polls.data);
	var refresh = function () {
		$http.get('/polls').success(function(response) {
			console.log("i got the data");			
			$scope.polls = response;
			$scope.poll = "";
			console.log(polls.labels);
		});
	};

	refresh();

	$scope.addPoll = function() {
		console.log($scope.poll);
		$scope.poll.votesForOption1 = 0;
		$scope.poll.votesForOption2 = 0;
		$http.post('/polls',$scope.poll).success(function (response) {
			console.log(response);
			refresh();
		});
	};


	$scope.remove = function(id) {
		console.log(id);
		$http.delete('/polls/' + id).success(function (response) {
			refresh();
		});
	};

	$scope.edit = function(id) {
		console.log(id);
		$http.get('/polls/' + id).success(function (response) {
			$scope.poll = response;
		});
	};

	$scope.update = function () {
		console.log($scope.poll._id);
		$http.put('/polls/' + $scope.poll._id, $scope.poll).success(function (response) {
			refresh();
		});

	}

	$scope.deselect = function () {
		$scope.poll = "";
	}

	$scope.incrementOption1 = function(index) {
		if (option1Incremented) {return;};
		console.log($scope.polls[index]);
		$scope.polls[index].votesForOption1++;
		$http.put('/polls/' + $scope.polls[index]._id, $scope.polls[index]).success(function (response) {
			refresh();
		});    	
		option1Incremented = true;
  	}

	$scope.incrementOption2 = function(index) {
		if (option2Incremented) {return;};
		console.log($scope.polls[index]);
		$scope.polls[index].votesForOption2++;
		$http.put('/polls/' + $scope.polls[index]._id, $scope.polls[index]).success(function (response) {
			refresh();
		});    	
		option2Incremented = true;
	}
}]);

