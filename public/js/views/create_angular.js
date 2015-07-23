(function() {
$( '#create-poll-nav' ).addClass('active');
var app = angular.module('pollCreateApp', []);

app.config(function ($interpolateProvider) {
 $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
});

app.factory('pollService', function($http) {
return {
	savePoll: function(data, cb) {
		$http.post('/polls/create', data).success(cb);
	}
};
});

app.controller('PollCreateCtrl', function( $scope, pollService ) {

$scope.choices = [];

$scope.recaptchaResponse = null;
$scope.choiceNew = "";
$scope.choiceEdit = "";

$scope.question = "";

$scope.poll = {};

$scope.addQuestion = function()
{
	console.log('question added');
};

$scope.removeChoice = function(index)
{
	$scope.choices.splice(index, 1);
};

$scope.addChoice = function()
{
	if($scope.choices.indexOf($scope.choiceNew) === -1)
	{
		$scope.choices.push($scope.choiceNew);
		$scope.choiceNew = '';
		console.log($scope.choices);
	} else {
		console.log('Duplicate choices are not allowed.');
	}
};

$scope.submitPoll = function() {

	$scope.recaptchaResponse = $( '#g-recaptcha-response' ).val();
	console.log($scope.recaptchaResponse);

	$scope.poll = {
		question: $scope.question,
		choices: $scope.choices,
		recaptchaResponse: $scope.recaptchaResponse
	};

	pollService.savePoll($scope.poll, function(data, status) {
		console.log(data);
		if(status === 200)
		{
			var redirectUrl = data.code + '?token=' + data.token;
			window.location = redirectUrl;
		} else if(status === 403) {
			// some dom element flash message about failure
		}
	});
};

});
}());
