import React, { useState, useCallback } from "react";

import "./Join.scss";
import Button from "../../components/Button";
import { useHistory } from "react-router-dom";
import { useSocket } from "../../hooks";
import { useCookies } from "react-cookie";

const Join = () => {
  const [gameId, setGameId] = useState("");
  const history = useHistory();
  const socket = useSocket();
  const [cookies] = useCookies(["shed-name"]);

  const joinGame = useCallback(() => {
    // socket.emit("JOIN_GAME", { gameId: gameId, name: cookies["shed-name"] });
    history.push(`/lobby/${gameId}`);
  }, [gameId]);

  const goToTable = useCallback(() => {
    history.push(`/table/${gameId}`);
  }, [gameId]);

  const validGameId = true;

  return (
    <div className="join">
      <h2>Join a Game</h2>
      <input
        type="text"
        className="join__input"
        placeholder="Game ID"
        value={gameId}
        onChange={e => setGameId(e.target.value)}
      ></input>
      <div className="join__buttons">
        <Button disabled={!gameId} onClick={joinGame}>
          Play
        </Button>
        <Button disabled={!gameId} onClick={goToTable}>
          Watch
        </Button>
      </div>
    </div>
  );
};

export default Join;
