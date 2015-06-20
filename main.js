angular.module('gameApp', ['ngRoute'])

	.controller('playerController', ['$location', 'PlayerService',
		function($location, PlayerService) {
		this.genPlayer = false;
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
	.controller('gameController', ['PlayerService', 'BoardService',
		function(PlayerService, BoardService) {
		var ticPlayers = PlayerService.getPlayers();
		var first = PlayerService.firstPlayer(ticPlayers, 2);
		
		this.showFirst = true;
		this.firstPlayer = first;
		this.playTime = false;
		var turnOffset = first.id;
		
		this.activePlayer = this.firstPlayer; 
		this.board = BoardService.newBoard(3);
		this.gameBoard = BoardService.getBoard();
		this.playerWins = false;
		this.stalemate = false;

		this.clicked = function(objId) {
			this.showFirst = false;
			this.playTime = true;
			this.displayTurn = PlayerService.displayPlayer();
			var elementId = Number(objId.toElement.id);
			this.player = PlayerService.activePlayer();
			BoardService.addMark(elementId, this.player);
			this.playerWins = BoardService.playerWin(this.player, 3);
			if (!this.playerWins) {
				this.stalemate = BoardService.isStalemate();
			}
		}; 

		this.newGame = function() {
			first = PlayerService.firstPlayer(ticPlayers, 2);
			this.firstPlayer = first;
			this.board = BoardService.newBoard(3);
			this.gameBoard = BoardService.getBoard();
			this.playerWins = false;
			this.playTime = false;
			this.showFirst = true;
			this.stalemate = false;
		};

		// Template for the board
		this.ticTemplate = 'ticboard.html';
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
	.factory('BoardService', [function() {
		var board;

		return {
			getBoard: function() {
				return board;
			},
			newBoard: function(size) {
				board = [];
				turn = 0;
				var boardSize = size * size;
				for (var i=0; i < boardSize; i++) {
					board.push("");
				}
				return board;
			},
			addMark: function(elementId, player) {
				board[elementId] = player.symbol;
				return board;
			},
			playerWin: function(player, bSize) {
				var win;
				for (var i = 0; i < bSize; i++) {
					if (board[0 + i * bSize] == player.symbol && board[1 + i * bSize] == player.symbol && board[2 + i * bSize] == player.symbol) {
						win = true;
					}
					else if (board[i] == player.symbol && board[i + 1 * bSize] == player.symbol && board[i + 2 * bSize] == player.symbol) {
						win = true;
					}
				}
				var diag1 = [];
				for (i = 0; i < bSize; i++) {
					var diagPosition = bSize * i + i;
					diag1.push(board[diagPosition]); 
				}
				var firstDiag = new Set(diag1);
				if (firstDiag.size == 1 && firstDiag.has(player.symbol)) {
					win = true;
				}
				var diag2 = [];
				for (i = 0; i < bSize; i++) {
					var diagPosition2 = (bSize - 1) + 2 * i;
					diag2.push(board[diagPosition2]);
				}
				var secDiag = new Set(diag2);
				if (secDiag.size == 1 && secDiag.has(player.symbol)) {
					win = true;
				}
				if (win) {
					return true;
				} else {
					return false;
				}					
			},
			isStalemate: function() {
				var stalemate;
				for (i = 0; i < board.length; i++) {
					if (board[i] === '') {
						stalemate = false;
						return stalemate;
					} 
				}
				stalemate = true;
				return stalemate;
			}
		};
	}])

	.factory('PlayerService', [function() {
		var players;
		var turn;
		var turnOffset;

		return {
			// Saves the list of players as a variable on the factory
			playerList: function(playerArray) {
				players = playerArray;
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
			firstPlayer: function(playerArray, max) {
				// min is equal to 0 in this case
				turn = 0;
				turnOffset = Math.floor(Math.random() * max);
				var first = playerArray[turnOffset];
				return first;
			},
			// returns the player whose just took their turn 
			activePlayer: function() {
				var playerTurn = players[(turn + turnOffset) % players.length];
				turn += 1;
				return playerTurn;
			},
			// Displays the current player  
			displayPlayer: function() {
				var display = players[(turn + turnOffset + 1) % players.length];
				return display;
			},
			// function for validating that the players entered unique values for their names and board symbols
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
