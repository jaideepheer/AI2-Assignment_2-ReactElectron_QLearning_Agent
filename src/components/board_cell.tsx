/* eslint-disable react/require-default-props */
import { Avatar, Box, Tooltip, Typography } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import { red } from '@material-ui/core/colors';
import { BoardCell } from '../game_core/board_state';
import store from '../redux/store';
import Position from '../typedefs/position';
import GTPIcon from '../../assets/GtpIcon.svg';
import PowerIcon from '../../assets/PowerIcon.svg';
import RestartIcon from '../../assets/restart.png';

type PropsType = {
  position: Position;
};

type StoreType = ReturnType<typeof store.getState>;

export const CellAvatarComponent = ({ type }: { type: BoardCell }) => {
  switch (type) {
    case 'Goto Power Position': {
      return <Avatar alt="Goto Power Position" src={GTPIcon} />;
    }
    case 'Power Position': {
      return <Avatar alt="Power Position" src={PowerIcon} />;
    }
    case 'Goal': {
      return (
        <Avatar alt="Goal" style={{ backgroundColor: red[900] }}>
          G
        </Avatar>
      );
    }
    case 'Restart': {
      return <Avatar alt="Restart" src={RestartIcon} />;
    }
    case 'Start': {
      return <Typography align="center">Start</Typography>;
    }
    default: {
      return <></>;
    }
  }
};

export default function BoardCellComponent({ position }: PropsType) {
  const cellType = useSelector(
    (state: StoreType) => state.board.board.state[position.x][position.y]
  );
  const hasAgent = useSelector((state: StoreType) => {
    return state.agent.agentPosition.equals(position);
  });
  const isHighlighted = useSelector(
    (state: StoreType) =>
      state.ui.highlightedPositions.filter((e) => position.equals(e)).length > 0
  );
  let backColor = isHighlighted ? 'green' : '';
  const shape = null;
  switch (cellType) {
    case 'Wall':
      backColor = 'darkred';
      break;
    default:
  }
  // eslint-disable-next-line no-nested-ternary
  backColor = isHighlighted ? 'green' : hasAgent ? 'blue' : backColor;
  const borderColor = isHighlighted ? 'green' : 'black';
  return (
    <div
      style={{
        // aspectRatio: '1',
        border: `2px ${borderColor} solid`,
        padding: '2px',
        backgroundColor: backColor,
        objectFit: 'fill',
      }}
    >
      <Tooltip title={cellType.toString()}>
        <Box>
          <CellAvatarComponent type={cellType} />
        </Box>
      </Tooltip>
    </div>
  );
}

// export default connect(mapStateToProps)(BoardCellComponent);
