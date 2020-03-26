import React, { useEffect, useState, useCallback, useRef } from "react";
import Player from "../models/Player";
import Card from "../models/Card";
import faker from "faker";
import io from "socket.io-client";

import { API_URL } from "../lib/config";

import { CARD_VALUES, SUIT_VALUES } from "../lib/consts";
import { useSocket } from "../hooks";
import {
  useRouteMatch,
  useLocation,
  useHistory,
  useParams
} from "react-router-dom";
import { useCookies } from "react-cookie";

const PlayerContext = React.createContext();

const PlayerContextProvider = ({ children }) => {
  const [gameId, setGameId] = useState(null);
  const [status, setStatus] = useState(null);
  const [playerStatus, setPlayerStatus] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [activePlayer, setActivePlayer] = useState(null);
  const [cards, setCards] = useState([]);
  const [onTable, setOnTable] = useState([]);
  const [players, setPlayers] = useState({});
  const [playerPosition, setPlayerPosition] = useState(null);
  const [messages, setMessages] = useState([]);

  const [cookies, setCookies, removeCookies] = useCookies(["shed-token"]);

  let isOnHand = useRouteMatch("/hand/:id");
  const { id } = useParams("/hand/:id");
  const history = useHistory();

  const socket = useSocket();

  // useEffect(() => {
  //   if (gameId) {
  //     socket.emit("JOIN_GAME", { gameId: gameId });
  //   }
  // }, [gameId]);

  useEffect(() => {
    socket.on("HAND_STATE", data => {
      // if not on hand screen, redirect there
      if (!isOnHand && data.gameId && data.gameId !== gameId) {
        history.push(`/hand/${data.gameId}`);
      }

      if (data.gameId) {
        setGameId(data.gameId);
      }

      if (data.status) {
        setStatus(data.status);
      }

      if (data.playerId) {
        setPlayerId(data.playerId);
      }

      if (data.playerStatus) {
        setPlayerStatus(data.playerStatus);
      }

      if (data.players) {
        setPlayers(data.players);
      }

      if (data.activePlayer) {
        setActivePlayer(data.activePlayer);
      }

      if (data.cards) {
        setCards(data.cards);
      }

      if (data.onTable) {
        setOnTable(data.onTable);
      }

      if (data.playerPosition) {
        setPlayerPosition(data.playerPosition);
      }

      if (data.messages) {
        setMessages(data.messages);
      }

      if (data.token) {
        removeCookies("shed-token");
        setCookies("shed-token", data.token, { path: "/" });
      }
    });

    socket.open();

    // if has token in cookies, try to rejoin that game
    if (cookies["shed-token"] && isOnHand && isOnHand.params) {
      socket.emit("REJOIN_GAME", {
        gameId: isOnHand.params.id,
        token: cookies["shed-token"]
      });
    }
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        // values
        gameId,
        status,
        playerId,
        playerStatus,
        players,
        activePlayer,
        cards,
        onTable,
        playerPosition,
        messages,
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
