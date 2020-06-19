const gameContainer = document.querySelector('#game-container'), 
    gameGrid = document.querySelector('#game-grid'),
    gameCells = document.querySelectorAll('.game-cell'),
    winnerPara = document.querySelector('#winner'),
    againBtn = document.querySelector('#again');

let gameState = true;




// TO-DO
// change checkWinner algorithm to be based on line orientation (add orientation property to winner object)
    // pass winner object into function that draws line (add line with css)
// first show form, then after hitting play button, show board
// two forms side by side: Name, mark;
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
            cell.innerHTML = displayController.setColor(board[i]);
        }
        let _winner = gameLogic.checkWinner();
        // if there's a _winner, declare the _winner
        if (_winner) displayController.announceWinner(_winner)
        // if the board is full, declared tie
        else if (board.length === 9 && !board.includes(undefined)) displayController.announceWinner(`You tied.`);
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
        let _position, _winner = {};
        // check for the right pattern
        if (gameBoard.board[4] !== undefined) {
            _position = gameBoard.board[4];
            if (gameBoard.board[0] === _position && gameBoard.board[8] === _position || 
                gameBoard.board[2] === _position && gameBoard.board[6] === _position ||
                gameBoard.board[1] === _position && gameBoard.board[7] === _position ||
                gameBoard.board[3] === _position && gameBoard.board[5] === _position) _winner.mark = _position;
        }
        if (gameBoard.board[0] !== undefined) {
            _position = gameBoard.board[0];
            if (gameBoard.board[1] === _position && gameBoard.board[2] === _position ||
                gameBoard.board[3] === _position && gameBoard.board[6] === _position) _winner.mark = _position;
        }
        if (gameBoard.board[8] !== undefined) {
            _position = gameBoard.board[8];
            if (gameBoard.board[7] === _position && gameBoard.board[6] === _position ||
                gameBoard.board[5] === _position && gameBoard.board[2] === _position) _winner.mark = _position;
        }

        // return winning player's name
        if (_winner.mark === playerOne.mark) return playerOne.name
        else if (_winner.mark === playerTwo.mark) return playerTwo.name;
        // return false by default
        return false;
    }
    
    return {makeTurn, checkWinner};
})();

const displayController = (() => {

    // show _winner and stop game
    const announceWinner = (_winner) => {
        gameState = false;
        if (_winner.includes('tie')) winnerPara.innerHTML = _winner
        else winnerPara.innerHTML = `Congrats <span style="color: var(--green)">${_winner}</span>, you won!`;
        againBtn.style.visibility = 'visible';
    }

    const toggleBoard = () => {
        // toggle between boards and set game status
    }

    const setColor = (mark) => {
        return (mark === 'X') ? `<p style="color: var(--darkred)">${mark}</p>`
        : `<p style="color: var(--darkblue)">${mark}</p>`;
    }

    const playAgain = (e) => {
        againBtn.style.visibility = 'hidden';
        winnerPara.innerHTML = '&nbsp;';
        gameBoard.reset();
    }

    return {announceWinner, setColor, playAgain};
})();


gameCells.forEach((cell, i) => {
    cell.addEventListener('click', e => {
        if (gameState) gameBoard.update(cell, i);
    });
});

againBtn.addEventListener('click', displayController.playAgain);




