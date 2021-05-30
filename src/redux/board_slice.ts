import { createSlice } from '@reduxjs/toolkit';
import { BoardCell, BoardState } from '../game_core/board_state';
import Position from '../typedefs/position';

const getDefaultBoardCells = () => {
  const defaultBoardCells = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => 'Empty' as BoardCell).slice()
  );
  // assign walls
  [
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [5, 2],
    [5, 1],
    [1, 4],
    [1, 5],
    [3, 4],
    [3, 5],
    [3, 6],
    [4, 4],
    [5, 4],
    [6, 4],
    [6, 6],
    [6, 7],
  ].forEach(([x, y]) => {
    defaultBoardCells[x][y] = 'Wall';
  });
  defaultBoardCells[7][0] = 'Start';
  defaultBoardCells[3][7] = 'Power Position';
  defaultBoardCells[1][6] = 'Goal';
  defaultBoardCells[4][0] = 'Restart';
  defaultBoardCells[4][6] = 'Restart';
  defaultBoardCells[2][1] = 'Goto Power Position';
  defaultBoardCells[1][3] = 'Goto Power Position';
  defaultBoardCells[7][7] = 'Goto Power Position';
  return defaultBoardCells;
};

export const defaultBoardState = new BoardState(getDefaultBoardCells());

export const boardSlice = createSlice({
  name: 'board',
  initialState: {
    board: defaultBoardState,
  },
  reducers: {
    // reposition action
    repositionGoal: (state) => {
      const goalCandidates = state.board.state
        .flat()
        .map((val, idx) => {
          // Map to co-ordinates
          const [w] = state.board.shape;
          const i = Math.floor(idx / w);
          const j = idx % w;
          return [val, i, j];
        })
        .filter(([cell, i, j]) => {
          // Filter positions eligible for new goal
          const x = 7 - (i as number) + 1;
          const y = (j as number) + 1;
          if (cell !== 'Empty' || x <= 5 || y <= 5) return false;
          return true;
        })
        .map(([, i, j]): Position => new Position(i as number, j as number));
      // select goal randomly from candidates
      const newgoal =
        goalCandidates[Math.floor(Math.random() * goalCandidates.length)];
      console.log(goalCandidates);
      console.log(newgoal);
      // update state
      const board = state.board.cloneWithSwappedCells(
        state.board.goalPos,
        newgoal
      );
      state.board = board;
    },
  },
});

// Action creators are generated for each case reducer function
export const { repositionGoal } = boardSlice.actions;

export default boardSlice.reducer;
