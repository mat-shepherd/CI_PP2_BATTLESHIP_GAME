// CLASSES

/** 
 * Defines the various ship game piece objects which represent the
 * ships the players place on the game board.
 * @class Ship
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
     * and pass back to runGame loop. Otherwise place ship image and return.
     * @method placeShip
     * @param {string} cellId - id of clicked cell
     * @param {object} shipOject - the ship Object being placed
     * @param {object} player - the player object from  players{}
     */
    placeShip(cellId, player, playerShips) {
        // Get game board cell object and add first coordinate of Ship object.
        let cell = document.getElementById(cellId);

        /* 
         * Increase the row letter and column number based on the size of the ship.
         * Code adapted from answer provided by ChatGPT by https://openai.com/
        */

        let rowLetter = cellId[0];
        let columnNumber = parseInt(cellId.slice(1));

        // Push first coordinate to array
        this.coordinates.push(cellId);

        // Add ships other coordinates to array based on ship size
        for (let cellCount = 0; cellCount < this.size - 1; cellCount++) {

            rowLetter = String.fromCharCode(rowLetter.charCodeAt(0) + 1);
            columnNumber += 10;

            // Generate the new cell ID
            let newCellId = rowLetter + columnNumber;

            // Add the new cell ID to the Ship object's coordinates array
            this.coordinates.push(newCellId);
        }

        // Check the coordinates are valid
        let coordsDuplicated = this.checkPlacement(this, player, playerShips);

        /*
         * Check which Ship type has been passed to method and add relevant ship
         * to the gameboard.
         */
        switch (this.shipName) {
            case 'Carrier':
                cell.innerHTML += "<img src='./assets/images/ships/carrier.png' class='ship carrier'>";
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
                cell.innerHTML += "<img src='./assets/images/ships/destroyer.png' class='ship destroyer'>";
                break;
        }

        /* 
         * If Ship object has already been placed call removeShip
         */
        if (this.coordinates.length > this.size || coordsDuplicated === 'True') {
            this.removeShip(player, coordsDuplicated);
        }

        /*
         * Add pulse effect to game-buttons - likely need to move this
         */
        let gameButtons = document.getElementsByClassName('game-button');
        for (let button of gameButtons) {
            button.classList.add("pulse");
        }
    }

    /**
     * Removes the ship image that has been placed and its coordinates. 
     * Optionally sends a message to playerMessage and highlights a cel
     *  with an error warning if placement not valid.
     * @method placeShip
     * @param {string} cellId - id of clicked cell
     * @param {object} shipOject - the ship Object being placed
     * @param {object} player - the player object from  players{}
     */
    removeShip(player, coordsDuplicated) {
        // Get the element at the placed ship coordinates 
        let existCoord = document.getElementById(this.coordinates[0]);

        /*
         * If Ship object has already been placed or placement isn't valid remove it
         * from the game board and remove coordinates from the ship coordinates array
         */
        let imageElement = existCoord.querySelector('img');
        existCoord.removeChild(imageElement);
        this.coordinates.splice(0, this.size);

        /*
         * Tell player to place or rotate ship. If coordinates aren't valid 
         * tell the player to place the ship again.
         */
        if (coordsDuplicated === 'True') {
            // add a red background to cell and then remove after 2 seconds
            existCoord.classList.add('red-background');
            setTimeout(function () {
                existCoord.classList.remove('red-background');
            }, 4000);

            playerMessage(`<span class='red-text'>${player.name} ships can't overlap or extend past 
            the edge of the grid. Please place your ${this.shipName} again!</span>`, 'error');
        } else {
            playerMessage(`${player.name} click <span class="red-text">'ROTATE'</span>
            to change the direction of your ship or 'PLACE' when you are ready 
            to place your next ship.`);
        }
    }

    /**
     * Take a ship object's coordinates and transforms them to rotate the ship 90
     * degrees clockwise. Calls checkPlacement to make sure ship isn't outside
     * of the game board's playable area.
     * Code adapted from answer from ChatGPT by https://openai.com
     * @method rotateShip
     */
    rotateShip() {
        console.log("Rotate Ship!");
        let shipCoord = document.getElementById(this.coordinates[0]);
        let shipImg = shipCoord.querySelector('img');

        // Get the dimensions of the ship image
        let shipWidth = shipImg.clientWidth;
        let shipHeight = shipImg.clientHeight;

        // Calculate the transform origin as the top center of the image
        let transformOriginX = shipWidth / 2;
        let transformOriginY = 0;

        // Apply the transform origin to the ship image
        shipImg.style.transformOrigin = `${transformOriginX}px ${transformOriginY}px`;

        // Get the current rotation angle
        let currentRotation = parseInt(shipImg.style.transform.replace('rotate(', '').replace('deg)', ''), 10) || 0;

        // Calculate the new rotation angle by adding 90 degrees
        let newRotation = (currentRotation + 90) % 360;

        // Apply the new rotation to the ship image
        shipImg.style.transform = `rotate(${newRotation}deg)`;

        //Adjust image position in cell based on newRotation
        console.log(newRotation);
        switch (this.shipName) {
            case 'Carrier':
                switch (newRotation) {
                    case 0:
                        shipImg.style.top = '45%';
                        break;
                    default:
                        shipImg.style.top = '45%';
                }
                break;
            case 'Battleship':
                switch (newRotation) {
                    case 90:
                        shipImg.style.top = '45%';
                        shipImg.style.left = '65%';
                        break;
                    case 180:
                        shipImg.style.top = '100%';
                        shipImg.style.left = '20%';
                        break;
                    case 270:
                        shipImg.style.top = '45%';
                        shipImg.style.left = '-35%';
                        break;
                    default:
                        shipImg.style.top = '0%';
                        shipImg.style.left = '25%';
                }
                break;
            case 'Cruiser':
                switch (newRotation) {
                    case 90:
                        shipImg.style.top = '45%';
                        shipImg.style.left = '70%';
                        break;
                    case 180:
                        shipImg.style.top = '100%';
                        shipImg.style.left = '25%';
                        break;
                    case 270:
                        shipImg.style.top = '45%';
                        shipImg.style.left = '-20%';
                        break;
                    default:
                        shipImg.style.top = '0%';
                        shipImg.style.left = '20%';
                }
                break;
            case 'Submarine':
                switch (newRotation) {
                    case 90:
                        shipImg.style.top = '45%';
                        shipImg.style.left = '40%';
                        break;
                    case 180:
                        shipImg.style.top = '45%';
                        shipImg.style.left = '20%';
                        break;
                    case 270:
                        shipImg.style.top = '45%';
                        break;
                    default:
                        shipImg.style.top = '25%';
                }
                break;
            case 'Destroyer':
                switch (newRotation) {
                    case 90:
                        shipImg.style.top = '45%';
                        shipImg.style.left = '40%';
                        break;
                    case 180:
                        shipImg.style.top = '45%';
                        shipImg.style.left = '20%';
                        break;
                    case 270:
                        shipImg.style.top = '45%';
                        break;
                    default:
                        shipImg.style.top = '25%';
                }
                break;
        }
    }

    /**
     * Check's a ships coordinates to make sure it isn't outside
     * of the game board's playable area and they are not overlapping
     * another ship.
     * @method checkPlacement
     * @param {object} checkShip - contains ship object being checked
     * @param {object} player - contains player data
     * @param {object} playerShip - contains player ship data
     * @return {boolean} - returns true if within bounds and false if not
     */
    checkPlacement(checkShip, player, playerShips) {
        /*
        Loop through playerShips and get ship coordinates that
        aren't the ship being checked. Check the current ship's
        coordinates against all other coordinates.
        */
        let coordsFound = '';

        for (let ships in playerShips) {
            if (ships !== checkShip.shipName) {
                for (let coords of playerShips[ships].coordinates) {
                    console.log('Coords ' + coords);

                    if (checkShip.coordinates.includes(coords)) {
                        coordsFound = 'True';
                        console.log('Coords found = ' + coordsFound);
                        break; // stop checking if any coordinate found
                    } else {
                        coordsFound = 'False';
                        console.log('Coords found = ' + coordsFound);
                    }
                }
            }
        }

        return coordsFound;
    }

    /**
     * Locks in ship placement when player clicks place button, update
     * cell and palcmenet button event listeners 
     * @method confirmPlaceShip
     * @param {object} currentPlayer - the current player
     * @param {object} playerShips - the playerShips object
     */
    confirmPlaceShip(currentPlayer, playerShips) {
        // Once ship is placed remove click event listeners from occupied cells
        let placedShipCells = this.coordinates;
        for (let i in placedShipCells) {
            /* 
            Clone the cell to remove any previous event listeners.
            Code adapted from answer by ChatGPT by https://openai.com
            */
            let cell = document.getElementById(placedShipCells[i]);
            cell.replaceWith(cell.cloneNode(true));
        }

        /* Increase z-index of ship to bring to to top */
        let shipCoord = document.getElementById(this.coordinates[0]);
        shipCoord.classList.add('placed');

        /* 
         * Code to get next ship in playerShips adapted from 
         * answer by ChatGPT by https://openai.com
         */

        // Get the keys of the playerShips object
        let shipNames = Object.keys(playerShips);

        // Find the index of the current ship
        let currentIndex = shipNames.indexOf(this.shipName);

        // Get the next ship name from the array
        let nextShipName = shipNames[currentIndex + 1];

        // Get the next ship object using the ship name
        let nextShip = playerShips[nextShipName];

        playerMessage(currentPlayer.name + " your turn to place your " + nextShip.shipName);

        updateCellListener(nextShip, currentPlayer, playerShips);
        updatePlacementListener(nextShip, currentPlayer, playerShips);
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
                    playGrid += `<div id="iR${j}" class="index-row">${j == 0 ? ' ' : j}</div>`;
                }
            } else {
                for (let j = 0; j <= 10; j++) {
                    // first iteration creates first cell in index column
                    if (j == 0) {
                        playGrid += `<div id="iC ${gridLetters[j + i].trim()}" class="index-column">${gridLetters[j + i].trim()}</div>`;
                    } else {
                        // create alphanumeric grid references to use in cell IDs
                        let cellId = `${gridLetters[i]}${j + (i - 1) * 10}`;
                        // change initial class on cells based on Player owner to control hover icons
                        let cellClass = this.owner === 'computer' ? 'computer-play-area no-placement' : 'player-play-area ship-placement';
                        playGrid += `<div id="${cellId}" class="${cellClass}">${cellId}</div>`;
                    }
                }
            }
        }
        this.owner === 'computer' ? computerGameboard.innerHTML = playGrid : playerGameboard.innerHTML = playGrid;
    }
}

