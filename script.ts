const board = document.getElementById("board") as HTMLDivElement;
const message = document.getElementById("status") as HTMLDivElement;
const resetButton = document.getElementById(
  "reset-button"
) as HTMLButtonElement;

type Player = "X" | "O" | "";

const EMPTY: Player = "";
const X: Player = "X";
const O: Player = "O";

let currentPlayer: Player = X;
let boardState: Player[] = [
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
];
let gameActive: boolean = true;

function createCell(index: number): HTMLDivElement {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.index = index.toString();
  cell.textContent = "";
  cell.addEventListener("click", handleCellClick);
  return cell;
}

function handleCellClick(event: MouseEvent): void {
  const cell = event.target as HTMLDivElement;
  const index = parseInt(cell.dataset.index!);

  if (boardState[index] === EMPTY && gameActive) {
    boardState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer);

    if (checkWin(currentPlayer)) {
      message.textContent = `${currentPlayer} wins!`;
      gameActive = false;
    } else if (boardState.includes(EMPTY)) {
      currentPlayer = currentPlayer === X ? O : X;
      message.textContent = `${currentPlayer}'s turn`;
      if (currentPlayer === O) {
        setTimeout(computerMove, 500);
      }
    } else {
      message.textContent = "It's a draw!";
      gameActive = false;
    }
  }
}

function checkWin(player: Player): boolean {
  const winPatterns: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  return winPatterns.some((pattern) =>
    pattern.every((index) => boardState[index] === player)
  );
}

function resetGame(): void {
  boardState = [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY];
  gameActive = true;
  currentPlayer = X;
  message.textContent = `${currentPlayer}'s turn`;

  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove(X, O);
  });
}

resetButton.addEventListener("click", resetGame);

for (let i = 0; i < 9; i++) {
  const cell = createCell(i);
  board.appendChild(cell);
}

message.textContent = `${currentPlayer}'s turn`;

function calcMove(
  board: Player[],
  depth: number,
  isMaximizing: boolean
): number {
  const scores: Record<Player, number> = {
    X: -1,
    O: 1,
    "": 0,
  };

  if (checkWin(X)) return scores.X;
  if (checkWin(O)) return scores.O;
  if (!board.includes(EMPTY)) return scores[""];

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === EMPTY) {
        board[i] = O;
        const score = calcMove(board, depth + 1, false);
        board[i] = EMPTY;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === EMPTY) {
        board[i] = X;
        const score = calcMove(board, depth + 1, true);
        board[i] = EMPTY;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function computerMove(): void {
  let bestMove: number | undefined;
  let bestScore = -Infinity;

  for (let i = 0; i < 9; i++) {
    if (boardState[i] === EMPTY) {
      boardState[i] = O;
      const score = calcMove(boardState, 0, false);
      boardState[i] = EMPTY;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  if (bestMove !== undefined) {
    boardState[bestMove] = O;
    const cell = document.querySelector(
      `[data-index="${bestMove}"]`
    ) as HTMLDivElement;
    cell.textContent = O;
    cell.classList.add(O);

    if (checkWin(O)) {
      message.textContent = `${O} wins!`;
      gameActive = false;
    } else if (!boardState.includes(EMPTY)) {
      message.textContent = "It's a draw!";
      gameActive = false;
    } else {
      currentPlayer = X;
      message.textContent = `${currentPlayer}'s turn`;
    }
  }
}
