import React, { useState, useCallback } from "react";

import "./Join.scss";
import Button from "../../components/Button";
import { useHistory, useParams } from "react-router-dom";

const Join = () => {
  const { id } = useParams();
  const [gameId, setGameId] = useState(id || "");
  const history = useHistory();

  const setGameIdSafely = (value) => {
    setGameId(value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
  }

  const joinGame = useCallback(() => {
    history.push(`/lobby/${gameId}`);
  }, [gameId]);

  const goToTable = useCallback(() => {
    history.push(`/table/${gameId}`);
  }, [gameId]);

  return (
    <div className="join">
      <h2>Join a Game</h2>
      <input
        type="text"
        className="join__input"
        placeholder="Game ID"
        value={gameId}
        onChange={e => setGameIdSafely(e.target.value)}
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
