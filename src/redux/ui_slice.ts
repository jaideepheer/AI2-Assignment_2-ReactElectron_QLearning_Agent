import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Position from '../typedefs/position';

const uiSlice = createSlice({
  name: 'ui_slice',
  initialState: {
    highlightedPositions: [] as Array<Position>,
  },
  reducers: {
    highlightPosition: (
      state,
      { payload: position }: PayloadAction<Position>
    ) => {
      state.highlightedPositions.push(position);
    },
    clearPosition: (state, { payload: position }: PayloadAction<Position>) => {
      state.highlightedPositions = state.highlightedPositions.filter(
        (e) => !position.equals(e)
      );
    },
  },
});

// Action creators are generated for each case reducer function
export const { highlightPosition, clearPosition } = uiSlice.actions;

export default uiSlice.reducer;
