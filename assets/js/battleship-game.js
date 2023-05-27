// GLOBAL VARIABLE

/* 
* Tried to avoid global variables but this one was hard
* to avoid. Added namespace to avoid conflicts.
* In future iteration try adding updatePlayerGridListeners as 
* a method of Gameboard class and add eventHandlers as attribute. 
*/

const BattleshipGameEvents = {
    placeEventHandlers: {
        // For ship placement click event handlers
    },
    shootEventHandlers: {
        // For game shot click event handlers
    }
};

// CLASSES

/** 
 * Defines the various ship game piece objects which represent the
 * ships the players place on the game board.
 * @class Ship
 * @param {string} shipName - name of ship type
 * @param {string} size - number of cells a ship occupies
 * @param {object} coordinates - cell coordinates of ships location
 * @param {string} direction - direction of ships rotation
 * @param {boolean} placed - true if ship placement confirmed
 * @param {object} hits - coordinates where ship is hit
 * @param {boolean} sunk - true if ship is sunk false if not
*/
class Ship {
    constructor(shipName, size, coordinates, direction, placed, hits, sunk) {
        this.shipName = shipName;
        this.size = size;
        this.coordinates = coordinates;
        this.direction = direction;
        this.placed = placed;
        this.hits = hits;
        this.sunk = sunk;
    }

    /**
     * Records the coordinates of player ships during the ship placement 
     * stage of the game. Passes to checkPlacement to check coordinates
     * are valid for ship size and orientation. If not show an error message
     * and pass back to runGame loop. Otherwise, if the player is not computer 
     * place ship image. Then return.
     * @method placeShip
     * @param {object} targetCell - clicked target event object
     * @param {object} currentPlayer - the current player object
     * @param {object} playerShips - the playerShips object
     * @param {object} randomShipCoord - optional coord passed by randomShip
     */
    placeShip(targetCell, currentPlayer, playerShips, randomShipCoord) {
        /* 
         * Get game board clicked cell object and add first 
         * coordinate of Ship object. If the image is clicked
         * instead of the div get the ID of the image's parent
         * DIV.
         */
        let cellId = '';
        if (targetCell.tagName === 'IMG') {
            cellId = targetCell.parentElement.id;
        } else if (randomShipCoord) {
            cellId = randomShipCoord;
        } else {
            cellId = targetCell.id;
        }
        let cell = document.getElementById(cellId);

        // If the cell still contains error remove it
        if (cell.classList.contains('red-background')) {
            cell.classList.remove('red-background');
        }

        // Don't add and generate coords if passed from randomShip
        if (!randomShipCoord) {
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

                // Generate the new cell ID
                let newCellId = rowLetter + columnNumber;

                // Add the new cell ID to the Ship object's coordinates array
                this.coordinates.push(newCellId);
            }
        }

        // Remove ship image and coordinates if ship already placed
        if (this.coordinates.length > this.size) {
            this.removeShip(currentPlayer);
        }

        /*
         * Check which Ship type has been passed to method and add relevant ship
         * to the game board.
         */
        if (currentPlayer.name !== 'PLAYER TWO') {
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
        }

