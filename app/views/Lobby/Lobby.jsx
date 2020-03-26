import React, { useContext, useCallback, useEffect } from "react";
import Chance from "chance";

import { GameContext } from "../../contexts/GameContext";
import { useSocket } from "../../hooks";
import { useCookies } from "react-cookie";
import { useParams } from "react-router-dom";
import Button from "../../components/Button";

import "./Lobby.scss";

const Lobby = () => {
  const game = useContext(GameContext);
  const { id } = useParams();
  const socket = useSocket();

  const [cookies, setCookie] = useCookies(["shed-name"]);

  useEffect(() => {
    //get name, if none set a random animal name
    let name = cookies["shed-name"];

    if (!name) {
      name = Chance().animal();
      setCookie("shed-name", name, { path: "/" });
    }

    socket.emit("JOIN_GAME", { gameId: id, name });
  }, []);

  const startGame = useCallback(() => {
    // TODO: send socket message to start game
    socket.emit("START_GAME", { gameId: id });
  });

  return (
    <div className="lobby">
      <h2>Game {id}</h2>
      <h2>Players ({game.lobbyPlayers.length}/5)</h2>
      {game.lobbyPlayers.map(player => (
        <div className="lobby__player">{player.name}</div>
      ))}
      {game.me === game.activePlayer ? (
        <Button onClick={startGame}>Start Game</Button>
      ) : (
        <div class="lobby__waiting">Waiting for game to start...</div>
      )}
    </div>
  );
};

export default Lobby;
