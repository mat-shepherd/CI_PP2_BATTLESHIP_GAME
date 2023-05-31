// CLASSES

/** 
 * Defines the various ship game piece objects which represent the
 * ships the players place on the game board.
 * @class Ship
 * @param {string} shipName - name of ship type
 * @param {string} size - number of cells a ship occupies
 * @param {object} coordinates - cell coordinates of ships location
 * @param {string} direction - direction of ships rotation
 * @param {object} hits - coordinates ship has been hit at
 * @param {boolean} sunk - true if ship is sunk false if not
*/
class Ship {
    constructor(shipName, size, coordinates, direction, hits, sunk) {
        this.shipName = shipName;
        this.size = size;
        this.coordinates = coordinates;
        this.direction = direction;
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
     * @param {object} players - the object containg player objects
     * @param {object} playerShips - object containing the player's ship objects
     * @param {object} computerShips - object containing the computer's ship objects
     * @param {object} gameBoards - object containing game board objects
     * @param {object} currentPlayer - the current player object in play
     * @param {object} currentShip - the current ship object in play
     * @param {object} targetCell - clicked target event object
     * @param {object} randomShipCoord - optional coord passed by randomShip
     */
    placeShip(
        players,
        playerShips,
        computerShips,
        gameBoards,
        currentPlayer,
        currentShip,
        targetCell,
        randomShipCoord
    ) {
        /* 
         * Get game board clicked cell object and add first 
         * coordinate of Ship object. If the image is clicked
         * instead of the div get the ID of the image's parent
         * DIV.
         */
        let cellId = '';
        if (targetCell.tagName === 'IMG') {
            // If click on image get parent div.
            cellId = targetCell.parentElement.id;
        } else if (randomShipCoord) {
            cellId = randomShipCoord;
        } else {
            // otherwise use ID of clicked element
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
        * Add audio and play if not already added but respect mute.
        * Code adapted from ChatGPT by https://openai.com/
        * ? in .firstChild makes sure variable is assigned null
        * if element not found
        */
        let audioLinkIcon = document.getElementById('audio-link')?.firstChild;

        if (audioLinkIcon && !audioLinkIcon.classList.contains('fa-volume-mute')) {
            let boatSplash = document.querySelector('#boat-splash');

            if (!boatSplash) {
                boatSplash = new Audio('./assets/sounds/boat-splash.mp3');
                boatSplash.id = 'boat-splash';
                boatSplash.volume = 0.3;
                document.body.appendChild(boatSplash);
            }

            boatSplash.play();
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

        /*
         * If Ship object has already been placed or placement isn't valid remove it
         * from the game board and remove coordinates from the ship coordinates array
         */
        this.coordinates.splice(0, this.size);

        // If an image is found at coords then remove
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
     * @param {object} players - the object containg player objects
     * @param {object} playerShips - object containing the player's ship objects
     * @param {object} computerShips - object containing the computer's ship objects
     * @param {object} gameBoards - object containing game board objects
     * @param {object} currentPlayer - the current player object in play
     * @param {object} currentShip - the current ship object in play
     * @param {string} randomShipCoord - coordinate generated for random ship
     */
    rotateShip(
        players,
        playerShips,
        computerShips,
        gameBoards,
        currentPlayer,
        currentShip,
        randomShipCoord
    ) {
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
     * Checks if a ship's coordinates indicate it has been rotated.
     * If so rotate the image 90 degree.
     * Used by randomShip.
     * @method matchRotation
     * @param {object} shipFirstCell - first cell of computer ship object
     */
    matchRotation(shipFirstCell) {
        /*
        * If ships coordinates all start with the same letter then
        * the coordinates have rotated so we should rotate the ship image.
        * Tried using rotateShip but things got complicated. This is 
        * something to work on in the future.
        */
        let shipCoordinates = this.coordinates;
        let imgElement;
        // Get first character of first coordinate
        let firstCharacter = shipCoordinates[0][0];
        let isSameFirstCharacter = true;
        if (shipFirstCell) {
            imgElement = shipFirstCell;
        } else {
            imgElement = document.getElementById(shipCoordinates[0]);
        }

        for (let i = 1; i < shipCoordinates.length; i++) {
            if (shipCoordinates[i][0] !== firstCharacter) {
                isSameFirstCharacter = false;
                break;
            }
        }

        if (isSameFirstCharacter && imgElement) {
            imgElement.style.transform = "rotate(90deg)";
            this.direction = 'horizontal';
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
     * @param {boolean} computerRandom - true if called by randomShips for computer
     * @returns {string} coord - returns coordinate if conflicting or null if valid
     */
    checkPlacement(checkShip, playerShips, computerShips, computerRandom) {
        /*
         * Loop through playerShips and get ship coordinates that
         * aren't the ship being checked. Check the current ship's
         * coordinates against all other coordinates.
         */

        let shipObject = computerRandom ? computerShips : playerShips;
        for (let shipName in shipObject) {
            if (shipName !== checkShip.shipName) {
                let otherShip = shipObject[shipName];
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
                // Don't do if shooting
                let placedShipCells = this.coordinates;

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

                /* 
                 * If all ships placed hide placement controls, add computer
                 * grid shoot click listeners and pass to checkTurn() to start
                 * turn based game play
                 */
                // no-placement on player grid
                if (countShipsPlaced === 5) {
                    initShooting(
                        players,
                        playerShips,
                        computerShips,
                        gameBoards,
                        currentPlayer,
                        currentShip
                    );
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

                    gameBoards.player.updateGridListener(
                        players,
                        playerShips,
                        computerShips,
                        gameBoards,
                        currentPlayer,
                        currentShip
                    );
                    updatePlacementListener(
                        players,
                        playerShips,
                        computerShips,
                        gameBoards,
                        currentPlayer,
                        currentShip
                    );
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
     * @param {object} players - the object containg player objects
     * @param {object} playerShips - object containing the player's ship objects
     * @param {object} computerShips - object containing the computer's ship objects
     * @param {object} gameBoards - object containing game board objects
     * @param {object} currentPlayer - the current player object in play
     * @param {object} currentShip - the current ship object in play
     * @param {string} targetCell - clicked shot cell coords
     */
    hitShip(
        players,
        playerShips,
        computerShips,
        gameBoards,
        currentPlayer,
        currentShip,
        targetCell
    ) {
        let shotCell;
        let shipSize = this.size;

        /* 
        * Add audio and play if not already added but respect mute.
        * Code adapted from ChatGPT by https://openai.com/
        * ? in .firstChild makes sure variable is assigned null
        * if element not found
        */
        let audioLinkIcon = document.getElementById('audio-link')?.firstChild;

        if (audioLinkIcon && !audioLinkIcon.classList.contains('fa-volume-mute')) {
            let explodeSound = document.querySelector('#explode-sound');

            if (!explodeSound) {
                explodeSound = new Audio('./assets/sounds/explosion.mp3');
                explodeSound.id = 'explode-sound';
                explodeSound.volume = 0.3;
                document.body.appendChild(explodeSound);
            }

            explodeSound.play();
        }

        /*
         * Add hit coordinates to player hits attribute and 
         * ship hits hits attribute.
         */
        currentPlayer.hits.push(targetCell);
        this.hits.push(targetCell);

        // Update hits score
        currentPlayer.updateHits(players, playerShips, computerShips);

        // Add ship images when sunk
        if (currentPlayer === players.computer) {
            shotCell = document.getElementById(targetCell);
            shotCell.classList.add('hit');
            shotCell.innerHTML += `<img src='./assets/images/effects/explosion.gif' id='explode-${targetCell}' class='explosion'>`;
            setTimeout(function () {
                document.querySelector('[id^="explode-"]').remove();
                shotCell.innerHTML += "<img src='./assets/images/effects/fire.gif' class='fire'>";
            }, 2500);
        } else {
            targetCell += "C"; // add C back to coordinates to match computer IDs
            shotCell = document.getElementById(targetCell);
            shotCell.classList.add('hit');
            shotCell.innerHTML += `<img src='./assets/images/effects/explosion.gif' id='explode-${targetCell}' class='explosion'>`;
            setTimeout(function () {
                document.querySelector('[id^="explode-"]').remove();
                shotCell.innerHTML += "<img src='./assets/images/effects/fire.gif' class='fire'>";
            }, 2500);
        }

        // Check if ship has been hit max number of times and call sinkShip
        if (this.hits.length === shipSize) {
            this.sinkShip(
                players,
                playerShips,
                computerShips,
                currentPlayer
            );
        }

    }

    /**
     * Check's if a player's guess results in a ship being missed and provide
     * feedback to player if hit
     * @method missShip
     */
    missShip(
        players,
        playerShips,
        computerShips,
        gameBoards,
        currentPlayer,
        currentShip,
        targetCell
    ) {
        let shotCell;

        /* 
        * Add audio and play if not already added but respect mute.
        * Code adapted from ChatGPT by https://openai.com/
        * ? in .firstChild makes sure variable is assigned null
        * if element not found
        */
        let audioLinkIcon = document.getElementById('audio-link')?.firstChild;

        if (audioLinkIcon && !audioLinkIcon.classList.contains('fa-volume-mute')) {
            let splashSound = document.querySelector('#splash-sound');

            if (!splashSound) {
                splashSound = new Audio('./assets/sounds/miss-splash.mp3');
                splashSound.id = 'splash-sound';
                splashSound.volume = 0.3;
                document.body.appendChild(splashSound);
            }

            splashSound.play();
        }

        // Add miss coordinate to player misses attribute
        currentPlayer.misses.push(targetCell);

        // Update player miss score
        currentPlayer.updateMisses(players, playerShips, computerShips);

        if (currentPlayer === players.computer) {
            shotCell = document.getElementById(targetCell);
            // Check if miss already added
            if (!shotCell.classList.contains('miss')) {
                shotCell.classList.add('miss');
                shotCell.innerHTML += `<img src='./assets/images/effects/splash.gif' id='splash-${targetCell}' class='splash'>`;
                setTimeout(function () {
                    document.querySelector('[id^="splash-"]').remove();
                    shotCell.innerHTML += "<img src='./assets/images/effects/miss.png' class='splash-miss'>";
                }, 3500);
            }
        } else {
            targetCell += "C"; // add C back to coordinates to match computer IDs
            shotCell = document.getElementById(targetCell);
            // Check if miss already added
            if (!shotCell.classList.contains('miss')) {
                shotCell.classList.add('miss');
                shotCell.innerHTML += `<img src='./assets/images/effects/splash.gif' id='splash-${targetCell}' class='splash'>`;
                setTimeout(function () {
                    document.querySelector('[id^="splash-"]').remove();
                    shotCell.innerHTML += "<img src='./assets/images/effects/miss.png' class='splash-miss'>";
                }, 3500);
            }
        }
    }

    /**
     * If ship has been hit maximum amount of times sink ship
     * Update ship objects sunk attribute to true
     * @method sinkShip
     * @param {object} players - the object containg player objects
     * @param {object} playerShips - object containing the player's ship objects
     * @param {object} computerShips - object containing the computer's ship objects
     * @param {object} currentPlayer - the current player object in play
     */
    sinkShip(
        players,
        playerShips,
        computerShips,
        currentPlayer
    ) {
        /* 
        * Find current player's opposing player and generate ID of ship
        * score element.
        */
        let oppPlayer = currentPlayer === players.player ? 'p2' : 'p1';
        let currentPlayerName = currentPlayer === players.player ? players.player.name : players.computer.name;
        let oppPlayerName = currentPlayer === players.player ? players.computer.name : players.player.name;
        let oppShip = this.shipName.toLowerCase();
        let oppShipElem = `${oppPlayer}-${oppShip}`;

        /* 
         * Add sink ship audio and play if not already added but respect mute.
         * Code adapted from ChatGPT by https://openai.com/
         * ? in .firstChild makes sure variable is assigned null
         * if element not found
        */
        let audioLinkIcon = document.getElementById('audio-link')?.firstChild;

        if (audioLinkIcon && !audioLinkIcon.classList.contains('fa-volume-mute')) {
            let sinkSound = document.querySelector('#sink-sound');

            if (!sinkSound) {
                sinkSound = new Audio('./assets/sounds/sink-ship.mp3');
                sinkSound.id = 'sink-sound';
                sinkSound.volume = 0.3;
                document.body.appendChild(sinkSound);
            }

            sinkSound.play();
        }

        // Find opposing player's ship elelemnt and mark sunk
        let sunkShip = document.getElementById(oppShipElem);
        sunkShip.innerHTML += `<img src='./assets/images/effects/sunk.png' class='ship-sunk'>`;

        // Set ship' sunk attribute to true
        this.sunk = true;

        if (oppPlayer === 'p2') {
            // Get ship's first coordinate
            let shipFirstCoord = this.coordinates[0];
            // Append C to get computer cell ID
            shipFirstCoord += 'C';
            let shipFirstCell = document.getElementById(shipFirstCoord);

            // Set sunkShip to computer ship cell to reference later
            sunkShip = shipFirstCell;

            // Add sunk ship image to computer grid if computer ship
            switch (this.shipName) {
                case 'Carrier':
                    shipFirstCell.innerHTML += "<img src='./assets/images/ships/carrier.png' class='ship carrier'>";
                    break;
                case 'Battleship':
                    shipFirstCell.innerHTML += "<img src='./assets/images/ships/battleship.png' class='ship'>";
                    break;
                case 'Cruiser':
                    shipFirstCell.innerHTML += "<img src='./assets/images/ships/cruiser.png' class='ship'>";
                    break;
                case 'Submarine':
                    shipFirstCell.innerHTML += "<img src='./assets/images/ships/submarine.png' class='ship'>";
                    break;
                case 'Destroyer':
                    shipFirstCell.innerHTML += "<img src='./assets/images/ships/destroyer.png' class='ship destroyer'>";
                    break;
            }

            // Rotate if needed
            this.matchRotation(shipFirstCell);

            /* 
            * Workaround to stop fire and miss icons rotating
            * with ship. Rotate 90 degrees counter clockwise.
            */
            if (sunkShip.style.cssText.includes('transform')) {
                let fireIcon = sunkShip.querySelector('.fire');
                let splashMiss = sunkShip.querySelector('.splash-miss');
                if (fireIcon) {
                    fireIcon.style.transform = "rotate(-90deg)";
                    fireIcon.style.top = "10%";
                    fireIcon.style.left = "10%";
                }
                if (splashMiss) {
                    splashMiss.style.transform = "rotate(-90deg)";
                    splashMiss.style.top = "10%";
                    splashMiss.style.left = "10%";
                }
            }
        }

        // Count opposing player's sunk ships and update score board
        let shipScore;
        let shipsRemaining = 0;
        if (oppPlayer === 'p2') {
            shipScore = document.getElementById('p2-ships');
            for (let shipKey in computerShips) {
                if (computerShips[shipKey].sunk === false) {
                    shipsRemaining++; // Increment shipsRemaining if sunk is false
                }
                console.log(computerShips[shipKey].shipName + ' sunk ' + computerShips[shipKey].sunk);
            }
            console.log('Ships remaining... ' + shipsRemaining);
        } else {
            shipScore = document.getElementById('p1-ships');
            for (let shipKey in playerShips) {
                if (playerShips[shipKey].sunk === false) {
                    shipsRemaining++; // Increment shipsRemaining if sunk is false
                }
                console.log('Ships remaining... ' + shipsRemaining);
            }
        }
        // Update player ship score
        shipScore.innerHTML = shipsRemaining;

        // This code snippet provided by ChatGPT
        return new Promise((resolve) => {
            delay(2500).then(() => {
            playerMessage(`${currentPlayerName} SUNK ${oppPlayerName}'s ${this.shipName}!`);
            resolve();
            });
        });
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
        this.placeEventHandlers = {};
        this.shootEventHandlers = {};
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
                        playGrid += `<div id="${cellId}" class="${cellClass}"></div>`;
                    }
                }
            }
        }
        this.owner === 'computer' ? computerGameboard.innerHTML = playGrid : playerGameboard.innerHTML = playGrid;
    }

    /**
     * Update grid cell click event listeners for this game board by removing 
     * existing and then adding new click event listeners to call methods of 
     * the currentShip object.
     * @method updateGridListener
     * @param {object} players - the object containg player objects
     * @param {object} playerShips - object containing the player's ship objects
     * @param {object} computerShips - object containing the computer's ship objects
     * @param {object} gameBoards - object containing game board objects
     * @param {object} currentPlayer - the current player object in play
     * @param {object} currentShip - the current ship object in play
     */
    updateGridListener(
        players,
        playerShips,
        computerShips,
        gameBoards,
        currentPlayer,
        currentShip
    ) {
        if (this.owner === 'player') {
            let playerCells = document.getElementsByClassName('player-play-area');
            /* 
            * Method to store event handlers for later reference
            * adapted from answer by ChatGPT by https://openai.com
            */

            // Remove existing click event listeners from the cells
            for (let cell of playerCells) {
                const clickHandler = gameBoards.player.placeEventHandlers[cell.id];
                if (clickHandler) {
                    cell.removeEventListener('click', clickHandler);
                    delete gameBoards.player.placeEventHandlers[cell.id];
                }
            }

            // Add new click event listeners to the cells
            for (let cell of playerCells) {
                function cellPlace(event) {
                    // Handle the place cell click event
                    currentShip.placeShip(
                        players,
                        playerShips,
                        computerShips,
                        gameBoards,
                        currentPlayer,
                        currentShip,
                        event.target
                    );
                }

                gameBoards.player.placeEventHandlers[cell.id] = cellPlace;
                /* Check cell doesn't already contain placed ship 
                * then add click listener, remove ship-placement
                * class and add no-placement class.
                */
                if (!cell.classList.contains('placed')) {
                    cell.addEventListener("click", cellPlace);
                } else {
                    cell.classList.remove('ship-placement');
                    cell.classList.add('no-placement');
                }
            }
        } else if (this.owner === 'computer') {
            let computerCells = document.getElementsByClassName('computer-play-area');

            // Remove existing place click event listeners from the cells
            for (let cell of computerCells) {
                const clickHandler = gameBoards.computer.shootEventHandlers[cell.id];
                if (clickHandler) {
                    cell.removeEventListener('click', clickHandler);
                    delete gameBoards.computer.shootEventHandlers[cell.id];
                }
            }

            // Add new shoot click event listeners to the cells
            for (let cell of computerCells) {
                function cellShot(event) {
                    // Handle the shot cell click event
                    players.player.takeShot(
                        players,
                        playerShips,
                        computerShips,
                        gameBoards,
                        currentPlayer,
                        currentShip,
                        event.target
                    );
                }

                gameBoards.player.shootEventHandlers[cell.id] = cellShot;
                /* Check cell doesn't already contain hit or miss 
                 * then add click listener, remove existing no-placement
                 * class, add shot class but if cell contains hit or miss 
                 * add no-placement class again.
                 */
                cell.classList.remove('no-placement');
                cell.classList.add('shot');

                if (!cell.classList.contains('hit') && !cell.classList.contains('miss')) {
                    cell.addEventListener("click", cellShot);
                } else {
                    cell.classList.remove('ship-placement');
                    cell.classList.add('no-placement');
                }

            }
        } else {
            throw `Unknown game board!`;
        }
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
    constructor(playerName, shipsRemaining, hits, misses, score, highScore) {
        this.name = playerName;
        this.shipsRemaining = shipsRemaining;
        this.hits = hits;
        this.misses = misses;
        this.score = score;
        this.highScore = highScore;
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
     * Updates the current player hits score
     * @method updateHits
     * @param {object} players - the object containg player objects		
     * @param {object} playerShips - object containing the player's ship objects
     * @param {object} computerShips - object containing the computer's ship objects
     */
    updateHits(players, playerShips, computerShips) {
        let scoreDiv;
        let playerHits = this.hits.length;

        if (this === players.player) {
            scoreDiv = 'p1-hits';
        } else {
            scoreDiv = 'p2-hits';
        }
        let hits = document.getElementById(scoreDiv);
        hits.innerText = playerHits;
    }

    /**
     * Updates the current player misses score
     * @method updateMisses
     * @param {object} players - the object containg player objects		
     * @param {object} playerShips - object containing the player's ship objects
     * @param {object} computerShips - object containing the computer's ship objects	
     */
    updateMisses(players, playerShips, computerShips) {
        let scoreDiv;
        let playerMisses = this.misses.length;

        if (this === players.player) {
            scoreDiv = 'p1-misses';
        } else {
            scoreDiv = 'p2-misses';
        }

        let misses = document.getElementById(scoreDiv);
        misses.innerText = playerMisses;
    }

    /**
     * Updates the winning player's score on the scoreboard
     * @method updateScore
     */
    updateScore() {
        let scoreDiv;

        // Update winning player score
        this.score++;

        let playerScore = this.score;

        if (this.name !== 'PLAYER TWO') {
            scoreDiv = 'p1-score';
        } else {
            scoreDiv = 'p2-score';
        }

        // Update winning player score on scoreboard
        let score = document.getElementById(scoreDiv);
        score.innerText = playerScore;
    }

    /**
     * Updates the player one's high score on the scoreboard
     * @method updateHighScore
     */
    updateHighScore() {
        // Update winning player high score if current score is greater
        let currentScore = this.score;
        let currentHighScore = this.highScore;
        console.log(this.name + "...high score..." + this.highScore);
        this.highScore = currentScore > currentHighScore ? currentScore : currentHighScore;

        let playerHighScore = this.highScore;

        // Update winning player score on scoreboard
        let highScore = document.getElementById('high-score');
        highScore.innerText = playerHighScore;
    }

    /**
     * Check if all of players ships have been sunk by looping the ship
     * objects sunk attribute values. Return win true or false
     * @method checkWinLose
     * @param {object} players - the object containg player objects
     * @param {object} playerShips - object containing the player's ship objects
     * @param {object} computerShips - object containing the computer's ship objects
     * @param {object} currentPlayer - the current player object in play
     * @returns {boolean} win - win true of false
     */
    checkWinLose(
        players,
        playerShips,
        computerShips,
        currentPlayer
    ) {
        /* Loop through all of the opposing player's ship objects
         * and check if all ships sunk
         */
        let win = false;
        let oppPlayer = currentPlayer === players.player ? players.computer : players.player;
        let oppPlayerShips = oppPlayer === players.computer ? computerShips : playerShips;
        let shipsRemaining = 5;
        console.log('Check win lose called. Current player...' + currentPlayer.name + '. Ships...');
        console.log('Opposing player...' + oppPlayer.name + '. Opposing ships...' + JSON.stringify(oppPlayerShips));

        for (let shipName in oppPlayerShips) {
            if (oppPlayerShips[shipName].sunk === true) {
                shipsRemaining--; // Increment shipsRemaining down if sunk is true
                console.log(oppPlayer.name + ' has ' + shipsRemaining + ' ships remaining');
            }
        }

        // If opposing player's shipsremaining is 0 this player wins
        if (shipsRemaining === 0) {
            win = true;
        } else {
            win = false;
        }

        return win;
    }

    /**
     * Loops through each of this player's ships and calls checkShipHit
     * @method takeShot
     * @param {object} players - the object containg player objects
     * @param {object} playerShips - object containing the player's ship objects
     * @param {object} computerShips - object containing the computer's ship objects
     * @param {object} gameBoards - object containing game board objects
     * @param {object} currentPlayer - the current player object in play
     * @param {object} currentShip - the current ship object in play
     * @param {object} targetCell - clicked target event object
     * @param {object} randomShotCoord - optional coord passed by randomShot 
     */
    takeShot(
        players,
        playerShips,
        computerShips,
        gameBoards,
        currentPlayer,
        currentShip,
        targetCell,
        randomShotCoord
    ) {
        // Random hit and miss mesages
        let hitMessage = ["AMAZING SHOT!", "MUST HAVE X-RAY VISION!", "MAKING IT LOOK EASY!", "BEGINNER'S LUCK?", "HEADING FOR THE WIN?"];
        let missMessage = ["BETTER LUCK NEXT TIME!", "SO CLOSE!?", "IT'S A GAME OF LUCK...OR IS IT?", "KEEP TRYING!", "MAYBE THEY SHOULDN'T PLAY THE LOTTO TODAY!"];
        let rMsg = Math.floor(Math.random() * 5);
        // Get element of targetCell
        let shotCellId = '';
        let shotCoord;
        // Find current player's opposing player
        let oppPlayer = currentPlayer === players.player ? players.computer : players.player;

        if (targetCell.tagName === 'IMG') {
            // If click on image get parent div.
            shotCellId = targetCell.parentElement.id;
        } else if (randomShotCoord) {
            shotCellId = randomShotCoord;
        } else {
            // otherwise use ID of clicked element
            shotCellId = targetCell.id;
        }

        /*
        * If shot is on computer cell remove C from end
        * of shotCellId to get coordinates
        */
        if (shotCellId.endsWith('C')) {
            shotCoord = shotCellId.slice(0, -1);
        } else {
            shotCoord = shotCellId;
        }

        // Remove shoot click listeners from shot cell
        if (currentPlayer === players.player) {
            let shotCell = document.getElementById(shotCellId);
            const clickHandler = gameBoards.player.shootEventHandlers[shotCellId];
            if (clickHandler) {
                shotCell.removeEventListener('click', clickHandler);
                delete gameBoards.player.shootEventHandlers[shotCellId];
            }
        }
        console.log('Checking shot for...' + currentPlayer.name);
        // Pass to checkShipHit()
        let shotHit = currentPlayer.checkShipHit(
            players,
            playerShips,
            computerShips,
            gameBoards,
            currentPlayer,
            currentShip,
            shotCoord
        );

        /* Check if shot is hit or miss and check if hit results in win.
         * Otherwise show player hit or miss message.
         */
        if (shotHit) {
            console.log("shotHit..." + shotHit);
            // Check if win or lose
            let playerWin = currentPlayer.checkWinLose(
                players,
                playerShips,
                computerShips,
                currentPlayer
            );
            console.log(currentPlayer.name + ' win status...' + playerWin);
            // If playerWin true
            if (playerWin) {
                // Call function to show win message
                playerWinLose(players, currentPlayer, oppPlayer);
                // Stop further execution
                return;
            } else {
                // playerWin false show hit message
                playerMessage(`${currentPlayer.name} hit one of ${oppPlayer.name}'s ships at ${shotCoord}. ${hitMessage[rMsg]}`);
            }
        } else {
            // Miss false - show miss message
            playerMessage(`${currentPlayer.name} missed at ${shotCoord}. ${missMessage[rMsg]}`);
        }

        /*
        * We need to set currentPlayer to the nextplayer
        * before passing back to checkTurn
        */
        let nextPlayer = this.name !== 'PLAYER TWO' ? players.computer : players.player;

        // call checkShipHit and pass targetCell 
        // for each of this player's ships
        // change currentPlayer each time checkTurn is called 
        // then don't need turn attribute
        currentPlayer = nextPlayer;
        checkTurn(
            players,
            playerShips,
            computerShips,
            gameBoards,
            currentPlayer,
            currentShip
        );
    }

    /**
     * Check's if a player's guess results in a ship being hit and provide
     * feedback to player if hit
     * @method checkShipHit
     * @param {object} players - the object containg player objects
     * @param {object} playerShips - object containing the player's ship objects
     * @param {object} computerShips - object containing the computer's ship objects
     * @param {object} gameBoards - object containing game board objects
     * @param {object} currentPlayer - the current player object in play
     * @param {object} currentShip - the current ship object in play
     * @param {string} targetCell - clicked shot cell coords
     * @returns {boolean} - Returns true if hit or false if miss
     */
    checkShipHit(
        players,
        playerShips,
        computerShips,
        gameBoards,
        currentPlayer,
        currentShip,
        targetCell
    ) {
        // Find opposing player and their ship objects
        let oppPlayer = currentPlayer === players.player ? players.computer : players.player;
        let oppPlayerShips = oppPlayer === players.computer ? computerShips : playerShips;
        let lastShip;
        /*
        * Loop through opposing player ships and check if targetCell
        * coordinates match any of the players ship coordinates.
        */
        for (let shipName in oppPlayerShips) {
            let checkShip = oppPlayerShips[shipName];
            lastShip = checkShip;

            if (checkShip.coordinates.includes(targetCell)) {
                checkShip.hitShip(
                    players,
                    playerShips,
                    computerShips,
                    gameBoards,
                    currentPlayer,
                    currentShip,
                    targetCell
                );
                return true; // Return true if hit
            }
        }

        // If no hit found register miss using last ship  object checked
        lastShip.missShip(
            players,
            playerShips,
            computerShips,
            gameBoards,
            currentPlayer,
            currentShip,
            targetCell
        );

        return false;
    }
}

// HELPER FUNCTIONS
/**
 * Helps delay code execution where playermessages
 * need time to display.
 * Code adapted from answer by ChatGPT by https://openai.com
 */
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

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
    let audioButton = document.getElementById('audio-button');


    if (audioLinkIcon.classList.contains('fa-volume-mute')) {
        audioLink.innerHTML = `<i class="fa-solid fa-volume-low"></i>`;
        audioButton.innerHTML  = `<i class="fa-solid fa-volume-low"></i> AUDIO ON`;
        audioButton.className = 'audio-on';               
    } else {
        audioLink.innerHTML = `<i class="fa-solid fa-volume-mute"></i>`;
        audioButton.innerHTML = `<i class="fa-solid fa-volume-mute"></i> AUDIO OFF`;
        audioButton.className = 'audio-off'; 
    }

    // Get all video and audio elements on the page
    document.querySelectorAll("video, audio").forEach(elem => toggleMute(elem));

    // Check if element paused and toggle
    function toggleMute(elem) {
        if (elem.paused) {
            elem.muted = false;
        } else {
            elem.muted = true;
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
                    currentShip.rotateShip(
                        players,
                        playerShips,
                        computerShips,
                        gameBoards,
                        currentPlayer,
                        currentShip
                    );
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
 * Generate a random grid
 * coordinate
 * @function randomCoord
 * @returns {string} randomShipCoord - alphanumeric coordinate
 */
function randomCoord() {
    // Generate ship row
    let boardRows = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    let randomShipRow = Math.floor(Math.random() * 10) + 1;
    let randomShipLetter = boardRows[randomShipRow];

    // Generate ship column
    let randomShipCol = Math.floor(Math.random() * 10) + 1;
    randomShipCoord = randomShipLetter + randomShipCol;

    return randomShipCoord;
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
    /*
    * Clears playerShips or computerShips
    * depending on playerRandom or computerRandom being 
    * passed as parameters
    */

    let playerClear;
    let computerClear;

    // Set player ship objects to randomise
    if (playerRandom) {
        targetShips = playerShips;
        playerClear = true;
        computerClear = false;
    } else if (computerRandom) {
        targetShips = computerShips;
        playerClear = false;
        computerClear = true;
    } else {
        Throw`No playerRandom computerRandom passed!`;
    }

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

    // For each ship in shipObject generate a random alphanumeric coord
    for (let shipKey in targetShips) {
        let randomCoordInvalid = '';
        let randomShipCoord = '';
        let shipObject = targetShips[shipKey];

        do {
            shipObject.coordinates = [];
            // Generate a random coordinate for ship
            randomShipCoord = randomCoord();

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
            let rotationNumber = Math.floor(Math.random() * 2);
            if (rotationNumber === 0) {
                shipObject.rotateShip(
                    players,
                    playerShips,
                    computerShips,
                    gameBoards,
                    currentPlayer,
                    currentShip,
                    randomShipCoord
                );
            }

            // Call checkPlacement and pass computerRandom as a flag to check computerShips
            randomCoordInvalid = shipObject.checkPlacement(shipObject, playerShips, computerShips, computerRandom);
        }
        while (randomCoordInvalid);
        let randomPlayer = playerRandom ? 'P1' : 'P2';

        console.log(randomPlayer + " - Ships after random loop: " + shipObject.shipName + ' coords ' + shipObject.coordinates);

        // Place the random ships if not computerRandom
        if (playerRandom) {
            shipObject.placeShip(
                players,
                playerShips,
                computerShips,
                gameBoards,
                currentPlayer,
                currentShip,
                '',
                randomShipCoord
            );

            /*
            * If ship's coordinates all start with the same letter then
            * the coordinates have rotated so rotate the ship image.
            */
            shipObject.matchRotation();

            // Confirm placement of random ships
            shipObject.confirmPlaceShip(
                players,
                playerShips,
                computerShips,
                gameBoards,
                currentPlayer,
                currentShip
            );
        }
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
            gameBoards.player.updateGridListener(
                players,
                playerShips,
                computerShips,
                gameBoards,
                currentPlayer,
                currentShip
            );
            updatePlacementListener(
                players,
                playerShips,
                computerShips,
                gameBoards,
                currentPlayer,
                currentShip
            );
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
            gameBoards.player.updateGridListener(
                players,
                playerShips,
                computerShips,
                gameBoards,
                currentPlayer,
                currentShip
            );
            gameBoards.player.updatePlacementListener(
                players,
                playerShips,
                computerShips,
                gameBoards,
                currentPlayer,
                currentShip
            );
            break;

        default:
            throw `No ship objects passed to clearShips()`;
    }

}

/**
 * Add pulse effect to placement buttons to prompt player.
 * @function addButtonPulse
 */
function addButtonPulse() {
    let gameButtons = document.getElementsByClassName('game-button');
    for (let button of gameButtons) {
        button.classList.add("pulse");
    }
}

/**
 * Disable click listeners when state of play is shooting
 * and we need to lock the opposite gameboard
 * @function disableClickListeners
 */
// Disable click listeners
function disableClickListeners(parentElement) {
    parentElement.style.pointerEvents = "none";
}

/**
 * Enable click listeners when state of play is shooting
 * and we need to unlock a gameboard
 * @function enableClickListeners
 */
function enableClickListeners(parentElement) {
    parentElement.style.pointerEvents = "auto";
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
 * @function playerWinLose
 * @param {object} players - the object containg player objects
 * @param {object} currentPlayer - the current player object in play
 * @param {object} oppPlayer - the opposing player object
 */
function playerWinLose(players, currentPlayer, oppPlayer) {
    // Update score in scoreboard
    currentPlayer.updateScore();
    console.log();
    // Update high score in scoreboard if player one
    if (currentPlayer.name !== "PLAYER TWO") {
        currentPlayer.updateHighScore();
    }

    // Get win-modal elements
    let winModal = document.getElementById('win-modal');
    let winHeading = document.getElementById('winner-heading');
    let winBody = document.getElementById('winner-body');

    let audioLinkIcon = document.getElementById('audio-link')?.firstChild;

    let winMessages = [
        `WINNER WINNER CHICKEN DINNER!`,
        `<i class="fa-solid fa-music"></i> YOU'RE THE BEST AROUND...
        NOTHING'S GONNA EVER KEEP YOU DOWN<i class="fa-solid fa-music"></i>`,
        `YOU ARE THE BEST NAVAL COMMANDER THAT I KNOW!`,
        `I HOPE PLAYER TWO HAS BATTLESHIP INSURANCE!`,
    ];

    let loseMessages = [
        `DON'T WORRY, YOU'LL GET 'EM NEXT TIME!`,
        `<i class="fa-solid fa-music"></i>YOU'RE HERE, THERE'S NOTHING I FEAR
        AND I KNOW THAT MY HEART WILL GO ON...<i class="fa-solid fa-music"></i>`,
        `I HOPE YOU HAVE SOME MORE BATTLESHIPS TUCKED AWAY SOMEWHERE!?`,
        `WELL AT LEAST YOU ARE GOOD LOOKING AND HAVE AN AMAZING PERSONALITY ;)`
    ];

    let rMsg = Math.floor(Math.random() * 4);

    // Set win-modal element if P1 Winner or Loser
    if (currentPlayer.name !== "PLAYER TWO") {
        winHeading.innerHTML = `${currentPlayer.name} IS THE WINNER!`;
        winBody.innerHTML = `<p>${winMessages[rMsg]}.</p><br>
        <p>Your score is ${players.player.score}</p><br>
        <p>Your high score is ${players.player.highScore}</p><br>        
        <p>Click below if you want to play again!</p>`;

        // Play winner sound unless muted
        if (audioLinkIcon && !audioLinkIcon.classList.contains('fa-volume-mute')) {
            let winSound = document.querySelector('#win-sound');

            if (!winSound) {
                winSound = new Audio('./assets/sounds/winner.mp3');
                winSound.id = 'win-sound';
                winSound.volume = 0.3;
                document.body.appendChild(winSound);
            }

            winSound.play();
        }

    } else {
        winHeading.innerHTML = `${oppPlayer.name}! YOU LOST!`;
        winBody.innerHTML = `<p>${loseMessages[rMsg]}.</p><br>
        <p>Your score is ${players.player.score}</p><br>
        <p>Your high score is ${players.player.highscore}</p><br>
        <p>Click below if you want to play again!</p>`;

        // Change lose heading color
        winHeading.style.color = "#881400";

        // Play loser sound unless muted
        if (audioLinkIcon && !audioLinkIcon.classList.contains('fa-volume-mute')) {
            let loseSound = document.querySelector('#lose-sound');

            if (!loseSound) {
                loseSound = new Audio('./assets/sounds/loser.mp3');
                loseSound.id = 'lose-sound';
                loseSound.volume = 0.3;
                document.body.appendChild(loseSound);
            }

            loseSound.play();
        }

    }

    // Display win-modal
    setTimeout(() => {
        winModal.style.display = 'flex';
    }, 3000);
}

/**
 * Start a new game by reloading the page and using URL 
 * paramaters to retain player name and scores. 
 * Includes flag to call initPlacement().
 * @function newGame
 */
function newGame() {
    // Retain scores and player name
    let playerName = document.getElementById('p1-stats-heading').innerText;
    let playerScore = document.getElementById('p1-score').innerText;
    let playerHighScore = document.getElementById('high-score').innerText;
    let computerScore = document.getElementById('p2-score').innerText;

    // 
    const url = `index.html?playerName=${playerName}&playerScore=${playerScore}&playerHighScore=${playerHighScore}&computerScore=${computerScore}&newGame=true`;
    window.location.href = url;
}

/**
 * Check window URl on load to see if this is a new game
 * and if player name and scores can be retrieved.
 * @function checkURL
 */
function checkURL() {
    /* 
    * Code adapted from 
    * https://www.sitepoint.com/get-url-parameters-with-javascript/
    */

    let urlParams = new URLSearchParams(window.location.search);
    let existPlayerName = urlParams.get("playerName");
    let playerScore = parseInt(urlParams.get("playerScore"));
    let playerHighScore = parseInt(urlParams.get("playerHighScore"));
    let computerScore = parseInt(urlParams.get("computerScore"));
    let newGame = urlParams.get("newGame");

    // If new game call initPlacement to bypass intro modal
    if (newGame) {
        initPlacement('',existPlayerName, playerScore, playerHighScore, computerScore, newGame);
    }
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
 * @param {string} existPlayerName - players name entered in start-game-form.
 * @param {number} playerScore - optional retained score if new game started 
 * @param {number} playerHighScore - optional retained high score if new game 
 * started 
 * @param {number} computerScore - optional retained computer score if new game
 * started
 * @param {boolean} newGame - optional flag to indicate this is a new game
 */
function initPlacement(playerName, existPlayerName, playerScore, playerHighScore, computerScore, newGame) {
    /**
    * Define game object variables
    */
    const playerTypes = { player: 'PLAYER ONE', computer: 'PLAYER TWO' };
    const players = {};
    const shipTypes = { Carrier: 5, Battleship: 4, Cruiser: 3, Submarine: 3, Destroyer: 2 };
    const playerShips = {};
    const computerShips = {};
    const gameBoards = {};

    // Temporary code that sinks comp ships
    document.getElementById('feedback-link').addEventListener('click', function () {
        // Loop through computerShips and set each ship's "sunk" attribute to true
        for (let shipName in computerShips) {
            computerShips[shipName].sunk = true;
        }

        // Display feedback or perform any other desired actions
        console.log("All computer ships sunk!");
    });

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
        let hits = [];
        let misses = [];
        let score = 0;
        let highScore = 0;
        if (owner === 'player') {
            // set inital turn attribute to True so player gets first turn
            let turn = true;
            // Check for existing scores and name if new game
            playerName = existPlayerName ? existPlayerName : playerName;
            score = playerScore ? playerScore: score;
            highScore = playerHighScore ? playerHighScore: highScore;      

            players[keys] = new Player(playerName, shipsRemaining, hits, misses, score, highScore, turn);
            // Replace player one's name in sidebar with name provided 
            players[keys].updateName(playerName.toUpperCase());
        } else {
            // set inital turn attribute to False so player gets second turn
            let turn = false;
            // Check for existing score if new game
            score = computerScore ? computerScore: score;

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
            let hits = [];
            let sunk = false;
            if (owner === 'player') {
                playerShips[shipName] = new Ship(shipName, size, coordinates, direction, hits, sunk);
            } else {
                computerShips[shipName] = new Ship(shipName, size, coordinates, direction, hits, sunk);
            }
        }
    }

    // Set currentShip and prevShip to players first ship, the Carrier 
    let currentShip = playerShips.Carrier;
    let currentPlayer = players.player;

    /*
     * Add ship placement event listeners to each cell in the player game board 
     * to record ship coordinates on click. Event listeners will be updated by
     * confirmPlaceShip method.
     */
    gameBoards.player.updateGridListener(
        players,
        playerShips,
        computerShips,
        gameBoards,
        currentPlayer,
        currentShip
    );

    /* 
     * Add event listeners to placement buttons. Associated with first 
     * Ship object initially. confirmPlaceShip called by Place click 
     * listener will update the listener to the next Ship object.
     */
    updatePlacementListener(
        players,
        playerShips,
        computerShips,
        gameBoards,
        currentPlayer,
        currentShip
    );

    // If this is a new game via new game link to show new game message 
    if (newGame) {
        setTimeout(() => {
            playerMessage(`NEW GAME STARTED! Good luck ${players.player.name}!`);

            setTimeout(() => {
                // Show initial welcome and instructions in player message
                playerMessage(`Welcome ${players.player.name}! Click your grid below to place your first ship.
                Click the 'ROTATE' button to change ship direction and click the 
                <span class='red-text'>'PLACE'</span> button to confirm ship placement. 
                Click 'RANDOM' to place ships randomly.`);
            }, 2000);
        }, 2000);
    } else {
        // show initial welcome and instructions in player message
        playerMessage(`Welcome ${players.player.name}! Click your grid below to place your first ship.
        Click the 'ROTATE' button to change ship direction and click the 
        <span class='red-text'>'PLACE'</span> button to confirm ship placement. 
        Click 'RANDOM' to place ships randomly.`);
    }

    // hide intro screen modal to show game boards
    document.getElementById('intro-modal').style.display = "none";
}

/**
 * The computer game board initialisation function called by confirmPlaceShip 
 * when all player ships have been placed.
 * Hide placement controls, generates computer random ships, updates computer
 * game board shoot listeners and calls checkTurn().
 * @param {object} players - the object containg player objects
 * @param {object} playerShips - object containing the player's ship objects
 * @param {object} computerShips - object containing the computer's ship objects
 * @param {object} gameBoards - object containing game board objects
 * @param {object} currentPlayer - the current player object in play
 * @param {object} currentShip - the current ship object in play
 */
function initShooting(
    players,
    playerShips,
    computerShips,
    gameBoards,
    currentPlayer,
    currentShip
) {
    let playerCells = document.getElementsByClassName('player-play-area');

    document.getElementById('placement-controls').style.display = 'none';

    // Generate random ships for the computer player
    let playerRandom = false;
    let computerRandom = true;
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

    // Remove placement click listeners from player area cells
    for (let cell of playerCells) {
        const clickHandler = gameBoards.player.placeEventHandlers[cell.id];
        if (clickHandler) {
            cell.removeEventListener('click', clickHandler);
            delete gameBoards.player.placeEventHandlers[cell.id];
        }
    }

    // Remove placement class from player area cells 
    for (let cell of playerCells) {
        if (cell.classList.contains('ship-placement')) {
            cell.classList.remove('ship-placement');
            cell.classList.add('no-placement');
        }
    }

    // This updates initial grid listeners to shoot
    // but when alternating need to make sure player
    // can't click on opposite board
    gameBoards.computer.updateGridListener(
        players,
        playerShips,
        computerShips,
        gameBoards,
        currentPlayer,
        currentShip
    );

    // Play game start music
    let audioLinkIcon = document.getElementById('audio-link')?.firstChild;

    if (audioLinkIcon && !audioLinkIcon.classList.contains('fa-volume-mute')) {
    let gameStart = document.querySelector('#game-start-music');

    if (!gameStart) {
        gameStart = new Audio('./assets/sounds/battleship-intro.mp3');
        gameStart.id = 'game-start-music';
        gameStart.volume = 0.3;
        document.body.appendChild(gameStart);
    }

    gameStart.play();
    }

    checkTurn(
        players,
        playerShips,
        computerShips,
        gameBoards,
        currentPlayer,
        currentShip
    );
}

// RUNGAME - need to look at parameters to pass from initPlacement to rungame

/**
 * The checkTurn function is called by confirmPlaceShip when final ship
 * has been placed. This handles changing game board event listeners to
 * start taking shots and passes back and forth to takeShot.
 * @function checkTurn
 * @param {object} players - the object containg player objects
 * @param {object} playerShips - object containing the player's ship objects
 * @param {object} computerShips - object containing the computer's ship objects
 * @param {object} gameBoards - object containing game board objects
 * @param {object} currentPlayer - the current player object in play
 * @param {object} currentShip - the current ship object in play
 */
function checkTurn(
    players,
    playerShips,
    computerShips,
    gameBoards,
    currentPlayer,
    currentShip
) {
    /* 
     * Get computer game board and elements and check if it is
     * player's or computer's turn.
     */

    let wholeGameboard = document.getElementById('gameboard');
    let computerCells = document.getElementsByClassName('computer-play-area');
    let computerBoard = document.getElementById('computer-gameboard');

    if (currentPlayer.name !== "PLAYER TWO") {
        console.log('Player One Turn!');

        /* 
         * Add class to gameboard to add row-reverse
         * to show P2 grid on top on mobile
         */
        wholeGameboard.classList.add('gameboard-reverse');

        /* 
         * Unlock computer game board when player needs to
         * take shot
         */
        enableClickListeners(computerBoard);

        // Remove no-placement class from computer area cells 
        for (let cell of computerCells) {
            if (cell.classList.contains('no-placement')) {
                cell.classList.remove('no-placement');
            }
        }

        // Only delay message update after first turn.
        if (players.player.hits.length === 0 && players.player.misses.length === 0)
            playerMessage(currentPlayer.name + " CLICK ANYWHERE ON PLAYER TWO'S GRID TO TAKE A SHOT ON THEM!");
        else {
            setTimeout(function () {
                playerMessage(currentPlayer.name + " CLICK ANYWHERE ON PLAYER TWO'S GRID TO TAKE A SHOT ON THEM!");
            }, 4500);
        }

    } else {
        console.log('Player Two Turn!');

        /* 
         * Remove class on gameboard to remove row-reverse
         * to show P1 grid on top on mobile
         */
        wholeGameboard.classList.remove('gameboard-reverse');

        /* 
         * Lock computer game board while computer taking
         * shot so player can't trigger takeShot
         */
        disableClickListeners(computerBoard);
        // Remove placement class from computer area cells
        // ship hit or miss should use no-shot class 
        for (let cell of computerCells) {
            if (!cell.classList.contains('no-placement')) {
                cell.classList.add('no-placement');
            }
        }

        // Add some delays to make sure player messages shown
        setTimeout(function () {
            playerMessage("PLAYER TWO IS TAKING THEIR SHOT ON YOU!");
        }, 4500);

        setTimeout(function () {

            /*
             * Call randomShot for computer shot but check not a shot
             * already taken.
             */
            let shotCoordInvalid = false;
            let randomShotCoord;

            do {
                    shotCoordInvalid = false;
                    let computerShots = players.computer.hits.concat(players.computer.misses);
                    randomShotCoord = randomCoord();
                    console.log(randomShotCoord);
                    console.log(computerShots);                    
                    // Loop through computer shots and make sure shot not already taken

                    for (let shot of computerShots) {
                        if (shot === randomShotCoord) {
                            shotCoordInvalid = true;
                            console.log('shotCoordInvalid...'+shotCoordInvalid);
                        break;
                        }
                    }
                } 
                while (shotCoordInvalid);

            currentPlayer.takeShot(
                players,
                playerShips,
                computerShips,
                gameBoards,
                currentPlayer,
                currentShip,
                '',
                randomShotCoord
            );
        }, 4500);
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

    // Add click event listeners to nav links and audio toggle
    document.getElementById('new-game-link').addEventListener('click', newGame);
    document.getElementById('new-game-button').addEventListener('click', newGame);
    document.getElementById('rules-link').addEventListener('click', openRulesModal);
    document.getElementById('audio-link').addEventListener('click', audioToggle);
    document.getElementById('audio-button').addEventListener('click', audioToggle);    

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

    /*
     * Check URL parameters. If this is a new game 
     * call initPlacement() to bypass intro modal.
     */
    checkURL();

});