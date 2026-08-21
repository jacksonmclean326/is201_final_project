(function () {
  const WIN_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const gameEl = document.getElementById("game");
  const statusEl = document.getElementById("status");
  const restartBtn = document.getElementById("restart");

  let boards; // array of 9 boards, each board is array of 9 cells: 0 empty, 1 X, -1 O
  let boardWinners; // 0 none, 1 X, -1 O, 2 draw
  let currentPlayer; // 1 X, -1 O
  let nextBoardIndex; // null means free move, otherwise 0..8
  let mainWinner = 0;

  function init() {
    boards = Array.from({ length: 9 }, () => Array(9).fill(0));
    boardWinners = Array(9).fill(0);
    currentPlayer = 1; // X starts
    nextBoardIndex = null;
    mainWinner = 0;
    renderBoard();
    updateStatus();
  }

  function renderBoard() {
    gameEl.innerHTML = "";
    for (let bi = 0; bi < 9; bi++) {
      const sb = document.createElement("div");
      sb.className = "small-board";
      sb.dataset.index = bi;
      if (boardWinners[bi] !== 0) {
        sb.classList.add("won");
        sb.classList.add(boardWinners[bi] === 1 ? "x" : "o");
        const ov = document.createElement("div");
        ov.className = "overlay-winner";
        ov.textContent =
          boardWinners[bi] === 1 ? "X" : boardWinners[bi] === -1 ? "O" : "•";
        sb.appendChild(ov);
      }
      const isActive =
        (nextBoardIndex === null && boardWinners[bi] === 0) ||
        nextBoardIndex === bi;
      if (isActive && mainWinner === 0) sb.classList.add("active");

      for (let ci = 0; ci < 9; ci++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.bi = bi;
        cell.dataset.ci = ci;
        const val = boards[bi][ci];
        if (val === 1) cell.classList.add("x");
        if (val === -1) cell.classList.add("o");
        if (val !== 0) cell.textContent = val === 1 ? "X" : "O";
        if (boardWinners[bi] !== 0 || mainWinner !== 0)
          cell.classList.add("disabled");
        // If move must be in a specific board and this board isn't it, disable
        if (nextBoardIndex !== null && nextBoardIndex !== bi)
          cell.classList.add("disabled");
        cell.addEventListener("click", onCellClick);
        sb.appendChild(cell);
      }
      gameEl.appendChild(sb);
    }
  }

  function onCellClick(e) {
    const el = e.currentTarget;
    const bi = Number(el.dataset.bi);
    const ci = Number(el.dataset.ci);
    if (mainWinner !== 0) return;
    if (nextBoardIndex !== null && nextBoardIndex !== bi) return;
    if (boardWinners[bi] !== 0) return;
    if (boards[bi][ci] !== 0) return;

    boards[bi][ci] = currentPlayer;

    // check small board win
    const winner = checkWinner(boards[bi]);
    if (winner !== 0) {
      boardWinners[bi] = winner;
    } else if (boards[bi].every((v) => v !== 0)) {
      boardWinners[bi] = 2; // draw
    }

    // set next required board to the cell index
    if (boardWinners[ci] === 0) {
      nextBoardIndex = ci;
    } else {
      nextBoardIndex = null; // free move if destination board finished
    }

    // check main board win: build main array representing wins for each small board
    const mainArray = boardWinners.map((bw) =>
      bw === 1 ? 1 : bw === -1 ? -1 : 0,
    );
    const mainWin = checkWinner(mainArray);
    if (mainWin !== 0) {
      mainWinner = mainWin;
    } else if (boardWinners.every((bw) => bw !== 0)) {
      mainWinner = 2; // global draw
    }

    // switch player
    currentPlayer = -currentPlayer;
    renderBoard();
    updateStatus();
  }

  function checkWinner(arr) {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (arr[a] !== 0 && arr[a] === arr[b] && arr[a] === arr[c]) return arr[a];
    }
    return 0;
  }

  function updateStatus() {
    if (mainWinner === 1)
      return (statusEl.textContent = "Player X wins the game!");
    if (mainWinner === -1)
      return (statusEl.textContent = "Player O wins the game!");
    if (mainWinner === 2) return (statusEl.textContent = "The game is a draw.");
    const player = currentPlayer === 1 ? "X" : "O";
    if (nextBoardIndex === null) {
      statusEl.textContent = `Player ${player} — play anywhere.`;
    } else {
      // show 1-based index for clarity
      const r = Math.floor(nextBoardIndex / 3) + 1;
      const c = (nextBoardIndex % 3) + 1;
      statusEl.textContent = `Player ${player} — must play in small board at row ${r}, col ${c}.`;
    }
  }

  restartBtn.addEventListener("click", () => {
    init();
  });

  // initialize
  document.addEventListener("DOMContentLoaded", init);
})();
