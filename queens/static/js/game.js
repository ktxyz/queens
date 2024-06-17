let startButton = document.getElementById("startButton");
let seedTextBox = document.getElementById("seedTextBox");
let timerSpan = document.getElementById("timerSpan");
let puzzleSeed = 'today';

let puzzleWidth = 8;
let puzzleHeight = 8;
let puzzleBoard = null;

let puzzleSolution = null;
const CellState = {
    Empty: 0,
    Marker: 1,
    Piece: 2
};

let seconds = 0;
let timerInterval = null;

let gameStarted = false;

async function getPuzzleData() {
    const response = await fetch(`/api/get/${puzzleSeed}`);
    if (response.ok) {
        const data = await response.json();
        puzzleWidth = data.width;
        puzzleHeight = data.height;
        puzzleBoard = data.board;
        startPuzzle();
    } else {
        console.error('Failed to fetch puzzle data:', response.statusText);
        showError('Failed to fetch puzzle data from API. Try refreshing.');
    }
}

function drawCells() {
    const cellWidth = canvas.width / puzzleWidth;
    const cellHeight = canvas.height / puzzleHeight;
    for (let row = 0; row < puzzleHeight; row++) {
        for (let col = 0; col < puzzleWidth; col++) {
            context.fillStyle = puzzleBoard[row][col];
            context.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            context.strokeStyle = 'black';
            context.lineWidth = 3;
            context.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);

            if (puzzleSolution[row][col] === CellState.Marker) {
                drawMarker(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            } else if (puzzleSolution[row][col] === CellState.Piece) {
                drawPiece(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            }
        }
    }
}

function drawMarker(x, y, cellWidth, cellHeight) {
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    const offsetX = cellWidth * 0.35;
    const offsetY = cellHeight * 0.35;
    context.beginPath();
    context.moveTo(x + offsetX, y + offsetY);
    context.lineTo(x + cellWidth - offsetX, y + cellHeight - offsetY);
    context.moveTo(x + offsetX, y + cellHeight - offsetY);
    context.lineTo(x + cellWidth - offsetX, y + offsetY);
    context.stroke();
}

function drawPiece(x, y, cellWidth, cellHeight) {
    context.fillStyle = 'black';
    const pieceSize = Math.min(cellWidth, cellHeight) * 0.5;
    context.fillRect(x + (cellWidth - pieceSize) / 2, y + (cellHeight - pieceSize) / 2, pieceSize, pieceSize);
}


function handleCellClick(row, col) {
    if (!gameStarted) {
        return;
    }

    puzzleSolution[row][col] = (puzzleSolution[row][col] + 1) % 3;

    if (checkRules())
        stopTimer();

    drawCells();
}

function checkRules() {
    let valid = true;
    valid = checkRows() && valid;
    valid = checkColumns() && valid;
    valid = checkRegions() && valid;
    valid = checkNoTouching() && valid;
    
    document.getElementById('rule1').style.color = checkRows() && checkColumns() && checkRegions() ? 'black' : 'red';
    document.getElementById('subrule1').style.color = checkRows() ? 'black' : 'red';
    document.getElementById('subrule2').style.color = checkColumns() ? 'black' : 'red';
    document.getElementById('subrule3').style.color = checkRegions() ? 'black' : 'red';
    document.getElementById('rule3').style.color = checkNoTouching() ? 'black' : 'red';
    
    return valid;
}

function checkRows() {
    for (let row = 0; row < puzzleHeight; row++) {
        let pieceCount = 0;
        for (let col = 0; col < puzzleWidth; col++) {
            if (puzzleSolution[row][col] === CellState.Piece) {
                pieceCount++;
            }
        }
        if (pieceCount != 1) {
            return false;
        }
    }
    return true;
}

function checkColumns() {
    for (let col = 0; col < puzzleWidth; col++) {
        let pieceCount = 0;
        for (let row = 0; row < puzzleHeight; row++) {
            if (puzzleSolution[row][col] === CellState.Piece) {
                pieceCount++;
            }
        }
        if (pieceCount != 1) {
            return false;
        }
    }
    return true;
}

function checkRegions() {
    let usedColors = [];
    for (let row = 0; row < puzzleHeight; row++) {
        for (let col = 0; col < puzzleWidth; col++) {
            if (puzzleSolution[row][col] === CellState.Piece) {
                usedColors.push(puzzleBoard[row][col]);
            }
        }
    }
    return new Set(usedColors).size === Math.min(puzzleHeight, puzzleWidth);
}

function checkNoTouching() {
    for (let row = 0; row < puzzleHeight; row++) {
        for (let col = 0; col < puzzleWidth; col++) {
            if (puzzleSolution[row][col] === CellState.Piece) {
                if (isTouchingAnotherPiece(row, col)) {
                    return false;
                }
            }
        }
    }
    return true;
}

function isTouchingAnotherPiece(row, col) {
    const directions = [
        [-1, -1], [-1, 1],
        [1, -1], [1, 1]
    ];
    for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < puzzleHeight && newCol >= 0 && newCol < puzzleWidth) {
            if (puzzleSolution[newRow][newCol] === CellState.Piece) {
                return true;
            }
        }
    }
    return false;
}

function startPuzzle() {
    puzzleSolution = Array.from({ length: puzzleHeight }, () => Array.from({ length: puzzleWidth }, () => CellState.Empty));
    drawCells();
    startTimer();

    gameStarted = true;
    checkRules();
}

function startTimer() {
    stopTimer();
    seconds = 0;

    timerSpan.innerText = "0:00";
    document.getElementById("timerHeader").style.display = "block";
    timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timerSpan.textContent = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }, 1000);
}

function stopTimer() {
    gameStarted = false;
    clearInterval(timerInterval);
}

function updateSeed() {
    puzzleSeed = seedTextBox.value;
}
seedTextBox.value = puzzleSeed;
seedTextBox.addEventListener("input", updateSeed);

startButton.addEventListener("click", getPuzzleData);