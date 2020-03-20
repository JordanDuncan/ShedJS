import React, { useEffect, useState, useCallback, useRef } from "react";
import Player from "../models/Player";
import Card from "../models/Card";
import faker from "faker";
import io from "socket.io-client";

import { API_URL } from "../lib/config";

import { CARD_VALUES, SUIT_VALUES } from "../lib/consts";

const GameContext = React.createContext();

const GameContextProvider = ({ children }) => {
  const [gameId, setGameId] = useState(null);
  const [gameToken, setGameToken] = useState(null);
  const [players, setPlayers] = useState([]);
  const [inPlay, setInPlay] = useState([]);
  const [burn, setBurn] = useState([]);
  const [deck, setDeck] = useState(false);

  console.log(API_URL);

  useEffect(() => {
    if (gameToken) {
      // create socket
    } else {
      // remove socket
    }
  }, [gameToken]);

  useEffect(() => {
    const socket = io(API_URL, { autoConnect: false });

    socket.on("GAME_STATE", data => {
      if (data.players) {
        setPlayers(Object.values(data.players));
      }

      if (data.burn) {
        setBurn(data.burn);
      }

      if ("deck" in data) {
        setDeck(data.deck);
      }

      if (data.inPlay) {
        setInPlay(data.inPlay);
      }
    });

    socket.open();

    socket.emit("SUBSCRIBE_TO_GAME", { gameId: "ABCD" });
  }, []);

  const playCard = useCallback(() => {
    let newPlayers = [...players];

    newPlayers[0].bottomCards[1] = null;

    setPlayers(newPlayers);
  });

  return (
    <GameContext.Provider
      value={{
        // values
        players,
        burn,
        deck,
        inPlay,
        // functions
        setGameId,
        setGameToken,
        playCard
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

const GameContextConsumer = GameContext.Consumer;

export { GameContextProvider, GameContextConsumer, GameContext };
