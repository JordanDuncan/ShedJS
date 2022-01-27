import React, { useCallback, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { useCookies } from "react-cookie";

import Button from "../../components/Button";

import "./Home.scss";
import { useSocket } from "../../hooks";

const Home = () => {
  let history = useHistory();

  const [cookies, setCookie] = useCookies(["shed-name"]);

  const socket = useSocket();

  const [name, setName] = useState(cookies["shed-name"] || "");
  const [waitingForGame, setWaitingForGame] = useState(false);

  useEffect(() => {
    if (waitingForGame) {
      socket.emit("CREATE_GAME", { name });
    }

    socket.on("CREATED_GAME", data => {
      if (waitingForGame) {
        setWaitingForGame(false);

        // game we requestred has been created, join it.
        // GameContext will pick it up from here
        history.push(`/join/${data.id}`);
      }
    });
  }, [waitingForGame]);

  useEffect(() => {
    if (cookies["shed-name"]) {
      setName(cookies["shed-name"]);
    }
  }, [cookies["shed-name"]]);

  useEffect(() => {
    if (name) {
      setCookie("shed-name", name, { path: "/" });
    }
  }, [name]);

  const createGame = useCallback(() => {
    setWaitingForGame(true);
  }, [name]);

  const goToJoin = useCallback(() => {
    history.push("/join");
  }, []);

  return (
    <div class="home">
      <h2>Vidatec Shed</h2>
      <input
        type="text"
        className="join__input"
        placeholder="Your Name"
        value={name}
        onChange={e => setName(e.target.value)}
      ></input>

      <Button onClick={createGame} disabled={!name}>
        Create Game
      </Button>
      <Button onClick={goToJoin} disabled={!name}>
        Join Game
      </Button>
    </div>
  );
};

export default Home;
