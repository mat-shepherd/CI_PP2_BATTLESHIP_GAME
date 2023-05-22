/**
* Defines the various ship game piece objects which represent the
* ships the players place on the game board.
* @class Ship
* @param {string}
* @return {string}
*/

class Ship {
    constructor(shipName, size, coordinates, direction, hits) {
        this.shipName = shipName;
        this.size = size;
        this.coordinates = coordinates;
        this.direction = direction;
        this.hits = hits;
    }

    /**
     * Records the coordinates of player ships during the ship placement 
     * stage of the game. Passes to checkPlacement to check coordinates
     * are valid for ship size and orientation. If not show an error message
     * and pass back to runGame loop. 
     * @method placeShip
     */
    placeShip(cellId, shipObject) {
        // Get game board cell object and add first coordinate of Ship object.
        let cell = document.getElementById(cellId);

        /* 
        Increase the row letter and column number based on the size of the ship.
        Code adapted from answer provided by ChatGPT by https://openai.com/
        */

        let rowLetter = cellId[0];
        let columnNumber = parseInt(cellId.slice(1));

        // push first coordinate to array
        shipObject.coordinates.push(cellId);

        for (let cellCount = 0; cellCount < shipObject.size - 1; cellCount++) {

            rowLetter = String.fromCharCode(rowLetter.charCodeAt(0) + 1);
            columnNumber += 10;

            // Generate the new cell ID
            let newCellId = rowLetter + columnNumber;

            // Add the new cell ID to the Ship object's coordinates array
            shipObject.coordinates.push(newCellId);
        }

        /* 
        If Ship object has already been placed remove it from the game board
        and remove previous coordiantes from Ship object.
        */
        if (shipObject.coordinates.length > shipObject.size) {
            let existCoord = document.getElementById(shipObject.coordinates[0]);
            existCoord.innerHTML = '';
            shipObject.coordinates.splice(0, shipObject.size);
        }

        /* 
        Remove existing coordinates from the start of the array if it 
        exceeds the ship size
        */
        if (shipObject.coordinates.length > shipObject.size) {
            for (let cellCount = 0; cellCount < shipObject.size; cellCount++) {
                shipObject.coordinates.shift();
            }
        }

        console.log(shipObject.coordinates);
        console.log(shipObject.shipName);


        /*
        Check which Ship type has been passed to method and add relevant ship
        to the gameboard.
        */
        switch (shipObject.shipName) {
            case 'Carrier':
                cell.innerHTML += "<img src='./assets/images/ships/carrier.png' class='ship'>";
                break;
            case 'Battleship':
                cell.innerHTML += "<img src='./assets/images/ships/battleship.png' class='ship'>";
                break;
            case 'Cruiser':
                cell.innerHTML += "<img src='./assets/images/ships/cruiser.png' class='ship'>";
                break;
            case 'Submarine':
                cell.innerHTML += "<img src='./assets/images/ships/submarine.png' class='ship'>";
                break;
            case 'Destroyer':
                cell.innerHTML += "<img src='./assets/images/ships/destroyer.png' class='ship'>";
                break;
        }

        /*
        Add pulse effect to game-buttons - likely need to move this
        */
        let gameButtons = document.getElementsByClassName('game-button');
        for (let button of gameButtons) {
            button.classList.add("pulse");
        }
    }

