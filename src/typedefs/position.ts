import { ValueObject } from 'immutable';

export default class Position implements ValueObject {
  constructor(readonly x: number, readonly y: number) {}

  public equals(other: Position | [number, number]): boolean {
    if (other instanceof Position)
      return this.x === other.x && this.y === other.y;
    return this.x === other[0] && this.y === other[1];
  }

  public hashCode = (): number => {
    // eslint-disable-next-line no-bitwise
    return (41 * this.x + 83 * this.y) | 0;
  };

  public toString(): string {
    return `Position(${this.x}, ${this.y})`;
  }
}
