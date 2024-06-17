const errorTextElement = document.getElementById("errorHeader");

function showError(text) {
    errorTextElement.textContent = text;
    errorTextElement.style.display = "block";
}

const canvas = document.getElementById('gridCanvas');
const context = canvas.getContext('2d');
const desiredPixelSize = 400;


function resizeCanvas() {
    const desiredCanvasSize = Math.min(desiredPixelSize, Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9));
    canvas.width = desiredCanvasSize;
    canvas.height = desiredCanvasSize;
}

function getClickedCell(gridWidth, gridHeight, clickX, clickY) {
    const cellWidth = canvas.width / gridWidth;
    const cellHeight = canvas.height / gridHeight;
    const col = Math.floor(clickX / cellWidth);
    const row = Math.floor(clickY / cellHeight);
    return { row, col };
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const { row, col } = getClickedCell(puzzleWidth, puzzleHeight, x, y);
    handleCellClick(row, col);
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();