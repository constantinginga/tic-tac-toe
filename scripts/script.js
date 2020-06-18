const gameGrid = document.querySelector('#game-grid'),
    gameCells = document.querySelectorAll('.game-cell');

let gameState = true;




// TO-DO
// X red, O blue (both dark)
// choose font (for marks and for text different)
// first show form, then after hitting play button, show board
// two forms side by side: Name, mark;
// when game finished, announce winner and show 'play again' button
// when click 'play again', reset board with animation and hide button and winner announcement
// add transition animations
// make it responsive (both form and board)
// make background math paper
// change all instances of private variables with underscore
// set gamestate to true when user clicks play (reset the temp value of true above)


const gameBoard = (() => {
    const board = [];
    const update = (cell, i) => {
        // fill board array and html divs
        if (cell.innerHTML === '') {
            board[i] = gameLogic.makeTurn();
            cell.innerHTML = `<p>${board[i]}</p>`
        }
        let winner = gameLogic.checkWinner();
        // if there's a winner, declare the winner
        if (winner) displayController.announceWinner(winner)
        // if the board is full, declared tie
        else if (board.length === 9 && !board.includes(undefined)) displayController.announceWinner(`You tied.`);
    }
    return {board, update};
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
        let position, winner;
        // check for the right pattern
        if (gameBoard.board[4] !== undefined) {
            position = gameBoard.board[4];
            if (gameBoard.board[0] === position && gameBoard.board[8] === position || 
                gameBoard.board[2] === position && gameBoard.board[6] === position ||
                gameBoard.board[1] === position && gameBoard.board[7] === position ||
                gameBoard.board[3] === position && gameBoard.board[5] === position) winner = position;
        }
        if (gameBoard.board[0] !== undefined) {
            position = gameBoard.board[0];
            if (gameBoard.board[1] === position && gameBoard.board[2] === position ||
                gameBoard.board[3] === position && gameBoard.board[6] === position) winner = position;
        }
        if (gameBoard.board[8] !== undefined) {
            position = gameBoard.board[8];
            if (gameBoard.board[7] === position && gameBoard.board[6] === position ||
                gameBoard.board[5] === position && gameBoard.board[2] === position) winner = position;
        }

        // return winning player's name
        if (winner === playerOne.mark) return playerOne.name
        else if (winner === playerTwo.mark) return playerTwo.name;
        // return false by default
        return false;
    }
    
    return {makeTurn, checkWinner};
})();

const displayController = (() => {

    // show winner and stop game
    const announceWinner = (winner) => {
        gameState = false;
        const winnerPara = document.querySelector('#winner');
        winnerPara.innerHTML = `Congrats ${winner}, you won!`;
        console.log(winner);
    }

    const toggleBoard = () => {
        // toggle between boards and set game status
    }

    return {announceWinner};
})();


gameCells.forEach((cell, i) => {
    cell.addEventListener('click', e => {
        if (gameState) gameBoard.update(cell, i);
    });
});






