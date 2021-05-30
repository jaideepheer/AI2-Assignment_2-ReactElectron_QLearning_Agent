import React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  createStyles,
  IconButton,
  makeStyles,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';
import {
  InfoRounded,
  NavigateNext,
  PowerSettingsNew,
  Shuffle,
  SkipNext,
} from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import store from '../redux/store';
import ActionSummaryComponent, { HtmlTooltip } from './action_summary';
import { nextStep, reachGoal, nextIteration } from '../redux/agent_slice';
import { repositionGoal } from '../redux/board_slice';

type StoreType = ReturnType<typeof store.getState>;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
    },
    content: {
      flex: '1 0 auto',
    },
    cover: {
      width: '40%',
      alignSelf: 'center',
    },
    controls: {
      display: 'flex',
      alignItems: 'center',
      paddingLeft: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
    playIcon: {
      height: 38,
      width: 38,
    },
  })
);

export default function ControllPanellComponent() {
  const classes = useStyles();
  const dispatch = useDispatch<typeof store.dispatch>();
  const step = useSelector((state: StoreType) => state.agent.step);
  const pos = useSelector((state: StoreType) => state.agent.agentPosition);
  const nextAction = useSelector(
    (state: StoreType) => state.agent.agentInstance.recommendedAction
  );
  const iteration = useSelector((state: StoreType) => state.agent.iteration);
  const { reward: totalReward } = useSelector(
    (state: StoreType) => state.agent.history[iteration - 1]
  );
  const lr = useSelector((state: StoreType) => state.agent.learningRate);
  const discountFactor = useSelector(
    (state: StoreType) => state.agent.discountFactor
  );
  const atGoal = useSelector((state: StoreType) =>
    state.agent.agentPosition.equals(state.agent.goalPosition)
  );
  return (
    <Card className={classes.root}>
      <div className={classes.details}>
        <CardContent className={classes.content}>
          <Typography component="h5" variant="h5">
            Agent Controlls
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Iteration: {iteration}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Step: {step}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Reward Collected: {totalReward}
          </Typography>
          <HtmlTooltip
            arrow
            interactive
            placement="top-start"
            classes={{
              tooltip: makeStyles(() =>
                createStyles({ tt: { maxWidth: 'none' } })
              )().tt,
            }}
            title={
              <>
                <Typography variant="h6" color="inherit">
                  Agent Paramaters
                </Typography>
                <Typography variant="body1" color="inherit">
                  Learning Rate: {lr}
                </Typography>
                <Typography variant="body1" color="inherit">
                  Discount Factor: {discountFactor}
                </Typography>
                <Typography variant="body1" color="inherit">
                  Eploration Function:{' '}
                  <Typography variant="caption" color="inherit">
                    {`freq > 0 ? qValue * freq : qValue`}
                  </Typography>
                </Typography>
                <Typography variant="body1" color="inherit">
                  Reward Function:{' '}
                  <Typography variant="caption" color="inherit">
                    -1 * ManhattanDistance(curPos, goal)
                  </Typography>
                </Typography>
              </>
            }
          >
            <Typography variant="subtitle2" color="textSecondary">
              Paramaters: <InfoRounded />
            </Typography>
          </HtmlTooltip>
        </CardContent>
        {atGoal ? (
          <div className={classes.controls}>
            <Button onClick={() => dispatch(nextIteration())}>
              Start Next Iteration
            </Button>
          </div>
        ) : (
          <div className={classes.controls}>
            <Tooltip title="Restart Simulation">
              <IconButton
                aria-label="reset-simulation"
                onClick={() => window.location.reload()}
              >
                <PowerSettingsNew />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reposition Goal">
              <IconButton
                aria-label="relocate-goal"
                onClick={() => dispatch(repositionGoal())}
              >
                <Shuffle />
              </IconButton>
            </Tooltip>
            <Tooltip title="Next Step">
              <IconButton
                aria-label="next-step"
                onClick={() => dispatch(nextStep())}
              >
                <NavigateNext className={classes.playIcon} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reach Goal">
              <IconButton
                aria-label="reach-goal"
                onClick={() => dispatch(reachGoal())}
              >
                <SkipNext />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
      <CardMedia className={classes.cover}>
        <ActionSummaryComponent pos={pos} nextAction={nextAction} />
      </CardMedia>
    </Card>
  );
}
