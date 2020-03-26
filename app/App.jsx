import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import Home from "./views/Home/Home";
import Join from "./views/Join/Join";
import Lobby from "./views/Lobby/Lobby";
import Table from "./views/Table/Table";
import Hand from "./views/Hand/Hand";

import "./index.scss";
import { GameContextProvider } from "./contexts/GameContext";
import { PlayerContextProvider } from "./contexts/PlayerContext";

const App = () => {
  return (
    <BrowserRouter>
      <GameContextProvider>
        <PlayerContextProvider>
          <div className="table">
            <Switch>
              <Route path="/table/:id">
                <Table />
              </Route>
              <Route path="/hand/:id">
                <Hand />
              </Route>
              <Route path="/lobby/:id">
                <Lobby />
              </Route>
              <Route path="/join">
                <Join />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </div>
        </PlayerContextProvider>
      </GameContextProvider>
    </BrowserRouter>
  );
};

let div = document.getElementById("app");

ReactDOM.render(<App />, div);