/**
 * Defines the Player attributes
 * @class Player
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


// HELPER FUNCTIONS

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
 * Update cell click event listeners by removing existing and then
 * adding new click event listeners to call methods of the current
 * ship object. 
 * @param {object} currentShip - the ship currently being place
 * @param {object} currentPlayer - the player placing ships
 */
function updateCellListener(currentShip, currentPlayer, playerShips) {
    let playerCells = document.getElementsByClassName('player-play-area');
    for (let cell of playerCells) {
        /* 
        Clone the cell to remove any previous event listeners.
        Code adapted from answer by ChatGPT by https://openai.com
        */
        const clonedCell = cell.cloneNode(true);
        cell.replaceWith(clonedCell);

        function cellClick(event) {
            // Handle the cell click event
            currentShip.placeShip(event.target.id, currentPlayer, playerShips);
        }

        clonedCell.addEventListener("click", cellClick);
    }
}


/**
 * Generate random coordinates to place ships randomly.
 * @param {object} shipObject - the playerShip or computerShip object
 */
function randomShip(shipObject) {
    // pass to resetShip in case ship already placed
    // for each ship in shipObject generate a random alphanumeric coord
    // pass coordinate to checkShipPlacement
    // if coords found generate again
    // if not found add to ship.coordinates
    // pass ship object to placeship
    // pass to runGame
    console.log("Random Ship!");
}

