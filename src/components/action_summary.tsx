import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  HighlightOff,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowUp,
  KeyboardArrowRight,
} from '@material-ui/icons';
import {
  Container,
  Paper,
  Theme,
  Tooltip,
  Typography,
  withStyles,
} from '@material-ui/core';
import store from '../redux/store';
import { BoardAction } from '../game_core/board_state';
import Position from '../typedefs/position';
import { QLearningStateActionHash } from '../game_core/QLearningAgent';

type StoreType = ReturnType<typeof store.getState>;

const ActionIconComponent = (action: BoardAction | null) => {
  switch (action) {
    case BoardAction.UP: {
      return <KeyboardArrowUp />;
    }
    case BoardAction.DOWN: {
      return <KeyboardArrowDown />;
    }
    case BoardAction.LEFT: {
      return <KeyboardArrowLeft />;
    }
    case BoardAction.RIGHT: {
      return <KeyboardArrowRight />;
    }
    default: {
      return <HighlightOff />;
    }
  }
};

export const HtmlTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

const ActionTooltip = (props: {
  slot: any;
  action: BoardAction;
  isAvailable: boolean;
  isRecommended: boolean;
  curPos: Position;
}) => {
  const { slot, action, curPos: pos, isRecommended, isAvailable } = props;
  const qValue = useSelector((state: StoreType) => {
    if (!isAvailable) return undefined;
    const hash = QLearningStateActionHash(pos, action);
    return state.agent.agentInstance.context.QValues.get(hash) || 0;
  });
  const freq = useSelector((state: StoreType) => {
    if (!isAvailable) return undefined;
    const hash = QLearningStateActionHash(pos, action);
    return state.agent.agentInstance.context.Frequencies.get(hash) || 0;
  });
  const exploration = useSelector((state: StoreType) => {
    if (qValue === undefined || freq === undefined) return undefined;
    return state.agent.explorationFunction(qValue, freq);
  });
  let placement = BoardAction[action].toLowerCase();
  if (placement === 'down') placement = 'bottom';
  if (placement === 'up') placement = 'top';
  return (
    <HtmlTooltip
      title={
        <>
          <Typography
            variant="h6"
            color="inherit"
          >{`Action: ${BoardAction[action]}`}</Typography>
          <Typography variant="caption" color="inherit">
            {
              // eslint-disable-next-line no-nested-ternary
              !isAvailable
                ? 'Unavailable'
                : isRecommended
                ? 'Recommended'
                : 'Available'
            }
          </Typography>
          {isAvailable ? (
            <Typography variant="body1" color="inherit">
              QValue: {qValue?.toPrecision(2)}
            </Typography>
          ) : (
            ''
          )}
          {isAvailable ? (
            <Typography variant="body1" color="inherit">
              Frequency: {freq?.toPrecision(2)}
            </Typography>
          ) : (
            ''
          )}
          {isAvailable ? (
            <Typography variant="body1" color="inherit">
              Exploration: {exploration?.toPrecision(2)}
            </Typography>
          ) : (
            ''
          )}
        </>
      }
      placement={placement}
      arrow
      interactive
    >
      {slot}
    </HtmlTooltip>
  );
};

// eslint-disable-next-line react/require-default-props
export default function ActionSummaryComponent({
  pos,
  nextAction,
}: {
  pos: Position;
  // eslint-disable-next-line react/require-default-props
  nextAction?: BoardAction;
}) {
  // const pos = useSelector((state: StoreType) => state.agent.agentPosition);
  const translatedPos = new Position(7 - pos.x + 1, pos.y + 1);
  const [tipOpen, updateTipOpen] = useState(false);
  const actions = useSelector((state: StoreType) =>
    state.board.board.getActions(pos)
  );
  const reward = useSelector((state: StoreType) =>
    state.agent.rewardFunction(pos)
  );
  const cellStyle: React.CSSProperties = {
    margin: '2px',
  };
  const genActionArrow = (action: BoardAction) => (
    <ActionTooltip
      action={action}
      curPos={pos}
      isRecommended={nextAction === action}
      isAvailable={actions.contains(action)}
      slot={
        <div
          style={{
            ...cellStyle,
            backgroundColor: nextAction === action ? 'green' : 'white',
          }}
        >
          {ActionIconComponent(actions.contains(action) ? action : null)}
        </div>
      }
    />
  );
  return (
    <Container>
      <Paper variant="outlined">
        <div
          style={{
            // backgroundColor: 'white',
            aspectRatio: '1',
            display: 'grid',
            // height: 'fit-content',
            // width: 'fit-content',
            gridTemplateColumns: `repeat(3, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(3, minmax(0, 1fr))`,
            alignItems: 'center',
            justifyItems: 'center',
            // border: '2px black solid',
          }}
        >
          <div style={cellStyle} />
          {genActionArrow(BoardAction.UP)}
          <div style={cellStyle} />
          {genActionArrow(BoardAction.LEFT)}
          <div
            style={cellStyle}
          >{`${translatedPos.x}, ${translatedPos.y}`}</div>
          {genActionArrow(BoardAction.RIGHT)}
          <div style={cellStyle} />
          {genActionArrow(BoardAction.DOWN)}
          <div style={cellStyle} />
        </div>
      </Paper>
      {reward !== undefined ? (
        <Typography align="center">Reward: {reward}</Typography>
      ) : (
        ''
      )}
    </Container>
  );
}
