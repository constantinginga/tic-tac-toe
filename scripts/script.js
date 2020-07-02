// TO-DO
// add timer after bot's move
// remove cell parameter from update function?
// handle situation when there are two bots and when the bot has the first move (inside _game function)


// Implement bot feature
    // Get the computer to make a random legal move
    // Implement minimax algorithm
    // change winner message when bot wins
    // clean up code and add comments


const playerFactory = (name, mark, isActive, isBot) => {
    return {name, mark, isActive, isBot};
}



const gameBoard = (() => {
    
    const board = [];
    let current;
    board.length = 9;

    // fill board array and html divs
    const update = (cell, i) => {
        if (gameLogic.gameState && board[i] === undefined) {

            // if the game contains a bot
            if (Object.keys(gameLogic.aiMode).length !== 0) {
                // make player's move
                gameLogic.makeTurn(i, gameLogic.aiMode.player);
                // if player hasn't won, make bot move
                if (!gameLogic.checkPattern())
                gameLogic.makeTurn(gameLogic.bestSpot(), gameLogic.aiMode.bot);
                // check for pattern again after bot's move
                gameLogic.checkWinner(gameLogic.checkPattern());
            
            // if the game contains two players
            } else {
                current = gameLogic.setActivePlayer();
                gameLogic.makeTurn(i, current);
                gameLogic.checkWinner(gameLogic.checkPattern());
            }
        }
    }

    const reset = () => {
        gameLogic.gameState = true;
        // clear board array
        for (let i = 0; i < board.length; i++) {
            board[i] = undefined;
        }
        // if the game has two players, set active player to 'X'
        if (Object.keys(gameLogic.aiMode).length === 0) gameLogic.setActivePlayer();
        // if the bot is 'X', make first turn
        else if (gameLogic.aiMode.bot.mark === 'X') gameLogic.makeTurn(gameLogic.bestSpot(), gameLogic.aiMode.bot);
    }

    return {board, update, reset};
})();



const gameLogic = (() => {

    const _playBtn = document.querySelector('#play'),
        _gameCells = document.querySelectorAll('.game-cell'),
        board = gameBoard.board;
    let _playerOne = playerFactory('', 'X', true),
        _playerTwo = playerFactory('', 'O', false),
        gameState, aiMode = {};

    const _createPlayers = () => {
        const playerOneInput = document.querySelector('#player1'),
            playerTwoInput = document.querySelector('#player2');
            // set default name
            _playerOne.name = playerOneInput.placeholder;
            _playerTwo.name = playerTwoInput.placeholder;
            // if user provided another name, change it
            if (playerOneInput.value) _playerOne.name = playerOneInput.value;
            if (playerTwoInput.value) _playerTwo.name = playerTwoInput.value;
            (playerOneInput.classList.contains('bot')) ? _playerOne.isBot = true : _playerOne.isBot = false;
            (playerTwoInput.classList.contains('bot')) ? _playerTwo.isBot = true : _playerTwo.isBot = false;
    }

    const setActivePlayer = () => {
            if (_playerOne.isActive) {
                _playerOne.isActive = false;
                _playerTwo.isActive = true;
                return _playerOne;
            } else if (_playerTwo.isActive) {
                _playerTwo.isActive = false;
                _playerOne.isActive = true;
                return _playerTwo;
            }
        }

    const makeTurn = (i, player) => {
        board[i] = player.mark;
        _gameCells[i].innerHTML = `<p class="fd" style="color: ${displayController.setColor(board[i])}">${board[i]}</p>`;
    }

    const minimax = (board) => {
        return 1;
    }
    
    const bestSpot = () => {
        let spot;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === undefined) {
                spot = i;
                break;
            }
        }
        return spot;
    }

    // check for the right pattern
    const _equalsThree = (a, b, c, winner) => {
        if (a === b && b === c && !!a) {
            winner.mark = a;
            return true;
        }
    }

    const checkPattern = () => {

        let winner = {};


        // determine correct pattern and line orientation
        if (_equalsThree(board[4], board[0], board[8], winner)) 
            winner.orientation = `diagonal right`;
        else if (_equalsThree(board[4], board[2], board[6], winner))
            winner.orientation = `diagonal left`;
        else if (_equalsThree(board[4], board[3], board[5], winner))
            winner.orientation = `straight 180deg middle`;
        else if (_equalsThree(board[4], board[1], board[7], winner))
            winner.orientation = `straight 90deg middle`;

        if (_equalsThree(board[0], board[1], board[2], winner))
            winner.orientation = `straight 360deg top`;
        else if (_equalsThree(board[0], board[3], board[6], winner))
            winner.orientation = `straight -90deg top`;

        if (_equalsThree(board[8], board[6], board[7], winner))
            winner.orientation = `straight 180deg bottom`;
        else if (_equalsThree(board[8], board[2], board[5], winner))
            winner.orientation = `straight 90deg bottom`;


        // if there's a winner, set winner name and return winner object
        if (Object.keys(winner).length !== 0) {
            if (winner.mark === _playerOne.mark) winner.name = _playerOne.name
            else if (winner.mark === _playerTwo.mark) winner.name = _playerTwo.name;
            return winner;
            // return false by default
        } else return false;
    }

    const checkWinner = (winner) => {
        // check for a winner
        if (winner) {
            displayController.announceWinner(winner);
            gameLogic.gameState = false;
        // check for a tie
        } else if (board.length === 9 && !board.includes(undefined)) {
            displayController.announceWinner('');
            gameLogic.gameState = false;
        }
    }

    const _game = () => {
        _createPlayers();
        displayController.showBoard();
        gameLogic.gameState = true;

        if (_playerOne.isBot) {
            aiMode.bot =  _playerOne;
            aiMode.player = _playerTwo;
            gameLogic.makeTurn(gameLogic.bestSpot(), gameLogic.aiMode.bot);
        } else if (_playerTwo.isBot) {
            aiMode.bot =  _playerTwo;
            aiMode.player = _playerOne;
        } else if (_playerOne.isBot && _playerTwo.isBot) {
            // play game between two bots
        }
        
        // if there's at least one player, enable board placing
        if (!_playerOne.isBot || !_playerTwo.isBot) {
            _gameCells.forEach((cell, i) => cell.addEventListener('click', () => gameBoard.update(cell, i)));
        }
    }

    const beginGame = () => {
        _playBtn.addEventListener('click', _game);
    }
    
    return {gameState, aiMode, setActivePlayer, makeTurn, bestSpot, checkPattern, checkWinner, beginGame};
})();



