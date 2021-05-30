import { Grid } from '@material-ui/core';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import GameBoardComponent from './components/game_board';
import PositionHistoryComponent from './components/position_history';
import store from './redux/store';

type StoreType = ReturnType<typeof store.getState>;

const Hello = () => {
  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="stretch"
      style={{ paddingTop: '15px' }}
    >
      <Grid item xs={10} sm={7} lg={4}>
        <div style={{ textAlign: 'center' }}>
          <h1>RL Agent Board</h1>
        </div>
        <GameBoardComponent />
      </Grid>
      <Grid item xs={10} sm={5} lg={6}>
        <PositionHistoryComponent />
      </Grid>
    </Grid>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Provider store={store}>
          <Route path="/" component={Hello} />
        </Provider>
      </Switch>
    </Router>
  );
}
