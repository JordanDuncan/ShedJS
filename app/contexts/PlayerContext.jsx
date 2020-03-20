import React, { useEffect, useState, useCallback, useRef } from "react";
import Player from "../models/Player";
import Card from "../models/Card";
import faker from "faker";
import io from "socket.io-client";

import { API_URL } from "../lib/config";

import { CARD_VALUES, SUIT_VALUES } from "../lib/consts";

const PlayerContext = React.createContext();

const PlayerContextProvider = ({ children }) => {
  const [gameId, setGameId] = useState(null);

  useEffect(() => {
    if (gameId) {
      socket.emit("JOIN_GAME", { gameId: gameId });
    }
  }, [gameId]);

  useEffect(() => {
    const socket = io(API_URL, { autoConnect: false });

    socket.on("HAND_STATE", data => {});

    socket.open();
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        // values
        gameId,
        // functions
        setGameId
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

const PlayerContextConsumer = PlayerContext.Consumer;

export { PlayerContextProvider, PlayerContextConsumer, PlayerContext };
