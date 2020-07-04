const playerFactory = (name, mark, isActive, isBot) => {
    return {name, mark, isActive, isBot};
}



const gameBoard = (() => {
    
    // initialize board
    const board = [];
    board.length = 9;

    const update = (i) => {
        // if game is running and the spot is available
        if (gameLogic.gameState && board[i] === undefined) {

            // if the game contains a bot
            if (Object.keys(gameLogic.aiMode).length !== 0) {
                // make player's move
                gameLogic.makeTurn(i, gameLogic.aiMode.player);
                // if player hasn't won, make bot move
                if (!gameLogic.checkWinner(gameLogic.checkPattern())) {
                    setTimeout(() => gameLogic.makeTurn(gameLogic.bestSpot(), gameLogic.aiMode.bot), 300);
                }
                // check for pattern again after bot's move
                setTimeout(() => gameLogic.checkWinner(gameLogic.checkPattern()), 300);
            
            // if the game contains two players
            } else {
                let current = gameLogic.setActivePlayer();
                gameLogic.makeTurn(i, current);
                gameLogic.checkWinner(gameLogic.checkPattern());
            }
        }
    }

    // reset game
    const reset = () => {
        gameLogic.gameState = true;
        // clear board array
        for (let i = 0; i < board.length; i++) {
            board[i] = undefined;
        }

        // if the bot is 'X', make first turn
        if (Object.keys(gameLogic.aiMode).length === 2 && gameLogic.aiMode.bot.mark === 'X')
            setTimeout(() => gameLogic.makeTurn(gameLogic.bestSpot(), gameLogic.aiMode.bot), 300);
        // if the game contains two bots
        else if (Object.keys(gameLogic.aiMode).length === 1) gameLogic.botGame();
    }

    return {board, update, reset};
})();



const gameLogic = (() => {

    const _playBtn = document.querySelector('#play'),
        _gameCells = document.querySelectorAll('.game-cell'),
        board = gameBoard.board;

    let _playerOne = playerFactory('', 'X', true),
        _playerTwo = playerFactory('', 'O', false),
        gameState, aiMode = {}, _eval = {'X': 10, 'O': -10, 'tie': 0},
        _operators = {'>': (a, b) => a > b, '<': (a, b) => a < b};

    const _createPlayers = () => {
        const playerOneInput = document.querySelector('#player1'),
            playerTwoInput = document.querySelector('#player2');
            // set default name
            _playerOne.name = playerOneInput.placeholder;
            _playerTwo.name = playerTwoInput.placeholder;
            // if user provided a name, assign it
            if (playerOneInput.value) _playerOne.name = playerOneInput.value;
            if (playerTwoInput.value) _playerTwo.name = playerTwoInput.value;
            // check if a player/bot has been selected
            (playerOneInput.classList.contains('bot')) ? _playerOne.isBot = true : _playerOne.isBot = false;
            (playerTwoInput.classList.contains('bot')) ? _playerTwo.isBot = true : _playerTwo.isBot = false;
    }

    // switch between players
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

    // fill board array and html divs
    const makeTurn = (i, player) => {
        board[i] = player.mark;
        _gameCells[i].innerHTML = `<p class="fd" style="color: ${displayController.setColor(board[i])}">${board[i]}</p>`;
    }

    const _minimax = (board, depth, isMaximizing) => {

        // check for winner and return appropriate score (terminal node)
        let winner = checkPattern();
        if (winner) return _eval[winner.mark]
        else if (!board.includes(undefined)) return _eval['tie'];

        // if it's X's turn
        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let i = 0; i < board.length; i++) {
                // if the spot is free
                if (board[i] === undefined) {
                    // if there is only one bot
                    if (Object.keys(gameLogic.aiMode).length === 2)
                    // check who is maximizing
                    (aiMode.bot.mark === 'X') ? board[i] = aiMode.bot.mark : board[i] = aiMode.player.mark;
                    // if there are two bots
                    else board[i] = aiMode.bot[0].mark;
                    // run algorithm on new board
                    let eval = _minimax(board, depth + 1, false);
                    // undo move
                    board[i] = undefined;
                    // evaluate position
                    maxEval = Math.max(eval, maxEval);
                }
            }
            return maxEval;

        // if it's O's turn
        } else {
            let minEval = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === undefined) {
                    // if there is only one bot
                    if (Object.keys(gameLogic.aiMode).length === 2)
                    // check who is minimizing
                    (aiMode.bot.mark === 'X') ? board[i] = aiMode.player.mark : board[i] = aiMode.bot.mark;
                    // if there are two bots
                    else board[i] = aiMode.bot[1].mark;
                    let eval = _minimax(board, depth + 1, true);
                    board[i] = undefined;
                    minEval = Math.min(eval, minEval);
                }
            }
            return minEval;
        }
    }

    // check if the bot is maximizing or minimizing and return appropriate values
    const checkBotState = (state) => {
        // if the bot is maximizing
        if (state === undefined && aiMode.bot.mark === 'X' || state === 'max') {
            return [false, -Infinity, '>'];
        // if the bot is minimizing
        } else if (state === undefined && aiMode.bot.mark === 'O' || state === 'min') {
            return [true, Infinity, '<'];
        }
    }

    // AI's turn
    const bestSpot = (state) => {
        let spot, isMaximizing, maxEval, op;

        // if there is only one bot
        if (state === undefined) [isMaximizing, maxEval, op] = checkBotState();
        // if there are two bots, return appropiate values
        else if (state === 'max') [isMaximizing, maxEval, op] = checkBotState('max');
        else if (state === 'min') [isMaximizing, maxEval, op] = checkBotState('min');

        for (let i = 0; i < board.length; i ++) {
            if (board[i] === undefined) {
                board[i] = aiMode.bot.mark;
                let eval = _minimax(board, 0, isMaximizing);
                board[i] = undefined;
                // return best possible spot according to evaluation
                if (_operators[op](eval, maxEval)) {
                    maxEval = eval;
                    spot = i;
                }
            }
        }
        return spot;
    }

    // game between two bots
    const botGame = () => {
        let winner = checkPattern();

        // make turns until there is a winner
        function makeTurns() {
            setTimeout(() => {
                // first maximize (X's turn)
                makeTurn(bestSpot('max'), _playerOne);
                winner = checkPattern();
                // if there is no winner, let 'O' move (minimize) and call function again
                if (!winner) {
                    makeTurns();
                    setTimeout(() => makeTurn(bestSpot('min'), _playerTwo), 300);
                }
                else checkWinner(winner);
            }, 500);
        }

        makeTurns();
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
            return true;
        // check for a tie
        } else if (!board.includes(undefined)) {
            displayController.announceWinner('');
            gameLogic.gameState = false;
            return true;
        } else return false;
    }

    // initialize game
    const _game = () => {
        gameLogic.gameState = true;
        _createPlayers();
        displayController.showBoard();

        // check if a bot has been selected
        if (_playerOne.isBot && !_playerTwo.isBot) {
            aiMode.bot =  _playerOne;
            aiMode.player = _playerTwo;
            setTimeout(() => makeTurn(gameLogic.bestSpot(), gameLogic.aiMode.bot), 300);
        } else if (_playerTwo.isBot && !_playerOne.isBot) {
            aiMode.bot =  _playerTwo;
            aiMode.player = _playerOne;
        } else if (_playerOne.isBot && _playerTwo.isBot) {
            aiMode.bot = [_playerOne, _playerTwo];
            botGame();
        }
        
        // if there's at least one player, enable board placing
        if (!_playerOne.isBot || !_playerTwo.isBot) {
            _gameCells.forEach((cell, i) => cell.addEventListener('click', () => gameBoard.update(i)));
        }
    }

    const beginGame = () => {
        _playBtn.addEventListener('click', _game);
    }
    
    return {gameState, aiMode, setActivePlayer, makeTurn, bestSpot, botGame, checkPattern, checkWinner, beginGame};
})();



