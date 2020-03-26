import React, { useContext, useCallback, useEffect } from "react";

import Card from "../../components/Card";
import CardModel from "../../models/Card";

import { CARD_PROPERTY_VALUES } from "../../lib/consts";

import { GameContext } from "../../contexts/GameContext";

import "./Table.scss";
import { useParams } from "react-router-dom";
import { useSocket } from "../../hooks";

const Table = () => {
  const game = useContext(GameContext);
  const { id } = useParams();

  const socket = useSocket();

  // split players into 4 sections depending on how many there are
  const playerSections = [
    [], // top
    [], // bottom
    [], // left
    [] // right
  ];

  (game.players || []).forEach((player, i) => {
    playerSections[i % 4].push(game.players[i % 4]);
  });

  const renderPlayer = useCallback(
    player => (
      <div
        className={`player ${
          player.status === "PENDING" ? "player--waiting" : ""
        }`}
        key={player.id}
      >
        {player.name} {player.status === "PENDING" ? "(Waiting)" : ""}
        {player.id === game.activePlayer ? " ✅" : ""}
        <div className="player__bottom-cards">
          {(player.bottomCards || []).map((card, i) => (
            <Card key={`${player.id}_${i}`} card={card} />
          ))}
        </div>
      </div>
    ),
    [game.activePlayer]
  );

  useEffect(() => {
    // when id changes, connect to game
    if (id) {
      game.setGameId(id.toLocaleUpperCase());
    }
  }, [id]);

  useEffect(() => {
    socket.emit("SUBSCRIBE_TO_GAME", { gameId: id });
    // create socket
    return () => {
      socket.emit("UNSUBSCRIBE_FROM_GAME", { gameId: id });
    };
  }, [id]);

  if (game.status === "LOADING") {
    return <h2>Loading game {id}</h2>;
  }

  const renderInPlay = () => {
    // if no in play, render nothing
    if (!(game.inPlay && game.inPlay.length > 0)) {
      return null;
    }

    /** @type {CardModel} */
    const topCard = game.inPlay[game.inPlay.length - 1];

    if (
      [CARD_PROPERTY_VALUES.SKIP, CARD_PROPERTY_VALUES.REVERSE].indexOf(
        topCard.property
      ) > -1
    ) {
      // if card is see-through, get the next valid card
      let cardIndex = game.inPlay.length - 2;
      let nextValidCard = cardIndex >= 0 ? game.inPlay[cardIndex] : null;

      while (
        !(
          nextValidCard &&
          [CARD_PROPERTY_VALUES.SKIP, CARD_PROPERTY_VALUES.REVERSE].indexOf(
            nextValidCard.property
          ) === -1
        ) &&
        cardIndex >= 0
      ) {
        nextValidCard = game.inPlay[cardIndex];
        cardIndex--;
      }

      // we should now have a valid card here or null

      return (
        <>
          <Card card={nextValidCard} />
          <div className="table__card--overlay">
            <Card card={topCard} />
          </div>
        </>
      );
    } else {
      return <Card card={topCard} />;
    }
  };

  if (game.state === "COMPLETE") {
    // get array of player names in order
    const names = Object.keys(game.playersOut || {}).map(id => null);

    Object.keys(game.playersOut || {}).forEach(id => {
      names[game.playersOut[id]] = game.players[id].name;
    });

    return (
      <>
        <h2>Game Complete!</h2>
        {/* {names.map((name, i) => (
          <p>
            {i + 1}: <b>{name}</b>
          </p>
        ))} */}
      </>
    );
  }

  return (
    <>
      <div className="table__hoz table--top">
        {playerSections[0].map(renderPlayer)}
      </div>
      <div className="table__hoz table--bottom">
        {playerSections[1].map(renderPlayer)}
      </div>
      <div className="table__ver table--left">
        {playerSections[2].map(renderPlayer)}
      </div>
      <div className="table__ver table--right">
        {playerSections[3].map(renderPlayer)}
      </div>
      <div className="table__card-container">
        <div className="table__card-title">Deck</div>
        <div
          className={`table__card table__deck ${
            game.deck ? "card--facedown" : ""
          }`}
        ></div>
        <div className="table__card-value">{game.deck || 0}</div>
      </div>
      <div className="table__card-container">
        <div className="table__card-title">In Play</div>
        <div className={`table__card table__inplay`}>{renderInPlay()}</div>
        <div className="table__card-value">{(game.inPlay || []).length}</div>
      </div>
      <div className="table__card-container">
        <div className="table__card-title">Burn</div>
        <div
          className={`table__card table__burn ${
            game.burn && game.burn.length > 0 ? "card--facedown" : ""
          }`}
        ></div>
        <div className="table__card-value">{(game.burn || []).length}</div>
      </div>
    </>
  );
};

export default Table;
