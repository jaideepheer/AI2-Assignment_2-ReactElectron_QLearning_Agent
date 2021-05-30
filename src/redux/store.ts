import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import subscribeActionMiddleware, {
  subscribeActionAfter,
} from 'redux-subscribe-action';
import boardReducer, { repositionGoal } from './board_slice';
import agentReducer, { updateAgentBoard } from './agent_slice';
import uiSlice from './ui_slice';

const store = configureStore({
  reducer: {
    board: boardReducer,
    agent: agentReducer,
    ui: uiSlice,
  },
  middleware: [
    ...getDefaultMiddleware({
      serializableCheck: false,
    }),
    subscribeActionMiddleware,
  ],
});

subscribeActionAfter(repositionGoal().type, () => {
  const st = store.getState().board.board;
  store.dispatch(updateAgentBoard(st));
});

export default store;
