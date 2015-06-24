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
	.controller('gameController', ['PlayerService', 'BoardService', 'TicTacToeService',
		function(PlayerService, BoardService, TicTacToeService) {
		var ticPlayers = PlayerService.getPlayers();
		var first = PlayerService.firstPlayer(ticPlayers, 2);
		var self = this;

		function startGame() {
			self.showFirst = true;
			self.playTime = false;
			self.playerWins = false;
			self.stalemate = false;
			self.firstPlayer = first;
			var turnOffset = first.id;
			self.activePlayer = this.firstPlayer; 
			self.board = BoardService.newBoard(3);
			self.gameBoard = BoardService.getBoard();
		}
		
		startGame();

		// function for when a player selects a position on the board
		self.clicked = function(objId) {
			this.showFirst = false;
			this.playTime = true;
			this.displayTurn = PlayerService.displayPlayer();
			this.player = PlayerService.activePlayer();
			this.gameBoard = BoardService.getBoard();
			var elementId = Number(objId.toElement.id);
			if (BoardService.addMark(elementId, this.player)) {
				PlayerService.nextPlayer();
			} else {
				return;
			}
			this.playerWins = TicTacToeService.playerWin(this.player, this.gameBoard, 3);
			if (!this.playerWins) {
				this.stalemate = TicTacToeService.isStalemate(this.gameBoard);
			}
		}; 

		// function for starting a new game with the same players
		self.newGame = function() {
			startGame();
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
		var array;

		return {
			// retrieves the board
			getBoard: function() {
				return board;
			},
			// sets up a new empty square board 
			newBoard: function(size) {
				board = [];
				var boardSize = size * size;
				for (var i=0; i < boardSize; i++) {
					board.push("");
				}
				return board;
			},
			// adds a mark to the board if the position is empty
			addMark: function(elementId, player) {
				var markAdded;
				if (board[elementId] === '') {
					board[elementId] = player.symbol;
					markAdded = true;
				} else {
					markAdded = false;
				}
				return markAdded;
			}
		};
	}])	

	.factory('TicTacToeService', [function() {

		return {
			// function for checking if a player has won, returns true if a player has won
			playerWin: function(player, board, bSize) {
				var win;
				// check rows and columns
				for (var i = 0; i < bSize; i++) {
					if (board[0 + i * bSize] == player.symbol && board[1 + i * bSize] == player.symbol && board[2 + i * bSize] == player.symbol) {
						win = true;
					}
					else if (board[i] == player.symbol && board[i + 1 * bSize] == player.symbol && board[i + 2 * bSize] == player.symbol) {
						win = true;
					}
				}
				// generate a list with the value at each diagonal position
				var diag1 = [];
				for (i = 0; i < bSize; i++) {
					var diagPosition = bSize * i + i;
					diag1.push(board[diagPosition]); 
				}
				// Check if the list has the same value for each element of the list
				var firstDiag = new Set(diag1);
				if (firstDiag.size == 1 && firstDiag.has(player.symbol)) {
					win = true;
				}
				// uses the same strategy as above
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
			isStalemate: function(board) {
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
			// returns the first player of the game at random
			firstPlayer: function(playerArray, max) {
				// min is equal to 0 in this case
				turn = 0;
				turnOffset = Math.floor(Math.random() * max);
				var first = playerArray[turnOffset];
				return first;
			},
			// returns the player whose just took their turn 
			activePlayer: function() {
				return players[(turn + turnOffset) % players.length];
			},
			// Increments the turn number for game progression
			nextPlayer: function() {
				turn += 1;
			},
			// Displays the current player  
			displayPlayer: function() {
				return players[(turn + turnOffset + 1) % players.length];
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
