/**
* Defines the various ship game piece objects which represent the
* ships the players place on the game board.
* @class Ship
* @param {string}
* @return {string}
*/

class Ship {
    constructor(shipName, size, coordinates, direction, hits) {
        this.shipname = shipName;
        this.size = size;
        this.coordinates = coordinates;
        this.direction = direction;
        this.hits = hits;
    }

    /**
     * Controls the placement of ships during the ship placement 
     * stage of the game. 
     * @method placeShip
     */
    placeShip() {
        console.log("Place Ship!");
    }

    /**
     * Take a ship objects coordinates and transforms them to rotate the ship 90
     * degrees clockwise. Calls checkPlacement to make sure ship isn't outside
     * of the game board's playable area.
     * @method rotateShip
     */
    rotateShip() {
        console.log("Rotate Ship!");
    }

    /**
      * Generate random coordinates to place ships randomly.
      * @method randomShip
      */
    randomShip() {
        console.log("Random Ship!");
    }

    /**
      * Reset ship placement to clear ships from the game board
      * and allow the player to start placing ships again.
      * @method resetShip
      */
    resetShip() {
        console.log("Reset Ship!");
    }

    /**
     * Check's a ships coordinates to make sure it isn't outside
     * of the game board's playable area.
     * @method checkPlacement
     * @return {boolean} - returns true if within bounds and false if not
     */
    checkPlacement() {

    }

    /**
     * Check's if a player's guess results in a ship being hit and provide
     * feedback to player if hit
     * @method hitShip
     */
    hitShip() {

    }

    /**
     * Check's if a player's guess results in a ship being missed and provide
     * feedback to player if hit
     * @method missShip
     */
    missShip() {

    }
}

/**
* Defines the game board object which is the grid area the player
* plays within. 
* @class Gameboard
* @param {string} owner - the player that owns the gameboard
* @param {string} label - the name label that should be displayed above the game board
*/
class Gameboard {
    constructor(owner, label) {
        this.owner = owner;
        this.label = label;
    }

    /**
    * Procedurally generates the grid that represents the player's or 
    * computer's game board, based on the object's owner parameter.
    * @method createGameBoard
    */
    createGameBoard() {
        let playerGameboard = document.getElementById('player-gameboard');
        let computerGameboard = document.getElementById('computer-gameboard');
        let gridLetters = [' ', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        let playGrid = `<div id="gameboard-label">${this.label}</div>`;
        for (let i = 0; i <= 10; i++) {
            if (i == 0) {
                for (let j = 0; j <= 10; j++) {
                    playGrid += `<div id='iR${j}' class="index-row">${j == 0 ? ' ' : j}</div>`;
                }
            } else {
                for (let j = 0; j <= 10; j++) {
                    if (j == 0) {
                        playGrid += `<div id='iC ${gridLetters[j + i].trim()}' class="index-column">${gridLetters[j + i].trim()}</div>`;
                    } else {
                        playGrid += `<div id='p${j + (i - 1) * 10}' class="playable-area ship-placement">${j + (i - 1) * 10}</div>`;
                    }
                }
            }
        }
        this.owner === 'computer' ? computerGameboard.innerHTML = playGrid : playerGameboard.innerHTML = playGrid;
    }
}

/**
* Defines the Player attributes
*
*/
class Player {
    constructor(playerName, shipsPlaced, shipsRemaining, hits, misses, score, highScore) {
        this.name = playerName;
        this.shipsPlaced = shipsPlaced;
        this.shipsRemaining = shipsRemaining;
        this.hits = hits;
        this.misses = misses;
        this.score = score;
        this.highScore = highScore;
    }

    /**
     * This method 
     *
     * @method 
     */
    shipsPlaced() {

    }

    /**
     * This method 
     *
     * @method 
     */
    shipsRemaining() {

    }

    /**
     * Update the sidebar with player's name
     * @method 
     */
    updateName(playerName) {
        document.getElementById('p1-score-title').innerText = playerName;
        document.getElementById('p1-stats-heading').innerText = playerName;
    }

    /**
     * This method 
     *
     * @method 
     */
    updateHits() {

    }

    /**
     * This method 
     *
     * @method 
     */
    updateMisses() {

    }

    /**
     * This method 
     *
     * @method 
     */
    updateScore() {

    }

    /**
     * This method 
     *
     * @method 
     */
    updateHighScore() {

    }

