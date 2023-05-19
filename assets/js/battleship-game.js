function gameBoard(playerName) {
    let playerGameboard = document.getElementById('player-gameboard');
    console.log(playerGameboard);
    let computerGameboard = document.getElementById('computer-gameboard');
    let gridLetters = [' ', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    let playGrid = `<div id="gameboard-label">${playerName}</div>`;
    for (let i = 0; i <= 10; i++) {
        if (i == 0) {
            for (let j = 0; j <= 10; j++) {
                playGrid += `<div id='iR${j}' class="indexRow">${j == 0 ? ' ' : j}</div>`;
            }
        } else {
            for (let j = 0; j <= 10; j++) {
                if (j == 0) {
                    playGrid += `<div id='iC ${gridLetters[j + i].trim()}' class="indexColumn">${gridLetters[j + i].trim()}</div>`;
                } else {
                    playGrid += `<div id='p${j + (i - 1) * 10}' class="playableArea shipPlacement">${j + (i - 1) * 10}</div>`;
                }
            }
        }
    }

    playerGameboard.innerHTML = playGrid;
    computerGameboard.innerHTML = playGrid;
}

document.addEventListener('DOMContentLoaded', gameBoard("Player 1"));

let testDiv = document.getElementById('p52');
let gridLocation = testDiv.className;
testDiv.innerHTML += "<img src='./assets/images/ships/battleship.png' class='ship'>";
testDiv.innerHTML += `<img src='./assets/images/effects/explosion.gif' id='explode-${gridLocation}' class='explosion'>`;
setTimeout(function () {
    document.querySelector('[id^="explode-"]').remove();
    testDiv.innerHTML += "<img src='./assets/images/effects/fire.gif' class='fire'>";
}, 3700);
