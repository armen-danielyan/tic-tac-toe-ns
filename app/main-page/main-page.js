var frameModule = require('ui/frame');
var dialogs = require("ui/dialogs");

var page;
var board = [];
var boardSize = 9;
var unVisited = " ";
var hPlayer = "o";
var aPlayer = "x";
var activeTurn = "h";
var choice;
var howWon = [];

var hPlayerImg = "~/images/btncabb.png";
var hPlayerWinImg = "~/images/btncabbwin.png";
var aPlayerImg = "~/images/btnpaper.png";
var aPlayerWinImg = "~/images/btnpaperwin.png";
var ePlayerImg = "~/images/btnbgr.png";

function newGame() {
    for (var i = 0; i < boardSize; i++) {
        board[i] = unVisited;
        var btn = page.getViewById("btns" + i);
        btn.src = ePlayerImg;
    }
    howWon = [];
    activeTurn = "h";
}

function makeMove(pos) {
    if (!gameOver(board) && board[pos] == unVisited) {
        board[pos] = hPlayer;

        var btn = page.getViewById("btns" + pos);
        btn.src = hPlayerImg;
        if (!gameOver(board)) {
            activeTurn = "c";
            //turnInfo.text = "Computer's turn";
            makeComputerMove();
        }
    }
}

function makeComputerMove() {
    miniMax(board, 0);

    var move = choice;
    board[move] = aPlayer;

    var btn = page.getViewById("btns" + move);
    btn.src = aPlayerImg;
    choice = [];
    activeTurn = "h";
    if (gameOver(board)) {
        //turnInfo.text = "Your turn";
    }
}

function score(game, depth) {
    var score = checkForWinner(game);
    if (score === 1)
        return 0;
    else if (score === 2)
        return depth - 10;
    else if (score === 3)
        return 10 - depth;
}

function miniMax(tempBoardGame, depth) {
    if (checkForWinner(tempBoardGame) !== 0)
        return score(tempBoardGame, depth);

    depth += 1;

    var scores = [];
    var moves = [];
    var availableMoves = getAvailableMoves(tempBoardGame);
    var move, possibleGame;
    for(var i = 0; i < availableMoves.length; i++) {
        move = availableMoves[i];
        possibleGame = getNewState(move, tempBoardGame);
        scores.push(miniMax(possibleGame, depth));
        moves.push(move);
        tempBoardGame = undoMove(tempBoardGame, move);
    }

    var maxScore, maxScoreIndex, minScore, minScoreIndex;

    if (activeTurn === "c") {
        maxScore = Math.max.apply(Math, scores);
        maxScoreIndex = scores.indexOf(maxScore);
        choice = moves[maxScoreIndex];
        return scores[maxScoreIndex];
    } else {
        minScore = Math.min.apply(Math, scores);
        minScoreIndex = scores.indexOf(minScore);
        choice = moves[minScoreIndex];
        return scores[minScoreIndex];
    }
}

function undoMove(game, move) {
    game[move] = unVisited;
    changeTurn();
    return game;
}

function getNewState(move, game) {
    var piece = changeTurn();
    game[move] = piece;
    return game;
}

function changeTurn() {
    var piece;
    if (activeTurn === "c") {
        piece = 'x';
        activeTurn = "h";
    } else {
        piece = 'o';
        activeTurn = "c";
    }
    return piece;
}

function getAvailableMoves(game) {
    var possibleMoves = [];
    for (var i = 0; i < boardSize; i++)
        if (game[i] === unVisited)
            possibleMoves.push(i);
    return possibleMoves;
}

function checkForWinner(game) {
    for (var i = 0; i <= 6; i += 3) {
        if (game[i] === hPlayer && game[i + 1] === hPlayer && game[i + 2] === hPlayer) {
            howWon = [i, i + 1, i + 2];
            return 2;
        }
        if (game[i] === aPlayer && game[i + 1] === aPlayer && game[i + 2] === aPlayer) {
            howWon = [i, i + 1, i + 2];
            return 3;
        }
    }

    for (i = 0; i <= 2; i++) {
        if (game[i] === hPlayer && game[i + 3] === hPlayer && game[i + 6] === hPlayer) {
            howWon = [i, i + 3, i + 6];
            return 2;
        }
        if (game[i] === aPlayer && game[i + 3] === aPlayer && game[i + 6] === aPlayer) {
            howWon = [i, i + 3, i + 6];
            return 3;
        }
    }

    if(game[0] === hPlayer && game[4] === hPlayer && game[8] === hPlayer) {
        howWon = [0, 4, 8];
        return 2;
    }
    if(game[2] === hPlayer && game[4] === hPlayer && game[6] === hPlayer) {
        howWon = [2, 4, 6];
        return 2;
    }
    if(game[0] === aPlayer && game[4] === aPlayer && game[8] === aPlayer) {
        howWon = [0, 4, 8];
        return 3;
    }
    if(game[2] === aPlayer && game[4] === aPlayer && game[6] === aPlayer) {
        howWon = [2, 4, 6];
        return 3;
    }

    for (i = 0; i < boardSize; i++) {
        if (game[i] !== hPlayer && game[i] !== aPlayer)
            return 0;
    }

    return 1;
}

function gameOver(game) {
    if (checkForWinner(game) === 0)
        return false;
    else if (checkForWinner(game) === 1) {
        showGameDialog("It is a tie!");
    } else if (checkForWinner(game) === 2) {
        showGameDialog("You have won!");
        highlightWinner(howWon, 2);
    } else {
        showGameDialog("Computer has won!");
        highlightWinner(howWon, 3);
    }
    return true;
}

function highlightWinner(items, whoWon) {
    for(var i = 0; i < items.length; i++) {
        var btn = page.getViewById("btns" + items[i]);

        var winnerSrc = whoWon == 2 ? hPlayerWinImg : aPlayerWinImg;
        btn.src = winnerSrc;
    }
}

var onNavigatingTo = function(args) {
    console.log('start');
    page = args.object;

    newGame();
};

var btnsClick = function(data) {
    var btns = data.object;
    makeMove(btns.btnsid);
};

var restartGame = function() {
    newGame();
};

var showGameDialog = function(textDialog) {
    var confDialog = {
        title: "Tic Tac Toe Greens",
        message: textDialog,
        okButtonText: "OK"
    };

    dialogs.alert(confDialog)
        .then(function() {
            console.log("Dialog closed!");
        });
};

var pageSettings = function() {
    var navigationEntry = {
        moduleName: 'settings-page/settings-page',
        animated: true,
        transition: {
            name: "slide",
            duration: 380,
            curve: "easeIn"
        }
    };
    frameModule.topmost().navigate(navigationEntry);
};


exports.btnsClick = btnsClick;
exports.pageSettings = pageSettings;
exports.restartGame = restartGame;

exports.onNavigatingTo = onNavigatingTo;