    /**
     * This method 
     *
     * @method 
     */
    playerWin() {

    }
}

/**
 * Checks that a name has been entered on the intro screen
 * before passing flow on to runGame(). If no name entered
 * this displays an error message in the form.
 * @param {string} playername - name entered by player 
 */
function checkName(playerName) {
    let errorMsg = document.getElementById('error-message');
    if (playerName) {
        runGame(playerName);
    } else {
        errorMsg.innerHTML = '<p>YOU MUST ENTER YOUR NAME TO START</p>';
    }
}

/**
 * The main game loop called by checkName when a name has been
 * entered on the start-game-form. Calls functions to create
 * players and gameboards and control flow of game.
 */
function runGame(playerName) {
    /**
    * Define game object variables
    */
    const playerTypes = { player: 'PLAYER ONE', computer: 'PLAYER TWO' };
    const players = {};
    const shipTypes = { Carrier: 5, Battleship: 4, Cruiser: 3, Submarine: 3, Destroyer: 2 };
    const playerShips = {};
    const computerShips = {};
    const gameBoards = {};

    /*  
    Loop over playerTypes, create a gameboard object for each, 
    store this in a gameboards object, and then pass these to 
    createGameBoard() method to generate gameboard and add to
    screen.
    */
    for (let keys in playerTypes) {
        let owner = keys;
        // if playerName known use that for player one label
        let label = owner === 'player' && playerName ? playerName : playerTypes[keys];
        gameBoards[keys] = new Gameboard(owner, label);
        gameBoards[keys].createGameBoard();

        /*
        For each playerType, create a Player object
        for each, store this in a players object.
        */
        let shipsPlaced = 0;
        let shipsRemaining = 5;
        let hits = 0;
        let misses = 0;
        let score = 0;
        let highScore = 0;
        if (owner === 'player') {
            players[keys] = new Player(playerName, shipsPlaced, shipsRemaining, hits, misses, score, highScore);
            // Replace player one's name in sidebar with name provided
            players[keys].updateName(playerName.toUpperCase());
        } else {
            playerName = playerTypes[keys];
            players[keys] = new Player(playerName, shipsPlaced, shipsRemaining, hits, misses, score, highScore);
        }

        /*
        For each playerType loop over shipTypes, create a 
        ship object for each, store these in a playerShips and 
        computerShips object.
        */
        for (let shipName in shipTypes) {
            let size = shipTypes[shipName];
            let coordinates = '';
            let direction = 'vertical';
            let hits = 0;
            if (owner === 'player') {
                playerShips[shipName] = new Ship(shipName, size, coordinates, direction, hits);
            } else {
                computerShips[shipName] = new Ship(shipName, size, coordinates, direction, hits);
            }
        }


    }

    // hide intro screen modal
    document.getElementById('intro-modal').style.display = "none";
}

/* Wait for the DOM to finish loading, add button event listeners
 and start-game-form submit listener whcih passes to checkName()
 to see if game can start */
document.addEventListener('DOMContentLoaded', function () {
    let gameButtons = document.getElementsByClassName('game-button');
    let playerName = '';

    let startForm = document.getElementById('start-game-form');
    startForm.addEventListener('submit', function (event) {
        //Prevent page refresh
        event.preventDefault();
        playerName = document.getElementById('player-name').value;
        checkName(playerName);
    });

    // add event listeners to buttons -might need to move this inside game loop
    for (let button of gameButtons) {
        button.addEventListener("click", function () {
            switch (this.id) {
                case 'place-control':
                    playerCarrierShip.placeShip(); // need to check which ship we are placing
                    break;
                case 'rotate-control':
                    playerCarrierShip.rotateShip(); // need to check which ship we are placing
                    break;
                case 'random-control':
                    playerCarrierShip.randomShip(); // need to check which ship we are placing
                    break;
                case 'reset-control':
                    playerCarrierShip.resetShip(); // need to check which ship we are placing
                    break;
            }
        });
    }
    // create game board grids for both players and add them to the existing divs
    // playerGameboard.createGameBoard();
    // computerGameboard.createGameBoard();

    // test placing a ship and explosion effect
    let testDiv = document.getElementById('p52');
    let gridLocation = testDiv.className;
    testDiv.innerHTML += "<img src='./assets/images/ships/battleship.png' class='ship'>";
    testDiv.innerHTML += `<img src='./assets/images/effects/explosion.gif' id='explode-${gridLocation}' class='explosion'>`;
    setTimeout(function () {
        document.querySelector('[id^="explode-"]').remove();
        testDiv.innerHTML += "<img src='./assets/images/effects/fire.gif' class='fire'>";
    }, 3700);

});