const displayController = (() => {

    const _winnerLine = document.querySelector('#winner-line'),
        _winnerPara = document.querySelector('#winner'),
        _againBtn = document.querySelector('#again'),
        _gameCells = document.querySelectorAll('.game-cell');
    let _title =  document.querySelector('#title');

    function _toggleAnim(toggle, animation, element) {
        // remove or add animation to elements
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

    // show winner message
    const announceWinner = (winner) => {
        _winnerPara.style.visibility = 'visible';
        _againBtn.style.visibility = 'visible';
        if (typeof winner === 'string') {
            _winnerPara.innerHTML = `You tied.`;
        } else if (Object.keys(gameLogic.aiMode).length === 1) {
            _winnerPara.innerHTML = `This is pointless.`;
            _drawLine(winner);
        } else if (Object.keys(gameLogic.aiMode).length === 2 && winner.name === 'Unstoppable AI') {
            _winnerPara.innerHTML = `<span style="color: ${setColor(winner.mark)}">Told you he's unstoppable :(</span>`;
            _drawLine(winner);
        } else {
            _winnerPara.innerHTML = `Congrats <span style="color: ${setColor(winner.mark)}">${winner.name}</span>, you won!`;
            _drawLine(winner);
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

        // swap between bot node and player node
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
        
        // hide clicked arrow, show the other one and show the correct node
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
        _againBtn.addEventListener('click', _playAgain);
    }

    // return the correct color
    const setColor = (mark) => {
        return (mark === 'X') ? `var(--darkred)` : `var(--green)`;
    }

    const _drawLine = (winner) => {

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
    const _playAgain = (e) => {
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

    // change color of title's letters
    const randomizeTitleColor = () => {
        let titleArray = _title.innerHTML.split("");
        // for each letter
        for (let i = 0; i < titleArray.length; i++) {
            // apply random color
            titleArray[i] = `<span style="color: ${_chooseColor()}">${titleArray[i]}</span>`;
        }
        _title.innerHTML = titleArray.join("");
    }

    return {announceWinner, switchPlayer, showBoard, setColor, randomizeTitleColor};
})();



displayController.randomizeTitleColor();
displayController.switchPlayer();
gameLogic.beginGame();
