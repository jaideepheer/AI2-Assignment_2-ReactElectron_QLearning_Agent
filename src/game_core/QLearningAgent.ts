import { ValueObject, RecordOf, List, Record, Map } from 'immutable';

export function QLearningStateActionHash<
  StateType extends ValueObject,
  ActionType
>(state: StateType, action: ActionType) {
  return [state.hashCode(), action].toString();
}

// Stores configuration of the Q-Learning agent
export interface QLearningAgentParamaters<
  StateType extends ValueObject,
  ActionType
> {
  readonly initialState: StateType;
  readonly learningRate: number;
  readonly discountFactor: number;
  // Accepts a Q-value and frequency and returns an exploration huristic.
  explorationFunction(qValue: number, frequency: number): number;
  // Accepts the current state and returns a list of possible actions.
  getPossibleActions(state: StateType): List<ActionType>;
  // Provides a new state after taking an action on the given state
  getNextState(currentState: StateType, action: ActionType): StateType;
  // Gives a reward for reching a state
  rewardFunction(state: StateType): number;
}

// Stores information used to perform step currentState -> nextState
type StateContextProps<StateType extends ValueObject, ActionType> = {
  // The number of steps taken so far. Starts at 0.
  step: number;
  currentState: StateType;
  currentReward: number;
  // Stores the list of possible actions from this state.
  possibleActions: List<ActionType>;
  // The action that the agent thinks is the best for this state.
  recommendedAction?: ActionType;
  prev?: {
    previousState: StateType;
    // The action that caused previousState -> currentState
    previousAction: ActionType;
    // The reward collected for previous state
    previousReward: number;
  };
  // The mapping of state-action to utility (Q-value)
  QValues: Map<string, number>;
  // The mapping of state-action to frequency
  Frequencies: Map<string, number>;
};

// Stores information used to perform step currentState -> nextState
export type QLearningContext<
  StateType extends ValueObject,
  ActionType
> = RecordOf<StateContextProps<StateType, ActionType>>;

export class QLearningAgent<StateType extends ValueObject, ActionType> {
  // Retruns the default context with initial state etc.
  public defaultContextFactory: Record.Factory<
    StateContextProps<StateType, ActionType>
  >;

  // Stores information used to perform step currentState -> nextState
  private stateContext: QLearningContext<StateType, ActionType>;

  /**
   * Returns the recommended action for the current state context.
   * This is calculted by finding the action with the max value for exploration function.
   */
  private calcRecommendedAction(
    context: QLearningContext<StateType, ActionType> = this.context
  ): ActionType {
    const { explorationFunction } = this.params;
    const { Frequencies, QValues, possibleActions, currentState } = context;
    let bestH = -Infinity;
    let bestAc: ActionType = possibleActions.first();
    possibleActions.forEach((val) => {
      const key = QLearningStateActionHash(currentState, val);
      const qv = QValues.get(key) || 0;
      const fq = Frequencies.get(key) || 0;
      const h = explorationFunction(qv, fq);
      if (bestH < h) {
        bestH = h;
        bestAc = val;
      }
    });
    return bestAc;
  }

  constructor(public params: QLearningAgentParamaters<StateType, ActionType>) {
    // Init. default state context facotry
    this.defaultContextFactory = Record({
      step: 0,
      currentState: params.initialState,
      currentReward: 0,
      possibleActions: params.getPossibleActions(params.initialState),
      QValues: Map<string, number>(),
      Frequencies: Map<string, number>(),
      recommendedAction: undefined,
      prev: undefined,
    });
    // Init. state context
    this.stateContext = this.defaultContextFactory();
    // Init. recommended action
    this.stateContext = this.stateContext.set(
      'recommendedAction',
      this.calcRecommendedAction()
    );
  }

  get currentState() {
    return this.stateContext.currentState;
  }

  get context(): QLearningContext<StateType, ActionType> {
    return this.stateContext;
  }

  get possibleActions() {
    return this.stateContext.possibleActions;
  }

  /**
   * Returns the recommended action from the current state.
   */
  get recommendedAction() {
    return this.stateContext.recommendedAction;
  }

  resetPosition() {
    const stateContext = this.stateContext.withMutations((v) => {
      v.set('prev', undefined);
      v.set('currentState', this.params.initialState);
      v.set(
        'currentReward',
        this.params.rewardFunction(this.params.initialState)
      );
      v.set(
        'possibleActions',
        this.params.getPossibleActions(this.params.initialState)
      );
    });
    this.stateContext = stateContext.set(
      'recommendedAction',
      this.calcRecommendedAction(stateContext)
    );
  }

  /**
   * Takes an action and updates itself.
   * @param action The action to take.
   * @returns True if action taken else false if action cannot be taken from current state.
   */
  takeAction(action: ActionType): boolean {
    // Return if cannot take given action from current state.
    if (!this.possibleActions.includes(action)) return false;
    const {
      getNextState,
      rewardFunction,
      getPossibleActions,
      learningRate,
      discountFactor,
    } = this.params;
    const stateContext = this.stateContext.withMutations((v) => {
      // Take the action and put current state in prev
      let newContext = v;
      newContext = newContext.set('prev', {
        previousAction: action,
        previousState: newContext.currentState,
        previousReward: newContext.currentReward,
      });
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const prevState = newContext.prev!.previousState;
      const curState = getNextState(prevState, action);
      // Update the new state after taking the action
      newContext = newContext.set('currentState', curState);
      newContext = newContext.set('currentReward', rewardFunction(curState));
      newContext = newContext.set(
        'possibleActions',
        getPossibleActions(curState)
      );
      // Update state-action frequency
      const { Frequencies, QValues } = newContext;
      const prevKey = QLearningStateActionHash(prevState, action);
      newContext = newContext.set(
        'Frequencies',
        Frequencies.update(prevKey, 0, (val) => val + 1)
      );
      // Update state-action utility
      const prevQValue = QValues.get(prevKey) || 0;
      const nextBestQValue: number = newContext.possibleActions.reduce(
        (acc, nextAction) => {
          const nextKey = QLearningStateActionHash(curState, nextAction);
          const nextQValue = QValues.get(nextKey) || 0;
          return Math.max(acc, nextQValue);
        },
        -Infinity
      );
      newContext = newContext.set(
        'QValues',
        newContext.QValues.update(prevKey, 0, (val) => {
          const deltaQ =
            learningRate *
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            newContext.Frequencies.get(prevKey)! *
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (newContext.prev!.previousReward +
              discountFactor * nextBestQValue -
              prevQValue);
          return val + deltaQ;
        })
      );
      // Update step
      newContext = newContext.update('step', (val) => val + 1);
    });
    // Update recommended action
    this.stateContext = stateContext.set(
      'recommendedAction',
      this.calcRecommendedAction(stateContext)
    );
    return true;
  }
}