    /**
     * Locks in ship placement when player clicks place button and passes
     * back to runGame loop for next ship to be placed.
     * @method confirmPlaceShip
     */
    confirmPlaceShip(shipName, turnName) {
        // once confirmed change event listener on cells to next ship
        // update plyaer message
        // i.e. playerShips.Carrier.placeShip(cell.id);
        playerMessage(turnName + " your turn to place your " + shipName);
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
            // first iteration creates first cell in index row
            if (i == 0) {
                for (let j = 0; j <= 10; j++) {
                    playGrid += `<div id='iR${j}' class="index-row">${j == 0 ? ' ' : j}</div>`;
                }
            } else {
                for (let j = 0; j <= 10; j++) {
                    // first iteration creates first cell in index column
                    if (j == 0) {
                        playGrid += `<div id='iC ${gridLetters[j + i].trim()}' class="index-column">${gridLetters[j + i].trim()}</div>`;
                    } else {
                        // create alphanumeric grid references to use in cell IDs
                        let cellId = `${gridLetters[i]}${j + (i - 1) * 10}`;
                        // change initial class on cells based on Player owner to control hover icons
                        let cellClass = this.owner === 'computer' ? 'computer-play-area no-placement' : 'player-play-area ship-placement';
                        playGrid += `<div id='${cellId}' class="${cellClass}">${cellId}</div>`;
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
     * @method shipsPlaced
     */
    shipsPlaced() {

    }

    /**
     * This method 
     *
     * @method shipsRemaining
     */
    shipsRemaining() {

    }

    /**
     * Update the sidebar with player's name
     * @method updateName
     * @param {string} playername - name entered by player 
     */
    updateName(playerName) {
        document.getElementById('p1-score-title').innerText = playerName;
        document.getElementById('p1-stats-heading').innerText = playerName;
    }

    /**
     * This method 
     *
     * @method updateHits
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
 * before passing flow on to initGame(). If no name entered
 * this displays an error message in the form.
 * @param {string} playername - name entered by player 
 */
function checkName(playerName) {
    let errorMsg = document.getElementById('error-message');
    if (playerName) {
        initGame(playerName);
    } else {
        errorMsg.innerHTML = '<p>YOU MUST ENTER YOUR NAME TO START</p>';
    }
}

/**
 * Update the player-message area with text to provide the player
 * with directions during gameplay.
 * @param {string} message - text to be displayed in player-message area
 */
function playerMessage(message) {
    document.getElementById('player-message').innerText = message.toUpperCase();
}

/**
 * The game initialisation loop called by checkName when a name has been
 * entered on the start-game-form. Calls functions to create
 * players and gameboards, add placement button and gameboard grid
 * event listeners then passes to runGame().
 * @param {string} playerName - players name entered in start-game-form.
 */
function initGame(playerName) {
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
            let coordinates = [];
            let direction = 'vertical';
            let hits = 0;
            if (owner === 'player') {
                playerShips[shipName] = new Ship(shipName, size, coordinates, direction, hits);
            } else {
                computerShips[shipName] = new Ship(shipName, size, coordinates, direction, hits);
            }
        }
    }

    /* 
    Add event listeners to placement buttons. Ascsociated with first Ship object initially.
    Each method will update the listener to the next Ship object.
    */
    let gameButtons = document.getElementsByClassName('game-button');
    for (let button of gameButtons) {
        button.addEventListener("click", function () {
            switch (this.id) {
                case 'place-control':
                    playerShips.Carrier.confirmPlaceShip("Carrier", players.player.name);
                    break;
                case 'rotate-control':
                    playerShips.Carrier.rotateShip();
                    break;
                case 'random-control':
                    playerShips.Carrier.randomShip();
                    break;
                case 'reset-control':
                    playerShips.Carrier.resetShip();
                    break;
            }
        });
    }

    /*
    Add event listeners to each cell in the player game board to record
    ship coordinates on click. Event listeners will be updated by
    confirmPlaceShip method.
    */
    let playerCells = document.getElementsByClassName('player-play-area');
    for (let cell of playerCells) {
        cell.addEventListener("click", function (event) {
            playerShips.Carrier.placeShip(event.target.id, playerShips.Carrier);
        });
    }

    // show intial welcome and instructions in player message
    playerMessage("Welcome Commander! Hover over your grid below and click to place your first ship.\
    Click the Rotate button to change the direction of your ship and then click the place button to \
    confirm your ship's placement. Click the Random button if you want your ships placed randomly for \
    you.");

    // hide intro screen modal to show game boards
    document.getElementById('intro-modal').style.display = "none";


}

// need to look at paramters to pass from initgame to rungame
function runGame(playerName, players) {
    // add a while loop here to wait until all ships placed?
    // For each ship in playerShips instruct the player to place the ship
    for (let shipName in playerShips) {
        let turnName = players.player.name;
        playerShips[shipName].placeShip(shipName, turnName);
    }
}

/* Wait for the DOM to finish loading, set focus on player-name input
 add button event listeners, and start-game-form submit listener 
 which passes to checkName() to see if game can start */
document.getElementById('player-name').focus();
document.addEventListener('DOMContentLoaded', function () {
    let playerName = '';

    let startForm = document.getElementById('start-game-form');
    startForm.addEventListener('submit', function (event) {
        //Prevent page refresh
        event.preventDefault();
        playerName = document.getElementById('player-name').value;
        checkName(playerName);
    });

    // add event listeners to player gameboard to detect clicks during ship placement

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