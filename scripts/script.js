const gameContainer = document.querySelector('#game-container'), 
    gameGrid = document.querySelector('#game-grid'),
    gameCells = document.querySelectorAll('.game-cell'),
    winnerPara = document.querySelector('#winner'),
    againBtn = document.querySelector('#again');

let gameState = true;




// TO-DO
// first show form, then after hitting play button, show board
// autofocus on player name input
// add transition animations
// make it responsive (both form and board)
// change all instances of private variables with underscore
// set gamestate to true when user clicks play (reset the temp value of true above)


const gameBoard = (() => {
    
    const board = [];

    const update = (cell, i) => {
        // fill board array and html divs
        if (cell.innerHTML === '') {
            board[i] = gameLogic.makeTurn();
            cell.innerHTML = `<p style="color: ${displayController.setColor(board[i])}">${board[i]}</p>`
        }
        let _winner = gameLogic.checkWinner();
        // if there's a _winner, declare the _winner
        if (_winner) {
            displayController.announceWinner(_winner);
            displayController.drawLine(_winner);
        }
        // if the board is full, declared tie
        else if (board.length === 9 && !board.includes(undefined)) displayController.announceWinner('');
    }

    // clear board array and html divs
    const reset = () => {
        board.length = 0;
        gameCells.forEach(cell => cell.innerHTML = '');
        gameState = true;
    }

    return {board, update, reset};
})();


const playerFactory = (name, mark, isActive) => {
    return {name, mark, isActive};
}

let playerOne = playerFactory('jeff', 'X', true);
let playerTwo = playerFactory('john', 'O', false);


const gameLogic = (() => {

    const makeTurn = () => {
        if (playerOne.isActive) {
            playerOne.isActive = false;
            playerTwo.isActive = true;
            return playerOne.mark;
        } else if (playerTwo.isActive) {
            playerTwo.isActive = false;
            playerOne.isActive = true;
            return playerTwo.mark;
        }
    }

    const checkWinner = () => {

        let _position, winner = {};
        // check for the right pattern
        if (!!gameBoard.board[4]) {
            _position = gameBoard.board[4];
            if (gameBoard.board[0] === _position && gameBoard.board[8] === _position) {
                winner.mark = _position;
                winner.orientation = `diagonal right`;
            } else if (gameBoard.board[2] === _position && gameBoard.board[6] === _position) {
                winner.mark = _position;
                winner.orientation = `diagonal left`;
            } else if (gameBoard.board[3] === _position && gameBoard.board[5] === _position) {
                winner.mark = _position;
                winner.orientation = `straight 180deg middle`;
            } else if (gameBoard.board[1] === _position && gameBoard.board[7] === _position) {
                winner.mark = _position;
                winner.orientation = `straight 90deg middle`;
            }
        }

        if (!!gameBoard.board[0]) {
            _position = gameBoard.board[0];
            if (gameBoard.board[1] === _position && gameBoard.board[2] === _position) {
                winner.mark = _position;
                winner.orientation = `straight 360deg top`;
            } else if (gameBoard.board[3] === _position && gameBoard.board[6] === _position) {
                winner.mark = _position;
                winner.orientation = `straight -90deg top`
            }
        }

        if (!!gameBoard.board[8]) {
            _position = gameBoard.board[8];
            if (gameBoard.board[7] === _position && gameBoard.board[6] === _position) {
                winner.mark = _position;
                winner.orientation = `straight 180deg bottom`;
            } else if (gameBoard.board[5] === _position && gameBoard.board[2] === _position) {
                winner.mark = _position;
                winner.orientation = `straight 90deg bottom`;
            }
        }

        // if there's a winner, set winner name and return winner object
        if (Object.keys(winner).length !== 0) {
            if (winner.mark === playerOne.mark) winner.name = playerOne.name
            else if (winner.mark === playerTwo.mark) winner.name = playerTwo.name;
            return winner;
            // return false by default
        } else return false;
    }
    
    return {makeTurn, checkWinner};
})();

const displayController = (() => {

    // show winner and stop game
    const announceWinner = (winner) => {
        gameState = false;
        if (typeof winner === 'string') winnerPara.innerHTML = `You tied.`
        else winnerPara.innerHTML = `Congrats <span style="color: ${setColor(winner.mark)}">${winner.name}</span>, you won!`;
        againBtn.style.visibility = 'visible';
    }

    // switch between player and bot
    const switchPlayer = () => {

        const leftArrows = document.querySelectorAll('.left'),
            rightArrows = document.querySelectorAll('.right'),
            botImg = document.querySelectorAll('.bot-img'),
            playerImg = document.querySelectorAll('.player-img');

        // swap between bot img and user img
        const _swapImgs = (img, i) => {
            if (img === 'bot') {
                playerImg[i].style.display = 'none';
                botImg[i].style.display = 'block';
            } else if (img === 'user') {
                playerImg[i].style.display = 'block';
                botImg[i].style.display = 'none';
            }
        }
        
        // hide clicked arrow, show the other one and show the correct img
        const _swapArrows = (current, i, other, img) => {
            current.addEventListener('click', e => {
                current.style.visibility = 'hidden';
                other[i].style.visibility = 'visible';
                _swapImgs(img, i);
            });
        }

        // add event listener to all arrows
        rightArrows.forEach((arrow, i) => _swapArrows(arrow, i, leftArrows, 'bot'));
        leftArrows.forEach((arrow, i) => _swapArrows(arrow, i, rightArrows, 'user'));
    }

    const toggleBoard = () => {
        // toggle between boards and set game status
    }

    const setColor = (mark) => {
        return (mark === 'X') ? `var(--darkred)` : `var(--green)`;
    }

    const drawLine = (winner) => {
        // set correct line orientation and color
        let orientation = winner.orientation.split(' '), color = setColor(winner.mark),
         direction = orientation[1], deg = `83.5%`;
        if (orientation.includes('diagonal')) direction = `to top ${orientation[1]}`;
        if (orientation.includes('diagonal') || orientation.includes('middle')) deg = `50%`;

        // draw the line
        gameGrid.style.background = `linear-gradient(${direction},
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0) calc(${deg} - .2rem),
            ${color} 50%,
            rgba(0,0,0,0) calc(${deg} + .2rem),
            rgba(0,0,0,0) 100%)`;
    }

    // play another round
    const playAgain = (e) => {
        againBtn.style.visibility = 'hidden';
        winnerPara.innerHTML = '&nbsp;';
        gameGrid.style.background = '';
        gameBoard.reset();
    }

    return {announceWinner, setColor, playAgain, drawLine, switchPlayer};
})();


gameCells.forEach((cell, i) => {
    cell.addEventListener('click', e => {
        if (gameState) gameBoard.update(cell, i);
    });
});

againBtn.addEventListener('click', displayController.playAgain);
displayController.switchPlayer();




