(function() {
'use strict';


/**
 * Main Controller
 */
angular.module('app').controller('mainController', Controller);


	function Controller($scope) {
	
		$scope.loginForm = {};
		$scope.loginForm.user = '';
		$scope.loginForm.pwd = '';
    	$scope.loginForm.submitTheForm = function(item, event) {
			
		};

		
	}

})();