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
        if (player.name !== 'PLAYER TWO') {
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
         * If Ship object has already been placed call removeShip
         */
        if (this.coordinates.length > this.size || coordsDuplicated === 'True') {
            this.removeShip(player, coordsDuplicated);
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
     * @param {object} player - the player object from  players{}
     * @param {boolean} coordsDuplicated - true if ship coords found
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
        let shipCoord = document.getElementById(this.coordinates[0]);

        // Check ship has been placed if not show error
        if (shipCoord !== null) {        
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
        } else {
            playerMessage(`NO SHIPS TO ROTATE! YOU NEED TO CLICK ON YOUR GRID TO ADD A SHIP FIRST AND THEN CLICK ROTATE.`,'error');
            throw `No Ships Placed to Rotate!`;
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
         * Loop through playerShips and get ship coordinates that
         * aren't the ship being checked. Check the current ship's
         * coordinates against all other coordinates.
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
     * cell and placement button event listeners. 
     * Checks if all players ships have been placed and then passes to
     * checkTurn().
     * @method confirmPlaceShip
     * @param {object} currentPlayer - the current player
     * @param {object} playerShips - the playerShips object
     */
    confirmPlaceShip(currentPlayer, playerShips) {
        let shipCoord = document.getElementById(this.coordinates[0]);
        // check ship has been placed if not show error
        if (shipCoord !== null) {
            /* Increase z-index of ship to bring to to top */
            shipCoord.classList.add('placed');
            /* Set ship object placed to true */
            this.placed = true;

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

            /* Confirm is last ship placed if it is
            * change/remove placement buttons
            * pass to checkTurn()
            */
            let countShipsPlaced = 0;
            for (let ships in playerShips) {
                if (playerShips[ships].placed === true) {
                    countShipsPlaced++;
                }
            }

            /* If all ships placed pass to checkTurn() 
            * to start turn based game play
            */
            if (countShipsPlaced === 5) {
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

                playerMessage(currentPlayer.name + " your turn to place your " + nextShip.shipName);

                updateCellListener(nextShip, currentPlayer, playerShips);
                updatePlacementListener(nextShip, currentPlayer, playerShips);
            }
        } else {
            playerMessage(`NO SHIPS TO PLACE! YOU NEED TO CLICK ON YOUR GRID TO ADD A SHIP FIRST AND THEN CLICK PLACE.`,'error');
            throw `No Ships Placed to Confirm!`;
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
 * Update placement buttons with click event listeners to call methods of 
 * current ship object. 
 * @param {object} currentShip - the ship object from Playerships currently being placed
 * @param {object} currentPlayer - the player object from players that is placing ships
 * @param {object} playerShips - object containing the player's ship objects
 * @param {object} computerShips - object containing the computer's ship objects
 */
function updatePlacementListener(currentShip, currentPlayer, playerShips, computerShips) {
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
                    currentShip.confirmPlaceShip(currentPlayer, playerShips);
                    break;
                case 'rotate-control':
                    currentShip.rotateShip(currentPlayer, playerShips);
                    break;
                case 'random-control':
                    randomShip(playerShips);
                    break;
                case 'reset-control':
                    /*
                    * clears playerShips and/or computerShips
                    * depending on which are passed as parameters
                    */
                    clearShips(playerShips); 
                    break;
            }
        });
    }
}

/**
 * Generate random coordinates to place ships randomly.
 * @param {object} playerShips - object containing the player's ship objects
 * @param {object} computerShips - object containing the computer's ship objects
 */
function randomShip(playerShips, computerShips) {
    // pass to clearShips in case ship already placed
    // for each ship in shipObject generate a random alphanumeric coord
    // pass coordinate to checkShipPlacement
    // if coords found generate again
    // if not found add to ship.coordinates
    // pass ship object to placeShip
    // pass to runGame

    /*
    * clears playerShips or computerShips
    * depending on which are passed as parameters
    */
    switch (true) {
        case playerShips:
            console.log("Player Random Ship!");
            clearShips(playerShips);
            break;
        case computerShips:
            console.log("Computer Random Ship!");            
            clearShips(computerShips);
            break;
        default:
            throw `No ship objects passed to randomShip()`;
    }
}

/**
 * Clear all ship placements from the game board
 * reset ship coordinates for all player ships
 * and allow the player to start placing ships again.
 * @param {object} playerShips - object containing the player's ship objects
 * @param {object} computerShips - object containing the computer's ship objects
 */
function clearShips(playerShips, computerShips) {
    /* Check which parameters are passed to the function
     * to determine which player areas and ship objects should
     * be cleared.
     */ 
    if (playerShips && !computerShips) {
        let shipCells = document.getElementsByClassName('player-play-area');

        for (let originalCell of shipCells) {
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
        }

        // Loop over player ship coordinates and clear
        for (let shipKey in playerShips) {
            playerShips[shipKey].coordinates = [];
        }
    } else if (computerShips && !playerShips) {
        let shipCells = document.getElementsByClassName('computer-play-area');

        for (let originalCell of shipCells) {
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

        // Loop over computer ship coordinates and clear
        for (let shipKey in computerShips) {
            computerShips[shipKey].coordinates = [];
        }        

    } else if (playerShips && computerShips) {
        let playShipCells = document.getElementsByClassName('player-play-area');
        let compShipCells = document.getElementsByClassName('computer-play-area');

        for (let originalCell of playShipCells) {
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
        }        

        // Loop over player ship coordinates and clear
        for (let shipKey in playerShips) {
            playerShips[shipKey].coordinates = [];
        }   
        
        // Loop over computer ship coordinates and clear        
        for (let shipKey in computerShips) {
            computerShips[shipKey].coordinates = [];
        }   

    } else {
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

    if (effect === 'error') {
        /*
         * Animation to make playerMessage text flash. Code from ChatGPT
         * by https://openai.com
        */
        playMsg.firstChild.classList.add('flash', 'red-text');
        // make sure player message is visible when there's an error
        playMsg.scrollIntoView()
        playMsg.focus();

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
    updateCellListener(currentShip, currentPlayer, playerShips);

    /* 
     * Add event listeners to placement buttons. Associated with first Ship object initially.
     * Each method will update the listener to the next Ship object.
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

// RUNGAME - need to look at parameters to pass from initPlacement to rungame

/**
 * The checkTurn function is called by confirmPlaceShip when final ship
 * has been placed. This handles changing game board event listeners to
 * start taking shots.
 * @param {object} players - holds player objects
 * @param {object} playerShips - holds player ship objects
 * @param {object} computerShips - holds computer ship objects
 */
function checkTurn(players, playerShips, computerShips) {
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
    if (players.turn === true) {
        console.log('Player One Turn!');
        // add checkShipHit event listeners to computer game board
        playerMessage(players.name + " CLICK ANYWHERE ON PLAYER TWO'S GRID TO TAKE A SHOT ON THEM!");
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