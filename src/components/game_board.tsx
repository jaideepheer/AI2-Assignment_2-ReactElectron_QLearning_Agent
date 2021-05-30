/* eslint-disable react/no-array-index-key */
/* eslint-disable react/require-default-props */
import { Container, Paper } from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import store from '../redux/store';
import Position from '../typedefs/position';
import BoardCellComponent from './board_cell';
import ControllPanellComponent from './controll_panel';

type StoreType = ReturnType<typeof store.getState>;

const GameBoardComponent = () => {
  const boardState = useSelector((state: StoreType) => state.board.board);
  const dispatch = useDispatch<typeof store.dispatch>();
  return (
    <Container>
      <Paper variant="outlined">
        <div
          style={{
            backgroundColor: 'white',
            aspectRatio: (boardState.shape[0] / boardState.shape[1]).toString(),
            // width: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(${boardState.shape[1]}, 1fr)`,
            gridTemplateRows: `repeat(${boardState.shape[0]}, 1fr)`,
            // gap: '0',
            border: '2px black solid',
            margin: '5px',
            // padding: '0',
          }}
        >
          {boardState.state.flat().map((_, idx) => {
            const pos: Position = new Position(
              Math.floor(idx / boardState.shape[0]),
              idx % boardState.shape[1]
            );
            // eslint-disable-next-line react/no-array-index-key
            return <BoardCellComponent key={pos.toString()} position={pos} />;
          })}
        </div>
      </Paper>
      <div style={{ marginTop: '5px' }}>
        <ControllPanellComponent />
      </div>
    </Container>
  );
};

export default GameBoardComponent;
