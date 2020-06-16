const gameGrid = document.querySelector('#game-grid'),
    gameCells = document.querySelectorAll('.game-cell');




// TO-DO
// keep track of winner name
// check for a tie
// announce winner immediately
const gameBoard = (() => {
    const board = [];
    const update = (cell, i) => {
        // fix bug
        if (board.length !== 9 && !board.includes(undefined)) {
            if (gameLogic.checkWinner()) console.log('You won!')
            else if (cell.innerHTML == '') {
                cell.innerHTML = gameLogic.makeTurn();
                board[i] = cell.innerHTML;
            }
        } else {
            console.log(`It's a tie`);
        }
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
        let position;
        if (gameBoard.board[4] !== undefined) {
            position = gameBoard.board[4];
            if (gameBoard.board[0] === position && gameBoard.board[8] === position || 
                gameBoard.board[2] === position && gameBoard.board[6] === position ||
                gameBoard.board[1] === position && gameBoard.board[7] === position ||
                gameBoard.board[3] === position && gameBoard.board[5] === position) return true;
        }
        if (gameBoard.board[0] !== undefined) {
            position = gameBoard.board[0];
            if (gameBoard.board[1] === position && gameBoard.board[2] === position ||
                gameBoard.board[3] === position && gameBoard.board[6] === position) return true;
        }
        if (gameBoard.board[8] !== undefined) {
            position = gameBoard.board[8];
            if (gameBoard.board[7] === position && gameBoard.board[6] === position ||
                gameBoard.board[5] === position && gameBoard.board[2] === position) return true;
        }
        return false;
    }
    
    return {makeTurn, checkWinner}
})();


gameCells.forEach((cell, i) => {
    cell.addEventListener('click', e => {
        gameBoard.update(cell, i);
    });
});




