import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useContext
} from "react";
import Player from "../models/Player";
import Card from "../models/Card";
import faker from "faker";
import io from "socket.io-client";

import { CARD_VALUES, SUIT_VALUES } from "../lib/consts";
import { useSocket } from "../hooks";
import { useHistory } from "react-router-dom";

const GameContext = React.createContext();

const GameContextProvider = ({ children }) => {
  const socket = useSocket();

  const history = useHistory();

  const [gameId, setGameId] = useState(null);
  const [me, setMe] = useState(null);
  const [page, setPage] = useState(null); // LOBBY, TABLE, HAND
  const [status, setStatus] = useState("LOADING"); //LOADING, WAITING, ACTIVE
  const [players, setPlayers] = useState([]);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [inPlay, setInPlay] = useState([]);
  const [burn, setBurn] = useState([]);
  const [deck, setDeck] = useState(false);
  const [activePlayer, setActivePlayer] = useState(null);

  useEffect(() => {
    socket.on("GAME_STATE", data => {
      setPage("TABLE");

      if (data.id) {
        setGameId(data.id);
      }

      if (data.status) {
        setStatus(data.status);
      }

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

      if (data.activePlayer) {
        setActivePlayer(data.activePlayer);
      }
    });

    socket.on("LOBBY_STATE", data => {
      setPage("LOBBY");

      if (data.id) {
        setGameId(data.id);
      }

      if (data.activePlayer) {
        setActivePlayer(data.activePlayer);
      }

      if (data.players) {
        setLobbyPlayers(data.players);
      }

      if (data.me) {
        setMe(data.me);
      }
    });

    socket.on("REDIRECT", data => {
      if (data.path) {
        history.push(data.path);
      }
    });
  }, []);

  useEffect(() => {
    if (page === "LOBBY" && gameId) {
      history.push(`/lobby/${gameId}`);
    } else if (page === "TABLE" && gameId) {
      history.push(`/table/${gameId}`);
    }
  }, [page, gameId]);

  return (
    <GameContext.Provider
      value={{
        // values
        status,
        players,
        lobbyPlayers,
        burn,
        deck,
        inPlay,
        activePlayer,
        me,
        // functions
        setGameId
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

const GameContextConsumer = GameContext.Consumer;

export { GameContextProvider, GameContextConsumer, GameContext };
