import {
  Avatar,
  Box,
  Chip,
  Container,
  Grid,
  Input,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Paper,
  Slider,
  Tooltip,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BoardAction } from '../game_core/board_state';
import store from '../redux/store';
import { highlightPosition, clearPosition } from '../redux/ui_slice';
import Position from '../typedefs/position';
import ActionSummaryComponent from './action_summary';
import { CellAvatarComponent } from './board_cell';

type StoreType = ReturnType<typeof store.getState>;

const PositionHistoryComponent = () => {
  const iteration = useSelector((state: StoreType) => state.agent.iteration);
  const [selectedIteration, updateSelectedIteration] = useState(1);
  const [prevIter, updatePrevIter] = useState(iteration);
  if (prevIter !== iteration) {
    updateSelectedIteration(iteration);
    updatePrevIter(iteration);
  }
  const { reward, path } = useSelector(
    (state: StoreType) => state.agent.history[selectedIteration - 1]
  );
  const dispatch = useDispatch();
  const getAction = (pos1: Position, pos2: Position) => {
    if (pos1 === undefined || pos2 === undefined) return undefined;
    if (pos1.x - pos2.x === 1) return BoardAction.UP;
    if (pos1.x - pos2.x === -1) return BoardAction.DOWN;
    if (pos1.y - pos2.y === 1) return BoardAction.LEFT;
    if (pos1.y - pos2.y === -1) return BoardAction.RIGHT;
    return undefined;
  };
  // if(hist.length === 1)
  return (
    <Container style={{ paddingTop: '30px' }}>
      <Box>
        <Typography variant="h5" align="center">
          Position History
        </Typography>
        <Box>
          <Paper
            style={{
              maxHeight: '80vh',
              position: 'relative',
            }}
          >
            <Box padding="20px" paddingBottom={0}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs>
                  <Typography gutterBottom>Iteration:</Typography>
                </Grid>
                <Grid item xs>
                  <Input
                    value={selectedIteration}
                    margin="dense"
                    onChange={(e) => {
                      let n = Number(e.target.value);
                      n = Number.isNaN(n) ? 1 : n;
                      // eslint-disable-next-line no-nested-ternary
                      n = n < 1 ? 1 : n > iteration ? iteration : n;
                      updateSelectedIteration(n);
                    }}
                    inputProps={{
                      step: 1,
                      min: 1,
                      max: iteration,
                      type: 'number',
                      'aria-labelledby': 'input-slider',
                    }}
                  />
                </Grid>
              </Grid>
              <Grid item style={{ width: 'inherit' }}>
                <Slider
                  value={selectedIteration}
                  step={1}
                  min={1}
                  max={iteration}
                  onChange={(e, n) => updateSelectedIteration(n as number)}
                  valueLabelDisplay="auto"
                  aria-labelledby="input-slider"
                />
              </Grid>
            </Box>
            <hr style={{ margin: '0', marginBottom: '5px' }} />
            <Container>
              <Paper variant="outlined" style={{ padding: '5px' }}>
                <Typography>Steps: {path.length}</Typography>
                <Typography>Total Reward: {reward}</Typography>
              </Paper>
            </Container>
            <Box overflow="auto" maxHeight="60vh">
              <List>
                {path.map((e, idx) => {
                  const translatedPos = new Position(7 - e.x + 1, e.y + 1);
                  // eslint-disable-next-line react/no-array-index-key
                  return (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={idx}
                      onMouseEnter={() => dispatch(highlightPosition(e))}
                      onMouseLeave={() => dispatch(clearPosition(e))}
                    >
                      <Tooltip
                        title={
                          <ActionSummaryComponent
                            pos={e}
                            nextAction={
                              idx === path.length
                                ? undefined
                                : getAction(e, path[idx + 1])
                            }
                          />
                        }
                        placement="right"
                        interactive
                        arrow
                      >
                        <ListItem button>
                          <ListItemAvatar>
                            <CellAvatarComponent
                              type={
                                store.getState().board.board.state[e.x][e.y]
                              }
                            />
                          </ListItemAvatar>
                          <ListItemText
                            align="center"
                            primary={`${translatedPos.x}, ${translatedPos.y}`}
                          />
                          <ListItemIcon>
                            <Chip label={`Step: ${idx}`} />
                          </ListItemIcon>
                        </ListItem>
                      </Tooltip>
                    </div>
                  );
                })}
              </List>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default PositionHistoryComponent;