/**
 * Reset ship placement to clear ships from the game board
 * and allow the player to start placing ships again.
 */
function resetShip(shipObject) {
    // for each 
    console.log("Reset Ship!");
}

/**
 * Update placement buttons with click event listeners to call methods of 
 * current ship object. 
 * @param {object} currentShip - the ship currently being placed
 * @param {object} currentPlayer - the player placing ships 
 */
function updatePlacementListener(currentShip, currentPlayer, playerShips) {
    let gameButtons = document.getElementsByClassName('game-button');
    for (let button of gameButtons) {
        /* 
        Clone the button to remove any previous event listeners.
        Code adapted from answer by ChatGPT by https://openai.com
        */
        const clonedButton = button.cloneNode(true);
        button.replaceWith(clonedButton);

        clonedButton.addEventListener("click", function () {
            switch (this.id) {
                case 'place-control':
                    currentShip.confirmPlaceShip(currentPlayer, playerShips);
                    break;
                case 'rotate-control':
                    currentShip.rotateShip(currentPlayer, playerShips);
                    break;
                case 'random-control':
                    currentShip.randomShip();
                    break;
                case 'reset-control':
                    currentShip.resetShip();
                    break;
            }
        });
    }
}

/**
 * Update the player-message area with text to provide the player
 * with directions during gameplay.
 * @param {string} message - text to be displayed in player-message area
 */
