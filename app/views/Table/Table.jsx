import React, { useContext } from "react";

import Card from "../../components/Card";

import { GameContext } from "../../contexts/GameContext";

import "./Table.scss";

const Table = () => {
  const game = useContext(GameContext);

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

  return (
    <div className="table">
      <div className="table__hoz table--top">
        {playerSections[0].map(player => (
          <div className="player" key={player.id}>
            {player.name}
            <div className="player__bottom-cards">
              {(player.bottomCards || []).map((card, i) => (
                <Card key={`${player.id}_${i}`} card={card} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="table__hoz table--bottom">
        {playerSections[1].map(player => (
          <div className="player" key={player.id}>
            {player.name}
            <div className="player__bottom-cards">
              {(player.bottomCards || []).map((card, i) => (
                <Card key={`${player.id}_${i}`} card={card} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="table__ver table--left">
        {playerSections[2].map(player => (
          <div className="player" key={player.id}>
            {player.name}
            <div className="player__bottom-cards">
              {(player.bottomCards || []).map((card, i) => (
                <Card key={`${player.id}_${i}`} card={card} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="table__ver table--right">
        {playerSections[3].map(player => (
          <div className="player" key={player.id}>
            {player.name}
            <div className="player__bottom-cards">
              {(player.bottomCards || []).map((card, i) => (
                <Card key={`${player.id}_${i}`} card={card} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        className={`table__card table__deck ${
          game.deck ? "table__card--hascard" : ""
        }`}
      ></div>
      <div className={`table__card table__inplay`}>
        {game.inPlay && game.inPlay.length > 0 && (
          <Card card={game.inPlay[game.inPlay.length - 1]} />
        )}
      </div>

      <div
        className={`table__card table__burn ${
          game.burn && game.burn.length > 0 ? "table__card--hascard" : ""
        }`}
      ></div>
    </div>
  );
};

export default Table;