        /*
         * Add pulse effect to game-buttons - likely need to move this
         */
        addButtonPulse();
    }

    /**
     * Removes the ship image that has been placed and its coordinates. 
     * Optionally sends a message to playerMessage and highlights a cel
     *  with an error warning if placement not valid.
     * @method removeShip
     * @param {object} currentPlayer - the current player object
     * @param {string} conflictingCoord - coordinate of conflicting ship
     */
    removeShip(currentPlayer, conflictingCoord) {
        // Get the element at the placed ship coordinates or at conflicting coordinates         
        let existCoord = document.getElementById(this.coordinates[0]);

        console.log('Conflict ' + conflictingCoord);
        /*
         * If Ship object has already been placed or placement isn't valid remove it
         * from the game board and remove coordinates from the ship coordinates array
         */
        console.log('All ship coords ' + this.coordinates);
        console.log('Placed ship first coord ' + existCoord.id);
        this.coordinates.splice(0, this.size);
        console.log('new placed ship coords...' + this.coordinates);

        //If an image is found in
        let imageElement = existCoord.querySelector('img');
        if (imageElement !== null) {
            existCoord.removeChild(imageElement);
        }

        /*
         * Tell player to place or rotate ship. If coordinates aren't valid 
         * tell the player to place the ship again.
         */
        if (conflictingCoord) {
            // add a red background to cell and then remove after 2 seconds
            existCoord.classList.add('red-background');
            setTimeout(function () {
                existCoord.classList.remove('red-background');
            }, 4000);

            playerMessage(`<span class='red-text'>${currentPlayer.name} ships can't overlap or extend past 
            the edge of the grid. Please place your ${this.shipName} again!</span>`, 'error');
        } else {
            playerMessage(`${currentPlayer.name} click <span class="red-text">'ROTATE'</span>
            to change the direction of your ship or 'PLACE' when you are ready 
            to place your next ship.`);
        }
    }

    /**
     * Take a ship object's coordinates and transforms them to rotate the ship 90
     * degrees clockwise. Calls checkPlacement to make sure ship isn't outside
     * of the game board's playable area.
     * This was really tough problem to solve so I absolutely had to turn to ChatGPT
     * for help here. After much trial and error the following code was 
     * pieced together and adapted from code provided by chatGPT by https://openai.com
     * @method rotateShip
     * @param {object} currentPlayer - current player object
     * @param {object} playerShips - object containing player ship objects
     * @param {string} randomShipCoord - coordinate generated for random ship
     */
    rotateShip(currentPlayer, playerShips, randomShipCoord) {
        let shipCoord = document.getElementById(this.coordinates[0]);

        // Check ship has been placed if not show error
        if (shipCoord !== null) {
            let shipImg = shipCoord.querySelector('img');
            // Check if coordinates passed from randomShip
            if (!randomShipCoord) {
                let originalRotation = shipImg.style.transform;

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

                // Change ship direction attribute based on rotation
                if (newRotation === 90 || newRotation === 270) {
                    this.direction = 'horizontal';
                } else {
                    this.direction = 'vertical';
                }

                // Apply the new rotation to the ship image
                shipImg.style.transform = `rotate(${newRotation}deg)`;

                //Adjust image position in cell based on newRotation
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
                                shipImg.style.top = '100%';
                                shipImg.style.left = '20%';
                                break;
                            case 270:
                                shipImg.style.top = '45%';
                                shipImg.style.left = '-35%';
                                break;
                            default:
                                shipImg.style.top = '25%';
                                shipImg.style.left = '20%';
                        }
                        break;
                    case 'Destroyer':
                        switch (newRotation) {
                            case 90:
                                shipImg.style.top = '45%';
                                shipImg.style.left = '75%';
                                break;
                            case 180:
                                shipImg.style.top = '100%';
                                shipImg.style.left = '30%';
                                break;
                            case 270:
                                shipImg.style.top = '45%';
                                shipImg.style.left = '-20%';
                                break;
                            default:
                                shipImg.style.top = '0';
                                shipImg.style.left = '30%';
                        }
                        break;
                }
            }

            let pivot = this.coordinates[0]; // Pivot point for rotation

            // Now rotate the ship's coordinates
            for (let i = 0; i < this.coordinates.length; i++) {
                const coordinate = this.coordinates[i];
                const letter = coordinate[0];
                const number = parseInt(coordinate.slice(1));

                // Calculate the relative position to the pivot point
                const relativeLetter = letter.charCodeAt(0) - pivot.charCodeAt(0);
                const relativeNumber = number - parseInt(pivot.slice(1));

                // Calculate the rotated coordinates (90 degrees counter-clockwise)
                const rotatedLetter = String.fromCharCode(pivot.charCodeAt(0) + relativeNumber);
                const rotatedNumber = parseInt(pivot.slice(1)) - relativeLetter;

                // Update the ship's coordinates
                this.coordinates[i] = rotatedLetter + rotatedNumber.toString();
            }

        } else {
            playerMessage(`NO SHIPS TO ROTATE! YOU NEED TO CLICK ON YOUR GRID TO ADD A SHIP FIRST AND THEN CLICK ROTATE.`, 'error');
            throw `No Ships Placed to Rotate!`;
        }
    }

    /**
     * Check's a ships coordinates to make sure it isn't outside
     * of the game board's playable area and they are not overlapping
     * another ship.
     * @method checkPlacement
     * @param {object} checkShip - contains ship object being checked
     * @param {object} playerShips - contains player ship objects
     * @param {object} computerShips - contains computer ship objects
     * @return {string} coord - returns coordinate if conflicting or null if valid
     */
    checkPlacement(checkShip, playerShips, computerShips) {
        /*
         * Loop through playerShips and get ship coordinates that
         * aren't the ship being checked. Check the current ship's
         * coordinates against all other coordinates.
         */
        for (let shipName in playerShips) {
            if (shipName !== checkShip.shipName) {
                let otherShip = playerShips[shipName];
                for (let coord of otherShip.coordinates) {
                    if (checkShip.coordinates.includes(coord)) {
                        return coord; // Return the conflicting coordinate
                    }
                }
            }
        }

        // Check if ship coordinates are outside the grid's bounds
        for (let coord of checkShip.coordinates) {
            let letter = coord[0];
            let number = parseInt(coord.slice(1));

            if (letter < 'A' || letter > 'J' || number < 1 || number > 10) {
                return coord; // Return the out-of-bounds coordinate
            }
        }

        return null; // Return null if no conflicts or out-of-bounds found
    }

    /**
     * Locks in ship placement when player clicks place button, update
     * cell and placement button event listeners. 
     * Checks if all players ships have been placed and then passes to
     * checkTurn().
     * @method confirmPlaceShip
     * @param {object} players - the object containg player objects
     * @param {object} playerShips - object containing the player's ship objects
     * @param {object} computerShips - object containing the computer's ship objects
     * @param {object} gameBoards - object containing game board objects
     * @param {object} currentPlayer - the current player object in play
     * @param {object} currentShip - the current ship object in play
     */
    confirmPlaceShip(
        players,
        playerShips,
        computerShips,
        gameBoards,
        currentPlayer,
        currentShip
    ) {
        let shipCoord = document.getElementById(this.coordinates[0]);

        /* Call checkPlacement to validate the coordinates
         * if conflicting ship found remove ship. If not proceed
         * with confirming ship placement.
         */
        let conflictingCoord = this.checkPlacement(this, playerShips, computerShips);
        if (conflictingCoord) {
            // Remove ship image and coordinates if placement not valid.
            this.removeShip(currentPlayer, conflictingCoord);
        } else {
            // Check ship has been placed and is in valid position if not show error
            console.log('ConfirmPlaceShip Coord of ' + this.shipName + ' ' + shipCoord);
            if (shipCoord !== null && !conflictingCoord) {
                /* 
                 * Increase z-index of ship to bring to to top 
                 */
                for (let coord of this.coordinates) {
                    let allCoord = document.getElementById(coord);
                    allCoord.classList.add('placed');
                }
                /* Set ship object placed to true */
                this.placed = true;

                // Once ship is placed remove click event listeners from occupied cells
                let placedShipCells = this.coordinates;
                console.log(this.coordinates);
                for (let i in placedShipCells) {
                    let cell = document.getElementById(placedShipCells[i]);

                    // If the cell still contains error remove it
                    if (cell.classList.contains('red-background')) {
                        cell.classList.remove('red-background');
                    }

                    /* 
                     * Clone the cell to remove any previous event listeners.
                     * Code adapted from answer by ChatGPT by https://openai.com
                    */

                    cell.replaceWith(cell.cloneNode(true));
                }

                /* 
                 * Confirm is last ship placed if it is
                 * change/remove placement buttons
                 * pass to checkTurn()
                 */
                let countShipsPlaced = 0;
                for (let ships in playerShips) {
                    if (playerShips[ships].placed === true) {
                        countShipsPlaced++;
                    }
                }
                console.log('Count ships placed...' + countShipsPlaced);
                /* 
                 * If all ships placed hide placement controls and 
                 * pass to checkTurn() to start turn based game play
                 */
                if (countShipsPlaced === 5) {
                    document.getElementById('placement-controls').style.display = 'none';
                    checkTurn(currentPlayer);
                } else {
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

                    // Assign nextShip to currentShip
                    let currentShip = nextShip;

                    playerMessage(currentPlayer.name + " your turn to place your " + currentShip.shipName);

                    updatePlayerGridListener(null, playerShips, computerShips, null, currentPlayer, currentShip);
                    updatePlacementListener(null, playerShips, computerShips, null, currentPlayer, currentShip);
                }
            } else {
                playerMessage(`NO SHIPS TO PLACE! YOU NEED TO CLICK ON YOUR GRID TO ADD A SHIP FIRST AND THEN CLICK PLACE.`, 'error');
                throw `No Ships Placed to Confirm!`;
            }
        }
    }

    /**
     * Provides feedback to player that ship was hit and 
     * updates ship hits attribute.
     * If ship hits coord size is equal to ship size then
     * call sink ship
     * @method hitShip
     */
    hitShip() {
        // if computer player will need to add ship image to cell
        // then add hit effect
        // remove click listener from cell
        // add no-placement class to cell

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
    }

    /**
     * Check's if a player's guess results in a ship being missed and provide
     * feedback to player if hit
     * @method missShip
     */
    missShip() {
        // missShip effect
        // remove clicklistener from cell
        // add no-placement clas to cell

    }

    /**
     * If ship has been hit maximum amount of times sink ship
     * Update ship objects sunk attribute to true
     * @method sinkShip
     */
    sinkShip() {

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
                        let cellId = this.owner === 'computer' ? `${gridLetters[i]}${j}C` : `${gridLetters[i]}${j}`;
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
 * @param {string} playerName - name of player
 * @param {number} shipsRemaining - number of ships remaining for scoreboard
 * @param {number} hits - number of hits for scoreboard
 * @param {number} misses - number of misses for scoreboard
 * @param {number} score - player score for scoreboard
 * @param {number} highScore - player high score for scoreboard
 * @param {boolean} turn - stores true if it is player's turn
 */
class Player {
    constructor(playerName, shipsRemaining, hits, misses, score, highScore, turn) {
        this.name = playerName;
        this.shipsRemaining = shipsRemaining;
        this.hits = hits;
        this.misses = misses;
        this.score = score;
        this.highScore = highScore;
        this.turn = turn;
    }

    /**
     * This method 
     *
     * @method shipsRemaining
     */
    updateShipsRemaining() {

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
     * For computer player only. Generates random coordinate on the board
     * to take a shot.
     * @method 
     */

    takeShot() {

    }
}

// HELPER FUNCTIONS

/**
 * Displays the rules modal. Adapted from
 * code by W3C Schools at 
 * https://www.w3schools.com/howto/howto_css_modals.asp
 */
function openRulesModal() {
    // Get the modal
    var modal = document.getElementById("rules-modal");

    // Display the modal
    modal.style.display = "block";
}

/**
 * Hides the rules modal. Adapted from
 * code by W3C Schools at 
 * https://www.w3schools.com/howto/howto_css_modals.asp
 */
function closeRulesModal() {
    // Get the modal
    var modal = document.getElementById("rules-modal");

    // Display the modal
    modal.style.display = "none";
}

/**
 * Turns audio on and off. Code adapted from
 * https://stackoverflow.com/a/37218500/21643967
 */
function audioToggle() {
    // Check state of audio button icon and toggle
    let audioLink = document.getElementById('audio-link');
    let audioLinkIcon = document.getElementById('audio-link').firstChild;

    if (audioLinkIcon.classList.contains('fa-volume-mute')) {
        audioLink.innerHTML = `<i class="fa-solid fa-volume-low"></i>`;
    } else {
        audioLink.innerHTML = `<i class="fa-solid fa-volume-mute"></i>`;
    }

    // Get all video and audio elements on the page
    document.querySelectorAll("video, audio").forEach(elem => toggleMute(elem));

    // Check if element paused and toggle
    function toggleMute(elem) {
        if (elem.paused) {
            elem.muted = false;
            elem.play();
        } else {
            elem.muted = true;
            elem.pause();
        }
    }
}

/**
 * Checks that a name has been entered on the intro screen
 * before passing flow on to initPlacement(). If no name entered
 * this displays an error message in the form.
 * @param {string} playername - name entered by player 
 */
function checkName(playerName) {
    let errorMsg = document.getElementById('error-message');
    if (playerName) {
        initPlacement(playerName);
    } else {
        errorMsg.innerHTML = '<p>YOU MUST ENTER YOUR NAME TO START</p>';
    }
}

/**
 * Update player grid cell click event listeners by removing existing and
 * then adding new click event listeners to call methods of the current
 * ship object.
 * @function updatePlayerGridListener
 * @param {object} players - the object containg player objects
 * @param {object} playerShips - object containing the player's ship objects
 * @param {object} computerShips - object containing the computer's ship objects
 * @param {object} gameBoards - object containing game board objects
 * @param {object} currentPlayer - the current player object in play
 * @param {object} currentShip - the current ship object in play
 */
function updatePlayerGridListener(
    players,
    playerShips,
    computerShips,
    gameBoards,
    currentPlayer,
    currentShip
) {
    let playerCells = document.getElementsByClassName('player-play-area');
    /* 
    * Method to store event handlers for later reference
    * adapted from answer by ChatGPT by https://openai.com
    */

    // Remove existing click event listeners from the cells
    for (let cell of playerCells) {
        const clickHandler = BattleshipGameEvents.placeEventHandlers[cell.id];
        if (clickHandler) {
            cell.removeEventListener('click', clickHandler);
            delete BattleshipGameEvents.placeEventHandlers[cell.id];
        }
    }

    // Add new click event listeners to the cells
    for (let cell of playerCells) {
        function cellClick(event) {
            // Handle the cell click event
            currentShip.placeShip(event.target, currentPlayer, playerShips);
        }

        BattleshipGameEvents.placeEventHandlers[cell.id] = cellClick;
        /* Check cell doesn't already contain placed ship 
         * then add click listener, remove ship-placement
         * class and add no-placement class.
         */
        if (!cell.classList.contains('placed')) {
            cell.addEventListener("click", cellClick);
        } else {
            cell.classList.remove('ship-placement');
            cell.classList.add('no-placement');
        }
    }
}

/**
 * Update placement buttons with click event listeners to call methods of 
 * current ship object. 
 * @function updatePlacementListener
 * @param {object} players - the object containg player objects
 * @param {object} playerShips - object containing the player's ship objects
 * @param {object} computerShips - object containing the computer's ship objects
 * @param {object} gameBoards - object containing game board objects
 * @param {object} currentPlayer - the current player object in play
 * @param {object} currentShip - the current ship object in play
 */
function updatePlacementListener(
    players,
    playerShips,
    computerShips,
    gameBoards,
    currentPlayer,
    currentShip
) {
    let gameButtons = document.getElementsByClassName('game-button');
    for (let button of gameButtons) {
        /* 
         * Clone the button to remove any previous event listeners.
         * Code adapted from answer by ChatGPT by https://openai.com
         */
        const clonedButton = button.cloneNode(true);
        button.replaceWith(clonedButton);

        clonedButton.addEventListener("click", function () {
            switch (this.id) {
                case 'place-control':
                    currentShip.confirmPlaceShip(
                        players,
                        playerShips,
                        computerShips,
                        gameBoards,
                        currentPlayer,
                        currentShip
                    );
                    break;
                case 'rotate-control':
                    currentShip.rotateShip(currentPlayer, playerShips);
                    break;
                case 'random-control':
                    /* randomShip will accept playerShips and computerShips
                    * passing computerShips undefined as we 
                    * only want to randomly generate player ships a this point
                    */
                    let playerRandom = true;
                    let computerRandom = false;
                    randomShip(
                        players,
                        playerShips,
                        computerShips,
                        gameBoards,
                        currentPlayer,
                        currentShip,
                        playerRandom,
                        computerRandom
                    );
                    break;
                case 'reset-control':
                    /*
                    * clears playerShips and/or computerShips
                    * depending on which are passed as parameters
                    */
                    let playerClear = true;
                    let computerClear = false;
                    clearShips(
                        players,
                        playerShips,
                        computerShips,
                        gameBoards,
                        currentPlayer,
                        currentShip,
                        playerClear,
                        computerClear
                    );
                    break;
            }
        });
    }
}

/**
 * Generate random coordinates to place ships randomly.
 * @function randomShip
 * @param {object} players - the object containg player objects
 * @param {object} playerShips - object containing the player's ship objects
 * @param {object} computerShips - object containing the computer's ship objects
 * @param {object} gameBoards - object containing game board objects
 * @param {object} currentPlayer - the current player object in play
 * @param {object} currentShip - the current ship object in play
 * @param {boolean} playerRandom - true if player ships to be randomised
 * @param {boolean} computerRandom - true if computer ships to be randomised
 */
function randomShip(
    players,
    playerShips,
    computerShips,
    gameBoards,
    currentPlayer,
    currentShip,
    playerRandom,
    computerRandom
) {
    // pass to clearShips in case ship already placed
    // for each ship in shipObject generate a random alphanumeric coord
    // pass coordinate to checkPlacement
    // if coords found generate again
    // if not found add to ship.coordinates
    // pass ship object to placeShip
    // pass to runGame

    /*
    * clears playerShips or computerShips
    * depending on playerRandom or computerRandom being 
    * passed as parameters
    */
    switch (true) {
        case playerRandom && !computerRandom:
            let playerClear = true;
            let computerClear = false;
            clearShips(
                players,
                playerShips,
                computerShips,
                gameBoards,
                currentPlayer,
                currentShip,
                playerClear,
                computerClear
            );
            for (let shipKey in playerShips) {
                let randomCoordInvalid = '';
                let randomShipCoord = '';
                let shipObject = playerShips[shipKey];

                do {
                    shipObject.coordinates = [];
                    // Generate ship row
                    let boardRows = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                    let randomShipRow = Math.floor(Math.random() * 10) + 1;
                    let randomShipLetter = boardRows[randomShipRow];

                    // Generate ship column
                    let randomShipCol = Math.floor(Math.random() * 10) + 1;
                    randomShipCoord = randomShipLetter + randomShipCol;

                    /* 
                    * Increase the row letter and column number based on the size of the ship.
                    * Code adapted from answer provided by ChatGPT by https://openai.com/
                    */
                    let rowLetter = randomShipCoord[0];
                    let columnNumber = parseInt(randomShipCoord.slice(1));

                    // Push first coordinate to array
                    shipObject.coordinates.push(randomShipCoord);

                    // Add ships other coordinates to array based on ship size
                    for (let cellCount = 0; cellCount < shipObject.size - 1; cellCount++) {

                        rowLetter = String.fromCharCode(rowLetter.charCodeAt(0) + 1);

                        // Generate the new cell ID
                        let newCellId = rowLetter + columnNumber;

                        // Add the new cell ID to the Ship object's coordinates array
                        shipObject.coordinates.push(newCellId);
                    }

                    // Randomly call rotateShip
                    let rotationNumber = Math.floor(Math.random() * 6);
                    if (rotationNumber === 1) {
                        shipObject.rotateShip(currentPlayer, playerShips, randomShipCoord);
                    }

                    randomCoordInvalid = shipObject.checkPlacement(shipObject, playerShips, computerShips);
                    console.log(shipObject.shipName + ' Invalid Coord...' + randomCoordInvalid);

                }
                while (randomCoordInvalid);

                console.log("Ships after random loop: " + shipObject.shipName + ' coords ' + shipObject.coordinates);

                // Place the random ships
                shipObject.placeShip('', currentPlayer, playerShips, randomShipCoord);

                /*
                * If ships coordinates all start with the same letter then
                * the coordinates have rotated so we should rotate the ship image.
                * Tried using rotateShip but things got complicated. This is 
                * something to work on in the future.
                */
                let shipCoordinates = shipObject.coordinates;
                // Get first character of first coordinate
                let firstCharacter = shipCoordinates[0][0];
                let isSameFirstCharacter = true;
                let imgElement = document.getElementById(shipCoordinates[0]);
                console.log('Img...' + imgElement);

                for (let i = 1; i < shipCoordinates.length; i++) {
                    if (shipCoordinates[i][0] !== firstCharacter) {
                        isSameFirstCharacter = false;
                        break;
                    }
                }

                if (isSameFirstCharacter) {
                    console.log('Same char...' + shipObject.shipName);
                    imgElement.style.transform = "rotate(90deg)";
                    shipObject.direction = 'horizontal';
                }

                shipObject.confirmPlaceShip(
                    players,
                    playerShips,
                    computerShips,
                    gameBoards,
                    currentPlayer,
                    currentShip
                );

                // checkPlacement also has to handle computerShips
                // need to alter confirmPlaceShip to handle computerShip placement
                // to place ships without displaying them
                // and to pass turn to player once computer ships placed
            }
            break;
        case computerRandom && !playerRandom:
            console.log("Computer Random Ship!");
            playerClear = false;
            computerClear = true;
            clearShips(
                players,
                playerShips,
                computerShips,
                gameBoards,
                currentPlayer,
                currentShip,
                playerClear,
                computerClear
            );
            break;
        default:
            throw `No ship objects or both player and 
            computer ship objects passed to randomShip()`;
    }
}

/**
 * Clear all ship placements from the game board
 * reset ship coordinates for all player ships
 * and allow the player to start placing ships again.
 * @param {object} players - the object containg player objects
 * @param {object} playerShips - object containing the player's ship objects
 * @param {object} computerShips - object containing the computer's ship objects
 * @param {object} gameBoards - object containing game board objects
 * @param {object} currentPlayer - the current player object in play
 * @param {object} currentShip - the current ship object in play
 * @param {boolean} playerClear - true if clearing player objects
 * @param {boolean} computerClear - true if clearing computer objects
 */
function clearShips(
    players,
    playerShips,
    computerShips,
    gameBoards,
    currentPlayer,
    currentShip,
    playerClear,
    computerClear
) {
    /* Check which parameters are passed to the function
     * to determine which player areas and ship objects should
     * be cleared.
     */
    switch (true) {
        case (playerClear && !computerClear):
            let playerShipCells = document.getElementsByClassName('player-play-area');

            for (let originalCell of playerShipCells) {
                /* 
                * Clone the cell to remove any previous event listeners.
                * Code adapted from answer by ChatGPT by https://openai.com
                */
                let clonedCell = originalCell.cloneNode();
                /*
                * omit the true parameter - will not clone child elements
                * or event listeners
                */
                originalCell.replaceWith(clonedCell);

                /*
                 * Remove placed and no-placement classes
                 * if present and re-add ship-placement
                 */

                if (clonedCell.classList.contains('placed')) {
                    clonedCell.classList.remove('placed');
                }

                if (clonedCell.classList.contains('no-placement')) {
                    clonedCell.classList.add('ship-placement');
                    clonedCell.classList.remove('no-placement');
                }
            }

            /* 
             * Loop over player ship and clear coordinates
             * and placed attributes
             */
            for (let shipKey in playerShips) {
                playerShips[shipKey].coordinates = [];
                playerShips[shipKey].direction = 'vertical';
                playerShips[shipKey].placed = false;
            }

            // Reset currentShip and prevShip back to players first ship, the Carrier 
            let currentShip = playerShips.Carrier;

            /*
            * Re-add event listeners to each cell in the player game board to record
            * ship coordinates on click. And reset placement control event listeners.
            */
            updatePlayerGridListener(null, playerShips, computerShips, null, currentPlayer, currentShip);
            updatePlacementListener(null, playerShips, computerShips, null, currentPlayer, currentShip);
            break;

        case (computerClear && !playerClear):
            let compShipCells = document.getElementsByClassName('computer-play-area');

            for (let originalCell of compShipCells) {
                /* 
                * Clone the cell to remove any previous event listeners.
                */
                let clonedCell = originalCell.cloneNode();
                /*
                * omit the true parameter - will not clone child elements
                * or event listeners
                */
                originalCell.replaceWith(clonedCell);

                /*
                 * Remove hit and miss classes
                 * if present and re-add shot class
                 */
                if (clonedCell.classList.contains('hit')) {
                    clonedCell.classList.remove('hit');
                }

                if (clonedCell.classList.contains('miss')) {
                    clonedCell.classList.add('shot');
                    clonedCell.classList.remove('miss');
                }
            }

            /* 
            * Loop over computer ships and clear coordinates
            * and placed attributes
            */
            for (let shipKey in computerShips) {
                computerShips[shipKey].coordinates = [];
                computerShips[shipKey].direction = 'vertical';
                computerShips[shipKey].placed = false;
            }
            break;

        case (playerClear && computerClear):
            let playerShipCellsCombined = document.getElementsByClassName('player-play-area');
            let computerShipCellsCombined = document.getElementsByClassName('computer-play-area');

            for (let originalCell of playerShipCellsCombined) {
                /* 
                * Clone the cell to remove any previous event listeners.
                */
                let clonedCell = originalCell.cloneNode();
                /*
                * omit the true parameter - will not clone child elements
                * or event listeners
                */
                originalCell.replaceWith(clonedCell);
            }

            for (let originalCell of computerShipCellsCombined) {
                /* 
                * Clone the cell to remove any previous event listeners.
                */
                let clonedCell = originalCell.cloneNode();
                /*
                * omit the true parameter - will not clone child elements
                * or event listeners
                */
                originalCell.replaceWith(clonedCell);
            }

            // Loop over player ship coordinates and clear
            for (let shipKey in playerShips) {
                playerShips[shipKey].coordinates = [];
                playerShips[shipKey].direction = 'vertical';
                playerShips[shipKey].placed = false;
            }

            // Loop over computer ship coordinates and clear        
            for (let shipKey in computerShips) {
                computerShips[shipKey].coordinates = [];
                computerShips[shipKey].direction = 'vertical';
                computerShips[shipKey].placed = false;
            }

            // Reset currentShip and prevShip back to players first ship, the Carrier 
            currentShip = playerShips.Carrier;

            /*
            * Re-add event listeners to each cell in the player game board to record
            * ship coordinates on click. And reset placement control event listeners.
            */
            updatePlayerGridListener(null, playerShips, computerShips, null, currentPlayer, currentShip);
            updatePlacementListener(null, playerShips, computerShips, null, currentPlayer, currentShip);
            break;

        default:
            throw `No ship objects passed to clearShips()`;
    }

}

/**
 * Add pulse effect to placement buttons to prompt player.
 */
function addButtonPulse() {
    let gameButtons = document.getElementsByClassName('game-button');
    for (let button of gameButtons) {
        button.classList.add("pulse");
    }
}

/**
 * Check's if a player's guess results in a ship being hit and provide
 * feedback to player if hit
 * @method checkShipHit
 * @param {} player - player who took shot, we will check opposite player for hit
 * @param {} shotCoord - coordinates of shop from takeShot()
 */
function checkShipHit(player, shotCoord) {
    /* Loop through all of the opposing player's ship coordinates
     * and check if shot coordinates found . If found, pass oppPlayer 
     * and shotCoord to hitShip method. If not, pass oppPlayer 
     * and shotCoord to missShip method. Then pass to checkWinLose().
    */
    // let oppPlayer = player.

    // set player turn attribute to false so game play passes back to computer
    player.turn = false;
    let playerWin = checkWinLose(player, shotCoord);
}

/**
 * Check if all of players ships have been sunk by loop the ship
 * objects shipsRemaining values. Return win true or false
 * @method checkWinLose
 * @param {} oppPlayer - opposing player to check against
 * @param {} shotCoord - coordinates of shot from takeShot()
 * @return {boolean} win - win true of false
 */
function checkWinLose(player, shotCoord) {
    /* Loop through all of the opposing player's ship objects
     * if all equal true then return player name and win true.
    */
    let win = false;

    return win;
}



/**
 * Add pulse effect to placement buttons to prompt player.
 */
function removeButtonPulse() {
    let gameButtons = document.getElementsByClassName('game-button');
    for (let button of gameButtons) {
        button.classList.remove("pulse");
    }
}

/**
 * If all ships sunk notify player of win or loss.
 * Give the player option to start new game.
 */
function playerWinLose() {
    // show intro-modal again but replace contents with win/lose message
    // show new game button
}

/**
 * Clear all ships from game board. Reset coordinates.
 * Clear all click listeners. Reset score excluding 
 * high score.
 * Call initPlacement().
 */
function newGame() {
    // REPLACE THIS! TEMPORARY WAY OF STARING NEW GAME
    location.reload();
}


/**
 * Update the player-message area with text to provide the player
 * with directions during gameplay.
 * @param {string} message - text to be displayed in player-message area
 */
function playerMessage(message, effect) {
    let playMsg = document.getElementById('player-message');
    playMsg.innerHTML = `<span>${message}</span>`;
    playMsg.scrollIntoView();
    playMsg.focus();

    if (effect === 'error') {
        /*
         * Animation to make playerMessage text flash. Code from ChatGPT
         * by https://openai.com
        */
        playMsg.firstChild.classList.add('flash', 'red-text');
        // make sure player message is visible when there's an error

        setTimeout(() => {
            playMsg.firstChild.classList.remove('flash');
        }, 2000);
    }
}

// GAME PLACEMENT AND INITIALISATION FUNCTIONS

/**
 * The game placement function called by checkName when a name has been
 * entered on the start-game-form. Calls functions to create
 * players and gameboards, add placement button and gameboard grid
 * event listeners then passes to runGame().
 * @param {string} playerName - players name entered in start-game-form.
 */
function initPlacement(playerName) {
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
     * Loop over playerTypes, create a gameboard and player
     * object for each. Store gameboard objects in gameBoards{} 
     * and player objects in players{}. Then create ship objects
     * for each player and store in playerShips{} and 
     * computerShips{}.
    */
    for (let keys in playerTypes) {
        let owner = keys;
        // if playerName known use that for player one label
        let label = owner === 'player' && playerName ? playerName : playerTypes[keys];
        gameBoards[keys] = new Gameboard(owner, label);
        gameBoards[keys].createGameBoard();

        /*
         * For each playerType, create a Player object for
         * each, store this in a players object.
         */
        let shipsRemaining = 5;
        let hits = 0;
        let misses = 0;
        let score = 0;
        let highScore = 0;
        if (owner === 'player') {
            // set inital turn attribute to True so player gets first turn
            let turn = true;
            players[keys] = new Player(playerName, shipsRemaining, hits, misses, score, highScore, turn);
            // Replace player one's name in sidebar with name provided 
            players[keys].updateName(playerName.toUpperCase());
        } else {
            // set inital turn attribute to Flase so player gets second turn
            let turn = false;
            playerName = playerTypes[keys];
            players[keys] = new Player(playerName, shipsRemaining, hits, misses, score, highScore, turn);
        }

        /*
         * For each playerType loop over shipTypes, create a 
         * ship object for each, store these in a playerShips and 
         * computerShips object.
         */
        for (let shipName in shipTypes) {
            let size = shipTypes[shipName];
            let coordinates = [];
            let direction = 'vertical';
            let placed = false;
            let hits = 0;
            if (owner === 'player') {
                playerShips[shipName] = new Ship(shipName, size, coordinates, direction, placed, hits);
            } else {
                computerShips[shipName] = new Ship(shipName, size, coordinates, direction, placed, hits);
            }
        }
    }

    // Set currentShip and prevShip to players first ship, the Carrier 
    let currentShip = playerShips.Carrier;
    let currentPlayer = players.player;

    /*
     * Add event listeners to each cell in the player game board to record
     * ship coordinates on click. Event listeners will be updated by
     * confirmPlaceShip method.
     */
    updatePlayerGridListener(players, playerShips, computerShips, gameBoards, currentPlayer, currentShip);

    /* 
     * Add event listeners to placement buttons. Associated with first 
     * Ship object initially. confirmPlaceShip called by Place click 
     * listener will update the listener to the next Ship object.
     */
    updatePlacementListener(players, playerShips, computerShips, gameBoards, currentPlayer, currentShip);

    // show initial welcome and instructions in player message
    playerMessage(`Welcome ${players.player.name}! Click your grid below to place your first ship.
    Click the 'ROTATE' button to change ship direction and click the 
    <span class='red-text'>'PLACE'</span> button to confirm ship placement. 
    Click 'RANDOM' to place ships randomly.`);

    // hide intro screen modal to show game boards
    document.getElementById('intro-modal').style.display = "none";


}

// RUNGAME - need to look at parameters to pass from initPlacement to rungame

/**
 * The checkTurn function is called by confirmPlaceShip when final ship
 * has been placed. This handles changing game board event listeners to
 * start taking shots.
 * @function checkTurn
 * @param {object} currentPlayer - holds the current player object
 * @param {object} playerShips - holds player ship objects
 * @param {object} computerShips - holds computer ship objects
 */
function checkTurn(currentPlayer, playerShips, computerShips) {
    // Runs once ships placed
    // Remove click events listeners from player game board - function?
    // Add shot event listeners to computer game board - clicks call checkShipHit(playerName)
    // Add no-placement class to player game board divs and remove form computer game board
    // Update playerMessage
    // Player takes first shot by clicking on computer game board which calls checkShipHit(playerName)
    // Loops over player ships to see if all ship object sunk attributes are true - call playerWinLose()
    // Returns and calls takeShot method from computer player object which callShipHit
    // Loops over ships
    // if player turn = true player turn else computer turn
    if (currentPlayer.turn === true) {
        console.log('Player One Turn!');

        // Remove placement class from player area cells 
        let playerCells = document.getElementsByClassName('player-play-area');
        for (let cell of playerCells) {
            if (cell.classList.contains('ship-placement')) {
                cell.classList.remove('ship-placement');
                cell.classList.add('no-placement');
            }
        }

        // add checkShipHit event listeners to computer game board
        playerMessage(currentPlayer.name + " CLICK ANYWHERE ON PLAYER TWO'S GRID TO TAKE A SHOT ON THEM!");
    } else {
        console.log('Player Two Turn!');
        playerMessage("PLAYER TWO IS TAKING THEIR SHOT ON YOU!");
        // call takeShot
    }
}

// DOCUMENT LOAD EVENT LISTENER

/* 
 * Wait for the DOM to finish loading, set focus on player-name input
 * add link and button event listeners, and start-game-form submit 
 * listener which passes to checkName() to see if game can start 
 */
document.getElementById('player-name').focus();
document.addEventListener('DOMContentLoaded', function () {

    // Add click event listeners to nav links
    document.getElementById('new-game-link').addEventListener('click', newGame);
    document.getElementById('rules-link').addEventListener('click', openRulesModal);
    document.getElementById('audio-link').addEventListener('click', audioToggle);

    // Add click event listener to modal close button
    document.getElementsByClassName("close")[0].addEventListener('click', closeRulesModal);

    /* If modal visible, close it when the user clicks
     * anywhere outside of the modal
     */
    let rulesModal = document.getElementById('rules-modal');
    window.onclick = function (event) {
        if (event.target == rulesModal) {
            closeRulesModal();
        }
    };

    let playerName = '';

    let startForm = document.getElementById('start-game-form');
    startForm.addEventListener('submit', function (event) {
        //Prevent page refresh
        event.preventDefault();
        playerName = document.getElementById('player-name').value;
        checkName(playerName);
    });

});