const displayController = (() => {

    const _winnerLine = document.querySelector('#winner-line'),
        _winnerPara = document.querySelector('#winner'),
        _againBtn = document.querySelector('#again'),
        _gameCells = document.querySelectorAll('.game-cell');
    let _title =  document.querySelector('#title');

    function _toggleAnim(toggle, animation, element) {
        // remove/add animation to elements
        const anim = ['animate__animated', `animate__${animation}`];
        for (i = 2; i < arguments.length; i++) {
            if (toggle === 'add') arguments[i].classList.add(anim[0], anim[1]);
            else arguments[i].classList.remove(anim[0], anim[1]);
        }
    }

    function _hideWinner() {
        _againBtn.style.visibility = 'hidden';
        _winnerPara.style.visibility = 'hidden';
        _winnerPara.innerHTML = '&nbsp;';
    }

    // show winner and stop game
    const announceWinner = (winner) => {
        _winnerPara.style.visibility = 'visible';
        _againBtn.style.visibility = 'visible';
        if (typeof winner === 'string') {
            _winnerPara.innerHTML = `You tied.`;
        } else {
            _winnerPara.innerHTML = `Congrats <span style="color: ${setColor(winner.mark)}">${winner.name}</span>, you won!`;
            displayController.drawLine(winner);
        }
        _toggleAnim('remove', 'fadeOut', _winnerPara, _againBtn, _winnerLine);
        _againBtn.removeEventListener('animationend', _hideWinner);
        _toggleAnim('add', 'fadeIn', _winnerPara, _againBtn, _winnerLine);
    }

    // switch between player and bot
    const switchPlayer = () => {

        const leftArrows = document.querySelectorAll('.left'),
            rightArrows = document.querySelectorAll('.right'),
            imgs = document.querySelectorAll('.imgs'),
            player = document.querySelectorAll('.player'),
            botImg = document.querySelectorAll('.bot-img'),
            playerImg = document.querySelectorAll('.player-img'),
            playerNames = document.querySelectorAll('.player-name');

            // create text input for bot
            let botNames = [];
            for (let i = 0; i < playerNames.length; i++) {
                botNames[i] = playerNames[i].cloneNode();
                botNames[i].value = `Unstoppable AI`;
                botNames[i].classList.add('bot');
                botNames[i].style.borderColor = 'transparent';
                botNames[i].disabled = true;
                // add animations to all elements
                _toggleAnim('add', 'fadeIn', botNames[i], playerNames[i]);
                _toggleAnim('add', 'slideInRight', botImg[i]);
            }

        // swap between bot img/input and player img/input
        const swapImgAndInput = (img, i) => {
            if (img === 'bot') {
                playerImg[i].style.display = 'none';
                botImg[i].style.display = 'block';
                playerNames[i].replaceWith(botNames[i]);
            } else if (img === 'user') {
                _toggleAnim('add', 'slideInLeft', playerImg[i]);
                playerImg[i].style.display = 'block';
                botImg[i].style.display = 'none';
                botNames[i].replaceWith(playerNames[i]);
            }
        }
        
        // hide clicked arrow, show the other one and show the correct img/input
        const swapArrows = (current, i, other, img) => {
            current.addEventListener('click', e => {
                current.style.visibility = 'hidden';
                other[i].style.visibility = 'visible';
                _toggleAnim('add', 'fadeIn', other[i]);
                _toggleAnim('remove', 'fadeIn', current);
                swapImgAndInput(img, i);
            });
        }

        // add event listener to all arrows
        rightArrows.forEach((arrow, i) => swapArrows(arrow, i, leftArrows, 'bot'));
        leftArrows.forEach((arrow, i) => swapArrows(arrow, i, rightArrows, 'user'));
    }

    const showBoard = () => {
        // show board, hide form and enable 'play again' functionality
        const gameContainer = document.querySelector('#game-container');
        document.querySelector('#select-container').style.display = 'none';
        gameContainer.style.display = 'block';
        _toggleAnim('add', 'fadeIn', gameContainer);
        _againBtn.addEventListener('click', displayController.playAgain);
    }

    // return the correct color
    const setColor = (mark) => {
        return (mark === 'X') ? `var(--darkred)` : `var(--green)`;
    }

    const drawLine = (winner) => {
        // set correct line orientation and color
        let orientation = winner.orientation.split(' '), color = setColor(winner.mark),
         direction = orientation[1], deg = `86.5%`;
        if (orientation.includes('diagonal')) direction = `to top ${orientation[1]}`;
        if (orientation.includes('diagonal') || orientation.includes('middle')) deg = `50%`;

        // draw the line
        _winnerLine.style.background = `linear-gradient(${direction},
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0) calc(${deg} - .2rem),
            ${color} 50%,
            rgba(0,0,0,0) calc(${deg} + .2rem),
            rgba(0,0,0,0) 100%)`;
    }

    // play another round
    const playAgain = (e) => {
        // fade out animation to button and winner text
        _toggleAnim('remove', 'fadeIn', _winnerPara, _againBtn);
        _toggleAnim('add', 'fadeOut', _againBtn, _winnerPara, _winnerLine);
        _againBtn.addEventListener('animationend', _hideWinner);
        _winnerLine.style.background = '';
        _gameCells.forEach(cell => {
            // select mark
            let cellContent = cell.childNodes[0];
            // if there's a mark in that cell, add animation, then clear
            if (!!cellContent) {
                cellContent.classList.remove('fd');
                _toggleAnim('add', 'fadeOut', cellContent);
                cellContent.addEventListener('animationend', () => cell.innerHTML = '');
                // if it's empty, just clear it
            } else cell.innerHTML = '';
        });
        gameBoard.reset();
    }

    // choose between provided colors randomly
    const _chooseColor = () => {
        switch (Math.floor(Math.random() * Math.floor(3))) {
            case 0:
                return 'var(--darkred)';
            case 1:
                return 'var(--green)';
            case 2:
                return 'var(--darkblue)';
        }
    }

    // change color of each letter
    const randomizeTitleColor = () => {
        let titleArray = _title.innerHTML.split("");
        for (let i = 0; i < titleArray.length; i++) {
            titleArray[i] = `<span style="color: ${_chooseColor()}">${titleArray[i]}</span>`;
        }
        _title.innerHTML = titleArray.join("");
    }

    return {announceWinner, switchPlayer, showBoard, setColor, drawLine, playAgain, randomizeTitleColor};
})();



displayController.randomizeTitleColor();
displayController.switchPlayer();
gameLogic.beginGame();
