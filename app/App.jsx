require("dotenv").config();

import React from "react";
import ReactDOM from "react-dom";
import Table from "./views/Table/Table";

import "./index.scss";
import { GameContextProvider } from "./contexts/GameContext";

const App = () => {
  return (
    <GameContextProvider>
      <Table />
    </GameContextProvider>
  );
};

let div = document.getElementById("app");

ReactDOM.render(<App />, div);