function playerMessage(message, effect) {
    let playMsg = document.getElementById('player-message');
    playMsg.innerHTML = message;

    if (effect === 'error') {
        /*
        Animation to make playerMessage text flash. Code from ChatGPT
        by https://openai.com
        */
        playMsg.firstChild.classList.add('flash');

        setTimeout(() => {
            playMsg.firstChild.classList.remove('flash');
        }, 2000);
    }
}

// GAME INITIALISATION AND MAIN LOOP FUNCTIONS

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

    // Set currentShip and prevShip to players first ship, the Carrier 
    let currentShip = playerShips.Carrier;
    let currentPlayer = players.player;

    /*
    Add event listeners to each cell in the player game board to record
    ship coordinates on click. Event listeners will be updated by
    confirmPlaceShip method.
    */
    updateCellListener(currentShip, currentPlayer, playerShips);

    /* 
    Add event listeners to placement buttons. Ascsociated with first Ship object initially.
    Each method will update the listener to the next Ship object.
    */
    updatePlacementListener(currentShip, currentPlayer, playerShips);

    // show intial welcome and instructions in player message
    playerMessage(`Welcome ${players.player.name}! Click your grid below to place your first ship.
    Click the 'ROTATE' button to change ship direction and click the 
    <span class='red-text'>'PLACE'</span> button to confirm ship placement. 
    Click 'RANDOM' to place ships randomly.`);

    // hide intro screen modal to show game boards
    document.getElementById('intro-modal').style.display = "none";
}

// RUNGAME - need to look at paramters to pass from initgame to rungame

function runGame(playerName, players) {
    // add a while loop here to wait until all ships placed?
    // For each ship in playerShips instruct the player to place the ship
    for (let shipName in playerShips) {
        let turnName = players.player.name;
        playerShips[shipName].placeShip(shipName, turnName, playerShips);
    }
}

// DOCUMENT LOAD EVENT LISTENER

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

    /* test placing a ship and explosion effect
    let testDiv = document.getElementById('p52');
    let gridLocation = testDiv.className;
    testDiv.innerHTML += "<img src='./assets/images/ships/battleship.png' class='ship'>";
    testDiv.innerHTML += `<img src='./assets/images/effects/explosion.gif' id='explode-${gridLocation}' class='explosion'>`;
    setTimeout(function () {
        document.querySelector('[id^="explode-"]').remove();
        testDiv.innerHTML += "<img src='./assets/images/effects/fire.gif' class='fire'>";
    }, 3700);
    */
});