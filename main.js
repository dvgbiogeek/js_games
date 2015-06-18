function clicked(id) {
	console.log("clicked " + id);
} 


// Game manager 
	// 1. creating a new game
	// 2. handling the game loop
	// 3. check if there is a winner
		// a. player gets 3 in a row
		// b. all the spaces are full

angular.module('gameApp', ['ngRoute'])

	.controller('playerController', ['$location', 'PlayerService',
		function($location, PlayerService) {
		this.genPlayer = false;
		// this.playerTurn = false;
		this.duplicates = true;
		
		// Get player information
		this.getPlayers = function(number) {
			this.genPlayer = true;
			this.players = PlayerService.generatePlayers(number);
		};

		// Validate, then submit information about each player
		this.submit = function() {
			this.duplicates = PlayerService.playersValid(this.players);
			PlayerService.playerList(this.players);
			$location.path('/tic');
		};
		// Template for getting player information
		this.playerTemplate = 'player.html';
	
	}])
	.controller('gameController', ['PlayerService', function(PlayerService) {
		var ticPlayers = PlayerService.getPlayers();
		console.log(ticPlayers);
		this.first = PlayerService.firstPlayer(ticPlayers, 2);
		console.log(this.first);
		
		// Template for the board
		this.ticTemplate = 'ticboard.html';
		// console.log(PlayerService.getPlayers());
	}])

	.config(function($routeProvider) {
		$routeProvider.when('/', {
			templateUrl: 'games.html',
			controller: 'playerController'
		})
		.when('/tic', {
			templateUrl: 'ticboard.html',
			controller: 'gameController'
		});
	})

	.factory('PlayerService', [function() {
		var players;

		return {
			// Saves the list of players as a variable on the factory
			playerList: function(playerArray) {
				players = playerArray;
				console.log(players);
				return players;
			},
			// retreives the list of players
			getPlayers: function() {
				return players;
			},
			// returns a list of empty player objects of length equal to the number provided
			generatePlayers: function(number) {
				players = [];
				for (var i = 0; i < number; i += 1) {
					players.push({'id': i, 'name': '', 'symbol': ''});
				}
				return players;
			},
			// returns 0 or 1 (min = 0, max = 2) for determining which player goes first
			randomPlayer: function(min, max) {
				// Math.floor returns an integer without rounding, Math.random generates a number between 0 and 1 
				return Math.floor(Math.random() * (max - min)) + min;
			},
			firstPlayer: function(playerArray, max) {
				console.log('calling firstPlayer');
				// min is equal to 0 in this case
				var turn = Math.floor(Math.random() * max);
				console.log(turn);
				var first = playerArray[turn];
				console.log(first);
				return first;
			},
			playersValid: function(playerArray) {
				// get a list of all the keys in the array
				var key = Object.keys(playerArray[0]);
				var valid;
				// for each key get the value associated with the key in each object in the player array
				var duplicates = key.forEach(function(k) {
					var temp = [];
					for (var i = 0; i < playerArray.length; i += 1) {
						temp.push(playerArray[i][k]);
					}
					// sort the values associated with the key
					var sortTemp = temp.sort();
					// check for duplicates in the sorted list of values
					for (i = 0; i < sortTemp.length; i += 1) {
						// if there are duplicates set the variable valid to false
						if (sortTemp[i + 1] == sortTemp[i]) {
							valid = false;
						}
					}
				});
				if (valid === false) {
					return false;
				}
				else {
					return true;
				}
			}
		};
	}]);
