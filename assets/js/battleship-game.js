/**
* Defines the various ship game piece objects which represent the
* ships the players place on the game board.
* @class Ship
* @param {string}
* @return {string}
*/

class Ship {
    constructor(name, size, coordinates, orientation, hits) {
        this.name = name;
        this.size = size;
        this.coordinates = coordinates;
        this.orientation = orientation;
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
    constructor(name, shipsPlaced, shipsRemaining, hits, misses, score, highScore) {
        this.name = name;
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
* Define game object variables
*/
const playerCarrierShip = new Ship('Carrier', 5, '', '', 'vertical', 0);
const playerBattleShip = new Ship('Battleship', 4, '', 'vertical', 0);
const playerCruiserShip = new Ship('Cruiser', 3, '', 'vertical', 0);
const playerSubmarineShip = new Ship('Submarine', 3, '', 'vertical', 0);
const playerDestroyerShip = new Ship('Destroyer', 2, '', 'vertical', 0);

const computerCarrierShip = new Ship('Carrier', 5, '', 'vertical', 0);
const computerBattleShip = new Ship('Battleship', 4, '', 'vertical', 0);
const computerCruiserShip = new Ship('Cruiser', 3, '', 'vertical', 0);
const computerSubmarineShip = new Ship('Submarine', 3, '', 'vertical', 0);
const computerDestroyerShip = new Ship('Destroyer', 2, '', 'vertical', 0);

const playerGameboard = new Gameboard('player', 'PLAYER ONE');
const computerGameboard = new Gameboard('computer', 'PLAYER TWO');

function checkName(playerName) {
    let errorMsg = document.getElementById('error-message');
    if (playerName) {
        runGame();
    } else {
        errorMsg.innerHTML = '<p>YOU MUST ENTER YOUR NAME TO START</p>';
    }
}

function runGame() {
    document.getElementById('intro-modal').style.display = "none";
}

document.addEventListener('DOMContentLoaded', function () {
    let gameButtons = document.getElementsByClassName('game-button');
    let playerName = '';

    let startForm = document.getElementById('start-game-form');
    startForm.addEventListener('submit', function (event) {
        //Prevent page refresh
        event.preventDefault();
        playerName = document.getElementById('player-name').value;
        console.log(playerName);
        checkName(playerName);
    });

    // add event listeners to buttons
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
    playerGameboard.createGameBoard();
    computerGameboard.createGameBoard();

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