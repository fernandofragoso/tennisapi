var rankingApp = angular
	.module("RankingApp", ['ngRoute','ngResource'])
	.config(['$routeProvider', function($routeProvider){
		$routeProvider.
			when("/login",{templateUrl:'partials/login.html',controller:'LoginController'}).
			when("/players",{templateUrl:'partials/players.html',controller:'PlayerController'}).
			when("/matches",{templateUrl:'partials/matches.html',controller:'MatchController'}).
			when("/matches/:tournId",{templateUrl:'partials/matches.html',controller:'MatchController'}).
			otherwise({redirectTo:'/'});
	}]);

// rankingApp.factory('Data', function(){

// });

rankingApp.controller("LoginController",['$scope','$http','$window', function($scope, $http, $window){

	$('#loginmodal').modal('show');

	$('#loginmodal').on('hidden.bs.modal', function () {
	    $scope.changeRoute('/#/');
	})

	$scope.submit = function(){

		$http.post('/adm/login').success(function(data){
			alert(data);
		}).error(function(data){
			alert(data);
		});
	}

}]);

rankingApp.controller("PlayerController",['$scope','$window','$routeParams', function($scope, $window, $routeParams){

	//SHOW MODAL
	$('#playermodal').modal('show');

	$('#playermodal').on('hidden.bs.modal', function () {
	    $scope.changeRoute('/#/');
	});

	$scope.submit = function(){

		this.player.points = 0;
		$scope.Player.save(this.player, function(data){
			// $scope.changeRoute('/#/');
		});
	}

}]);

rankingApp.controller("MatchController",['$scope','$window','$routeParams', function($scope, $window, $routeParams){

	$scope.setsp1 = [];
	$scope.setsp2 = [];
	$scope.tournid_test = "TESTE";

	//SHOW MODAL
	$('#matchmodal').modal('show');

	$('#matchmodal').on('hidden.bs.modal', function () {
	    $scope.changeRoute('/#/');
	})

	$scope.tournId = $routeParams.tournId;

	$scope.submit = function(){

		$scope.p1_id = this.match.p1_id;
		$scope.p2_id = this.match.p2_id;

		//INITIALIZE SCORES
		this.match.score = {};
		this.match.score.games = [];
		this.match.score.set_p1 = 0;
		this.match.score.set_p2 = 0;

		//SET TOURN ID
		this.match.tourn_id = $scope.tournId;

		//CHECKING WO
		if ($scope.setsp1[0] == "W") {
			this.match.score.wo = true;
			this.match.score.set_p1 = 2;
			this.match.score.set_p2 = 0;
		} else if ($scope.setsp2[0] == "W") {
			this.match.score.wo = true;
			this.match.score.set_p1 = 0;
			this.match.score.set_p2 = 2;
		} else {
			this.match.score.wo = false;

			//COUNTING SCORES
			if ($scope.setsp1[0]!=$scope.setsp2[0]) {
				if ($scope.setsp1[0] > $scope.setsp2[0]) {
					this.match.score.set_p1++;
				} else {
					this.match.score.set_p2++;
				}
			}

			if ($scope.setsp1[1]!=$scope.setsp2[1]) {
				if ($scope.setsp1[1] > $scope.setsp2[1]) {
					this.match.score.set_p1++;
				} else {
					this.match.score.set_p2++;
				}
			}

			if ($scope.setsp1[2]!=$scope.setsp2[2]) {
				if (parseInt($scope.setsp1[2]) > parseInt($scope.setsp2[2])) {
					this.match.score.set_p1++;
				} else {
					this.match.score.set_p2++;
				}
			}

			//SET GAMES
			this.match.score.games[0] = {};
			this.match.score.games[0].game_p1 = $scope.setsp1[0];
			this.match.score.games[0].game_p2 = $scope.setsp2[0];
			this.match.score.games[1] = {};
			this.match.score.games[1].game_p1 = $scope.setsp1[1];
			this.match.score.games[1].game_p2 = $scope.setsp2[1];
			if ($scope.setsp1[2]!=$scope.setsp2[2]) {
				this.match.score.games[2] = {};
				this.match.score.games[2].game_p1 = $scope.setsp1[2];
				this.match.score.games[2].game_p2 = $scope.setsp2[2];
			}

		}

		//CALCULATE POINTS
		//
		//RR - 10/5
		//R32 - 10
		//R16 - 10
		//R8 - 10
		//Q - 20
		//S - 20
		//F - 50/20
		//
		var points_p1 = 0;
		var points_p2 = 0;

		if (this.match.score.set_p1!=this.match.score.set_p2) {

			switch(this.match.round){
				case "RR":
					console.log("RR");
					if (this.match.score.set_p1>this.match.score.set_p2){
						points_p1 += 10;
						if(!this.match.score.wo){
							points_p2 += 5;
						}
					} else {
						points_p2 += 10;
						if(!this.match.score.wo){
							points_p1 += 5;
						}
					}
					console.log(points_p1);
					console.log(points_p2);
					break;
				case "R32":
				case "R16":
				case "R8":
					points_p1 += 10;
					points_p2 += 10;
					break;
				case "Q":
				case "S":
					points_p1 += 20;
					points_p2 += 20;
					break;
				case "F":
					points_p1 += 20;
					points_p2 += 20;
					if (this.match.score.set_p1>this.match.score.set_p2){
						points_p1 += 30;
					} else {
						points_p2 += 30;
					}
					break;
			}

			$scope.updatePlayerList(function(){

				var player1 = $scope.findPlayerById($scope.p1_id);
				var player2 = $scope.findPlayerById($scope.p2_id);

				player1.points += points_p1;
				$scope.Player.update({ id:player1._id }, player1);

				player2.points += points_p2;
				$scope.Player.update({ id:player2._id }, player2);
			});

		}
		
		$scope.Match.save(this.match, function(data){
			//$scope.changeRoute('/#/');
		});
	}

}]);

rankingApp.controller("PageController",['$scope', function($scope){

	$scope.showTab = function(num) {
	    
		switch(num){
			case 1:
				$("#tab_ranking").addClass("active");
				$("#tab_tournaments").removeClass("active");
				$("#div_ranking").show();
				$("#div_tournaments").hide();
				break;
			case 2:
				$("#tab_ranking").removeClass("active");
				$("#tab_tournaments").addClass("active");
				$("#div_ranking").hide();
				$("#div_tournaments").show();
				break;
			default:
				break;
		}

	}

}]);

