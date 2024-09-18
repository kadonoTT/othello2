const size = 8;
const board = document.getElementById('board');
const cells = [];
let currentPlayer = 'black';
let boardState = [];

// 盤面の初期化
function createBoard() {
    board.innerHTML = ''; // Clear previous cells
    boardState = Array(size).fill(null).map(() => Array(size).fill(null)); // 2次元配列を初期化

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleClick);
            board.appendChild(cell);
            cells.push(cell);
        }
    }
    initializeBoard();
}

function initializeBoard() {
    const mid = size / 2;
    boardState[mid - 1][mid - 1] = 'white';
    boardState[mid - 1][mid] = 'black';
    boardState[mid][mid - 1] = 'black';
    boardState[mid][mid] = 'white';

    updateBoard();
    updateScore();
    showValidMoves();
}

function updateBoard() {
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const state = boardState[row][col];
        cell.classList.remove('black', 'white');
        if (state) {
            cell.classList.add(state);
        }
    });
}

function isValidMove(row, col) {
    if (boardState[row][col]) return false; // すでに石が置かれている場所は無効
    
    let valid = false;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
    ];

    for (let [dx, dy] of directions) {
        let x = row + dx;
        let y = col + dy;
        let hasOpposite = false;

        while (x >= 0 && x < size && y >= 0 && y < size) {
            if (!boardState[x][y]) break;
            if (boardState[x][y] === currentPlayer) {
                if (hasOpposite) {
                    valid = true;
                    break;
                }
                break;
            }
            hasOpposite = true;
            x += dx;
            y += dy;
        }
    }
    return valid;
}

function flipStones(row, col) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
    ];

    for (let [dx, dy] of directions) {
        let x = row + dx;
        let y = col + dy;
        const toFlip = [];
        
        while (x >= 0 && x < size && y >= 0 && y < size) {
            if (!boardState[x][y]) break;
            if (boardState[x][y] === currentPlayer) {
                for (const [flipX, flipY] of toFlip) {
                    boardState[flipX][flipY] = currentPlayer;
                }
                boardState[row][col] = currentPlayer;
                break;
            }
            toFlip.push([x, y]);
            x += dx;
            y += dy;
        }
    }
}

function updateScore() {
    const blackCount = boardState.flat().filter(cell => cell === 'black').length;
    const whiteCount = boardState.flat().filter(cell => cell === 'white').length;
    document.getElementById('blackScore').textContent = `Black: ${blackCount}`;
    document.getElementById('whiteScore').textContent = `White: ${whiteCount}`;
}

function updateCurrentPlayer() {
    document.getElementById('currentPlayer').textContent = `Current Player: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`;
}

function showValidMoves() {
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        if (!boardState[row][col] && isValidMove(row, col)) {
            cell.classList.add('valid');
        } else {
            cell.classList.remove('valid');
        }
    });
}

function handleClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    if (isValidMove(row, col)) {
        boardState[row][col] = currentPlayer;
        flipStones(row, col);
        updateBoard();
        updateScore();
        currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
        updateCurrentPlayer();
        showValidMoves();

        // NPCのターンが白の場合
        if (currentPlayer === 'white') {
            setTimeout(() => {
                npcMove();
                updateBoard();
                updateScore();
                currentPlayer = 'black';
                updateCurrentPlayer();
                showValidMoves();
            }, 500); // NPCの手を遅らせる
        }
    }
}

function getBestMove() {
    let bestMove = null;
    let maxFlips = 0;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (isValidMove(row, col)) {
                const flipCount = countFlips(row, col);
                if (flipCount > maxFlips) {
                    maxFlips = flipCount;
                    bestMove = { row, col };
                }
            }
        }
    }
    return bestMove;
}

function countFlips(row, col) {
    let flipCount = 0;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
    ];

    for (let [dx, dy] of directions) {
        let x = row + dx;
        let y = col + dy;
        let count = 0;
        
        while (x >= 0 && x < size && y >= 0 && y < size) {
            if (!boardState[x][y]) break;
            if (boardState[x][y] === currentPlayer) {
                flipCount += count;
                break;
            }
            count++;
            x += dx;
            y += dy;
        }
    }
    return flipCount;
}

function npcMove() {
    const move = getBestMove();
    if (move) {
        const { row, col } = move;
        boardState[row][col] = 'white';
        flipStones(row, col);
    }
}

createBoard();
updateCurrentPlayer();
showValidMoves();
