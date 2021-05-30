/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-syntax */
import { assert } from 'console';
import { List } from 'immutable';
import Position from '../typedefs/position';

export type BoardCell =
  | 'Empty'
  | 'Start'
  | 'Goto Power Position'
  | 'Power Position'
  | 'Restart'
  | 'Goal'
  | 'Wall';

export enum BoardAction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export class BoardState {
  readonly shape: [number, number];

  readonly powerPos!: Position;

  readonly goalPos!: Position;

  readonly startPos!: Position;

  constructor(public readonly state: BoardCell[][]) {
    this.shape = [state.length, state[0].length];
    // Encode cells with position
    const posEncoding = this.state
      .map((row, row_idx: number) =>
        row.map((val: BoardCell, col_idx: number): [BoardCell, Position] => [
          val,
          new Position(row_idx, col_idx),
        ])
      )
      .flat(1);
    // Get power tile, start tile and goal tile position
    const powerPos = posEncoding.filter((enc) => enc[0] === 'Power Position');
    const startPos = posEncoding.filter((enc) => enc[0] === 'Start');
    const goalPos = posEncoding.filter((enc) => enc[0] === 'Goal');
    // Restrict power tile, start tile and goal tile to only 1 tile
    assert(powerPos.length === 1, 'Exactly 1 power tile required.');
    assert(startPos.length === 1, 'Exactly 1 start tile required.');
    assert(goalPos.length === 1, 'Exactly 1 goal tile required.');
    // Save power and start tile positions
    // eslint-disable-next-line prefer-destructuring
    this.powerPos = powerPos[0][1];
    // eslint-disable-next-line prefer-destructuring
    this.startPos = startPos[0][1];
    // eslint-disable-next-line prefer-destructuring
    this.goalPos = goalPos[0][1];
  }

  public cloneWithSwappedCells(a: Position, b: Position): BoardState {
    const newState = [...this.state];
    const temp = newState[a.x][a.y];
    newState[a.x] = [...newState[a.x]];
    newState[a.x][a.y] = newState[b.x][b.y];
    newState[b.x] = [...newState[b.x]];
    newState[b.x][b.y] = temp;
    const ret = new BoardState(newState);
    return ret;
  }

  private getNoTeleportNeighbours(
    position: Position
  ): List<{ p: Position; a: BoardAction }> {
    const { x, y } = position;
    // Up, down, left, right
    const nb = [
      { p: new Position(x + 1, y), a: BoardAction.DOWN },
      { p: new Position(x - 1, y), a: BoardAction.UP },
      { p: new Position(x, y + 1), a: BoardAction.RIGHT },
      { p: new Position(x, y - 1), a: BoardAction.LEFT },
    ]
      .filter(
        // Filter to be within the board
        ({ p }) => {
          return (
            p.x >= 0 && p.y >= 0 && p.x < this.shape[0] && p.y < this.shape[1]
          );
        }
      )
      .filter(
        // Filter to not be a wall
        ({ p }) => {
          return this.state[p.x][p.y] !== 'Wall';
        }
      );
    return List.of(...nb);
  }

  // eslint-disable-next-line consistent-return
  public getNextPosition(position: Position, action: BoardAction): Position {
    const state = this.state[position.x][position.y];
    const { x, y } =
      // eslint-disable-next-line no-nested-ternary
      state === 'Goto Power Position'
        ? this.powerPos
        : state === 'Restart'
        ? this.startPos
        : position;
    // eslint-disable-next-line default-case
    switch (action) {
      case BoardAction.DOWN:
        return new Position(x + 1, y);
      case BoardAction.UP:
        return new Position(x - 1, y);
      case BoardAction.LEFT:
        return new Position(x, y - 1);
      case BoardAction.RIGHT:
        return new Position(x, y + 1);
    }
  }

  /**
   * Retruns the actions pssible at a position.
   * If teleportation applies then gives the actions of teleported final position.
   * @param position: The position to get neighbours of.
   * @returns A list of Positions.
   */
  getActions(position: Position): List<BoardAction> {
    const state = this.state[position.x][position.y];
    let ret;
    if (state === 'Goto Power Position') {
      // This tile teleports to power position
      ret = this.getNoTeleportNeighbours(this.powerPos);
    } else if (state === 'Restart') {
      // This tile teleports to start position
      ret = this.getNoTeleportNeighbours(this.startPos);
    }
    // no teleportation
    else ret = this.getNoTeleportNeighbours(position);
    return ret.map(({ a }) => a);
  }
}
