// TO-DO
// customize welcome text (add scribble or change font)
// add transition animations (between player and bot etc.)

const playerFactory = (name, mark, isActive) => {
    return {name, mark, isActive};
}



const gameBoard = (() => {
    
    const board = [];

    const update = (cell, i) => {
        // fill board array and html divs
        if (gameLogic.gameState) {
            if (cell.innerHTML === '') {
                board[i] = gameLogic.makeTurn();
                cell.innerHTML = `<p style="color: ${displayController.setColor(board[i])}">${board[i]}</p>`
            }
            let winner = gameLogic.checkWinner();
            // if there's a _winner, declare the _winner
            if (winner) {
                displayController.announceWinner(winner);
                displayController.drawLine(winner);
            }
            // if the board is full, declared tie
            else if (board.length === 9 && !board.includes(undefined)) displayController.announceWinner('');
        }
    }

    // clear board array
    const reset = () => {
        board.length = 0;
        gameLogic.gameState = true;
    }

    return {board, update, reset};
})();



const gameLogic = (() => {

    const _playBtn = document.querySelector('#play');
    let _playerOne = playerFactory('', 'X', true),
        _playerTwo = playerFactory('', 'O', false),
        gameState;

    const createPlayers = () => {
        const playerOneInput = document.querySelector('#player1'),
            playerTwoInput = document.querySelector('#player2');
            // set default name
            _playerOne.name = playerOneInput.placeholder;
            _playerTwo.name = playerTwoInput.placeholder;
            // if user provided another name, change it
            if (playerOneInput.value) _playerOne.name = playerOneInput.value;
            if (playerTwoInput.value) _playerTwo.name = playerTwoInput.value;
    }

    const makeTurn = () => {
        if (_playerOne.isActive) {
            _playerOne.isActive = false;
            _playerTwo.isActive = true;
            return _playerOne.mark;
        } else if (_playerTwo.isActive) {
            _playerTwo.isActive = false;
            _playerOne.isActive = true;
            return _playerTwo.mark;
        }
    }

    const checkWinner = () => {

        let position, winner = {};
        // check for the right pattern
        if (!!gameBoard.board[4]) {
            position = gameBoard.board[4];
            if (gameBoard.board[0] === position && gameBoard.board[8] === position) {
                winner.mark = position;
                winner.orientation = `diagonal right`;
            } else if (gameBoard.board[2] === position && gameBoard.board[6] === position) {
                winner.mark = position;
                winner.orientation = `diagonal left`;
            } else if (gameBoard.board[3] === position && gameBoard.board[5] === position) {
                winner.mark = position;
                winner.orientation = `straight 180deg middle`;
            } else if (gameBoard.board[1] === position && gameBoard.board[7] === position) {
                winner.mark = position;
                winner.orientation = `straight 90deg middle`;
            }
        }

        if (!!gameBoard.board[0]) {
            position = gameBoard.board[0];
            if (gameBoard.board[1] === position && gameBoard.board[2] === position) {
                winner.mark = position;
                winner.orientation = `straight 360deg top`;
            } else if (gameBoard.board[3] === position && gameBoard.board[6] === position) {
                winner.mark = position;
                winner.orientation = `straight -90deg top`
            }
        }

        if (!!gameBoard.board[8]) {
            position = gameBoard.board[8];
            if (gameBoard.board[7] === position && gameBoard.board[6] === position) {
                winner.mark = position;
                winner.orientation = `straight 180deg bottom`;
            } else if (gameBoard.board[5] === position && gameBoard.board[2] === position) {
                winner.mark = position;
                winner.orientation = `straight 90deg bottom`;
            }
        }

        // if there's a winner, set winner name and return winner object
        if (Object.keys(winner).length !== 0) {
            if (winner.mark === _playerOne.mark) winner.name = _playerOne.name
            else if (winner.mark === _playerTwo.mark) winner.name = _playerTwo.name;
            return winner;
            // return false by default
        } else return false;
    }

    const beginGame = () => {
        _playBtn.addEventListener('click', e => {
            gameLogic.gameState = true;
            createPlayers();
            displayController.showBoard();
        });
    }
    
    return {gameState, createPlayers, makeTurn, checkWinner, beginGame};
})();



const displayController = (() => {

    const _gameGrid = document.querySelector('#game-grid'),
        _winnerPara = document.querySelector('#winner'),
        _againBtn = document.querySelector('#again'),
        _gameCells = document.querySelectorAll('.game-cell');

    // show winner and stop game
    const announceWinner = (winner) => {
        gameLogic.gameState = false;
        if (typeof winner === 'string') _winnerPara.innerHTML = `You tied.`
        else _winnerPara.innerHTML = `Congrats <span style="color: ${setColor(winner.mark)}">${winner.name}</span>, you won!`;
        _againBtn.style.visibility = 'visible';
    }

    // switch between player and bot
    const switchPlayer = () => {

        const leftArrows = document.querySelectorAll('.left'),
            rightArrows = document.querySelectorAll('.right'),
            botImg = document.querySelectorAll('.bot-img'),
            playerImg = document.querySelectorAll('.player-img');

        // swap between bot img and user img
        const swapImgs = (img, i) => {
            if (img === 'bot') {
                playerImg[i].style.display = 'none';
                botImg[i].style.display = 'block';
            } else if (img === 'user') {
                playerImg[i].style.display = 'block';
                botImg[i].style.display = 'none';
            }
        }
        
        // hide clicked arrow, show the other one and show the correct img
        const swapArrows = (current, i, other, img) => {
            current.addEventListener('click', e => {
                current.style.visibility = 'hidden';
                other[i].style.visibility = 'visible';
                swapImgs(img, i);
            });
        }

        // add event listener to all arrows
        rightArrows.forEach((arrow, i) => swapArrows(arrow, i, leftArrows, 'bot'));
        leftArrows.forEach((arrow, i) => swapArrows(arrow, i, rightArrows, 'user'));
    }

    const showBoard = () => {
        // show board, hide form and enable 'play again' functionality
        document.querySelector('#select-container').style.display = 'none';
        document.querySelector('#game-container').style.display = 'block';
        _againBtn.addEventListener('click', displayController.playAgain);
        _gameCells.forEach((cell, i) => cell.addEventListener('click', e => gameBoard.update(cell, i)));
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
        _gameGrid.style.background = `linear-gradient(${direction},
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0) calc(${deg} - .2rem),
            ${color} 50%,
            rgba(0,0,0,0) calc(${deg} + .2rem),
            rgba(0,0,0,0) 100%)`;
    }

    // play another round
    const playAgain = (e) => {
        _againBtn.style.visibility = 'hidden';
        _winnerPara.innerHTML = '&nbsp;';
        _gameGrid.style.background = '';
        _gameCells.forEach(cell => cell.innerHTML = '');
        gameBoard.reset();
    }

    return {announceWinner, switchPlayer, showBoard, setColor, drawLine, playAgain};
})();


displayController.switchPlayer();
gameLogic.beginGame();
