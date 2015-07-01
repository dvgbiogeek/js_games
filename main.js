angular.module('gameApp', ['ngRoute'])

	.controller('playerController', ['$location', 'PlayerService', 'GameService',
		function($location, PlayerService, GameService) {
		this.genPlayer = false;
		this.duplicates = true;
		
		// Get player information
		this.getPlayers = function(number, game) {
			this.genPlayer = true;
			this.game = GameService.gameSelected(game);
			this.players = PlayerService.generatePlayers(number);
		};

		// Validate, then submit information about each player
		this.submit = function() {
			this.duplicates = PlayerService.playersValid(this.players);
			PlayerService.playerList(this.players);
			// currently goes to TicTacToe - will need to generalize
			$location.path(GameService.gameLocation());
		};
		// Template for getting player information
		this.playerTemplate = 'player.html';
	
	}])
	.controller('gameController', ['PlayerService', 'GameService','BoardService', 'TicTacToeService',
		function(PlayerService, GameService, BoardService, TicTacToeService) {
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
			if (BoardService.addMark(elementId, this.player.symbol)) {
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
	
	.controller('battleController', ['PlayerService', 'BattleService', 'BoardService',
		function(PlayerService, BattleService, BoardService) {
		var self = this;
		self.board = BattleService.newBoard();
		self.gameBoard = BattleService.getBoard();
		self.htmlBoard = BoardService.getHtmlBoard(8);

		BattleService.addShips();

		self.clicked = function(objId) {
			var elementId = Number(objId.toElement.id);
			console.log(elementId);
		};
	}])

	.config(function($routeProvider) {
		$routeProvider.when('/', {
			templateUrl: 'games.html',
			controller: 'playerController'
		})
		.when('/tic', {
			templateUrl: 'ticboard.html',
			controller: 'gameController as game'
		})
		.when('/battle', {
			templateUrl: 'battle.html',
			controller: 'battleController as battle'
		});
	})

	.factory('BoardService', [function() {
		var board;
		var htmlBoard;

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
			// sets up the board for display by html
			getHtmlBoard: function(size) {
				htmlBoard = [];
				for (var i = 0; i < board.length; i++) {
					if (i % size === 0) htmlBoard.push([]);
					htmlBoard[htmlBoard.length - 1].push(i);
				}
				return htmlBoard;
			},
			// adds a mark to the board if the position is empty
			addMark: function(elementId, mark) {
				var markAdded;
				if (board[elementId] === '') {
					board[elementId] = mark;
					markAdded = true;
				} else {
					markAdded = false;
				}
				return markAdded;
			},
			// convert board index to coordinates
			posToCoordinates: function(pos, size) {
				var x = pos % size;
				var y = (pos - x) / size;
				return {
					x: x,
					y: y
				};
			},
			// convert coordinate position to board index
			coordinatesToPos: function(x, y, size) {
				pos = y * size + x;
				return pos;
			}
		};
	}])	

	.factory('BattleService', ['BoardService', function(BoardService) {
		// a list of ships objects in battleship
		var shipTypes = [
        	{"name": "Aircraft Carrier", "shipLength": 5, "health": 5, "sunk": false},
        	{"name": "Battleship", "shipLength": 4, "health": 4, "sunk": false},
        	{"name": "Destroyer", "shipLength": 3, "health": 3, "sunk": false},
        	{"name": "Submarine", "shipLength": 3, "health": 3, "sunk": false},
        	{"name": "Patrol Boat", "shipLength": 2, "health": 2, "sunk": false},
    	];
    	// board inherits all the methods from BoardService
    	var board = Object.create(BoardService);
    	var size = 8;

		return {
			// retrieves the board
			getBoard: function() {
				return board.getBoard();
			},
			// generates a new board
			newBoard: function() {
				return board.newBoard(size);
			},
			// adds all the ships to the board in random locations - checks if position 
			// is valid prior to adding a ship to the board
			addShips: function() {
				var location;
				var verticalOrHorizontal;
				var shipName;
				var valid;
				var shipsPlaced = 0;
				var shipOb = 0;

				while (shipsPlaced < shipTypes.length) {
					var ship = shipTypes[shipOb];
					shipName = shipTypes[shipOb].name[0];
					setLocation();
					vertOrHor();
					valid = verifyPlacement(ship);
					while (valid) {
						placeShip(ship);
						shipsPlaced++;
						shipOb++;
						valid = false;
					}
				}		

				// function to place ships on the board
				function placeShip(ship) {
					if (verticalOrHorizontal === 0) {
						for (i = 0; i < ship.shipLength; i++) {
							board.addMark(location + i, shipName);
						}
					} else if (verticalOrHorizontal === 1) {
						for (i = 0; i < ship.shipLength; i++) {
							board.addMark(location + i * size, shipName);	
						}	
					} 						
				}

				// a function that obtains a random location on the board
				function setLocation() {
					location = Math.floor(Math.random() * board.getBoard().length);
				}

				// function that determines if the ship should be vertical or horizontal on the board 
				function vertOrHor() {
					verticalOrHorizontal = Math.floor(Math.random() * 2);
				}

				// function verifies the ships position
				function verifyPlacement(ship) {
					var viable;
					// converts the board position to coordinates
					var coords = board.posToCoordinates(location, size);
					
					// first check if the ship is horizontal and the end of the ship is within the boundries of the board
					if (verticalOrHorizontal === 0 && coords.x + ship.shipLength < size + 1) {
						for (i = 0; i < ship.shipLength; i++) {	
							// then check if the ship will overlap with other ships
							if (board.getBoard()[location + i] !== "") {
								// if so, the location is not viable
								viable = false;
							}
						}
					// then check if the ship is vertical and within the boundry of the board
					} else if (verticalOrHorizontal === 1 && coords.y + ship.shipLength < size + 1) {
						for (i = 0; i < ship.shipLength; i++) {	
							// if there is overlap with other ships the position is not viable
							if (board.getBoard()[location + i * size]) {
								viable = false;
							}
						}
					// if the ship is not within the boundries of the board, the position is not viable
					} else {
						viable = false;
					}
					if (viable === false) {
						return viable;
					} else {
						viable = true;
						return viable;
					}
				}
	
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
			// checks if the game is a stalemate
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

	// factory for setting up the game handler
	.factory('GameService', ['$location', function($location) {
		var selectGame;
		var gameUrl;

		return {
			// returns the selected game
			gameSelected: function(game) {
				selectGame = game;
				return;
			},
			// retrieves the selected game
			getGame: function() {
				return selectGame;
			},
			// redirects the user to their desired game
			gameLocation: function() {
				if (selectGame == "tic") {
					gameUrl = "/tic";
				} else if (selectGame == "battle") {
					gameUrl = "/battle";
				}
				return gameUrl;
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
				return;
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
