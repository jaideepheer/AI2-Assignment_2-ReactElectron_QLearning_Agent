import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  QLearningAgent,
  QLearningAgentParamaters,
} from '../game_core/QLearningAgent';
import Position from '../typedefs/position';
import { BoardAction, BoardState } from '../game_core/board_state';
import { defaultBoardState } from './board_slice';

const initialState = {
  discountFactor: 0.8,
  initialState: defaultBoardState.startPos,
  learningRate: 0.2,
  explorationFunction: (qValue: number, freq: number) =>
    freq > 0 ? qValue * freq : qValue,
  getNextState: (state, action) =>
    defaultBoardState.getNextPosition(state, action),
  getPossibleActions: (pos) => defaultBoardState.getActions(pos),
  rewardFunction: (state: Position) =>
    -1 *
    (Math.abs(state.x - defaultBoardState.goalPos.x) +
      Math.abs(state.y - defaultBoardState.goalPos.y)),
} as QLearningAgentParamaters<Position, BoardAction>;

export const agentSlice = createSlice({
  name: 'agent',
  initialState: {
    ...initialState,
    agentInstance: new QLearningAgent(initialState),
    agentPosition: initialState.initialState,
    history: [{ path: [initialState.initialState], reward: 0 }],
    goalPosition: defaultBoardState.goalPos,
    iteration: 1,
    step: 0,
  },
  reducers: {
    nextStep: (state) => {
      state.history[state.iteration - 1].reward +=
        state.agentInstance.context.currentReward;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      state.agentInstance.takeAction(state.agentInstance.recommendedAction!);
      state.agentPosition = state.agentInstance.currentState;
      state.history[state.iteration - 1].path.push(
        state.agentInstance.currentState
      );
      state.step += 1;
    },
    nextIteration: (state) => {
      state.agentInstance.resetPosition();
      state.agentPosition = state.initialState;
      state.history.push({ path: [state.initialState], reward: 0 });
      state.iteration += 1;
      state.step = 0;
    },
    reachGoal: (state) => {
      let pos = state.agentPosition;
      const a = state.agentInstance;
      while (!pos.equals(state.goalPosition)) {
        state.history[state.iteration - 1].reward += a.context.currentReward;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        a.takeAction(a.recommendedAction!);
        state.step += 1;
        pos = a.currentState;
        state.history[state.iteration - 1].path.push(pos);
      }
      state.agentPosition = pos;
    },
    updateAgentBoard: (
      state,
      { payload: newBoard }: PayloadAction<BoardState>
    ) => {
      state.getNextState = (s, action) => newBoard.getNextPosition(s, action);
      state.getPossibleActions = (pos) => newBoard.getActions(pos);
      state.rewardFunction = (s: Position) =>
        -1 *
        (Math.abs(s.x - newBoard.goalPos.x) +
          Math.abs(s.y - newBoard.goalPos.y));
      state.goalPosition = newBoard.goalPos;
      state.agentInstance.params = { ...state };
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  nextStep,
  updateAgentBoard,
  reachGoal,
  nextIteration,
} = agentSlice.actions;

export default agentSlice.reducer;
