import React, { useContext, useEffect, useState, useCallback } from "react";
import { PlayerContext } from "../../contexts/PlayerContext";
import { useSocket } from "../../hooks";
import { useParams } from "react-router-dom";
import Card from "../../components/Card";

import "./Hand.scss";
import Button from "../../components/Button";

const Hand = () => {
  const game = useContext(PlayerContext);
  const socket = useSocket();
  const { id } = useParams();
  const [selectedCards, setSelectedCards] = useState([]);

  useEffect(() => {
    if (id) {
      socket.emit("REFRESH_HAND_STATE", { gameId: id });
    }
  }, [id]);

  const toggleCardInSelectedCards = useCallback(
    cardId => {
      if (selectedCards.indexOf(cardId) === -1) {
        // check it matches before allowing select
        if (game.status === "ACTIVE") {
          const cards = [...game.cards, ...game.onTable];

          const card = cards.filter(card => card.id === cardId)[0];
          const selectedCardObjects = cards.filter(
            card => selectedCards.indexOf(card.id) > -1
          );

          if (
            selectedCardObjects.length > 0 &&
            selectedCardObjects[0].value !== card.value
          ) {
            return false;
          }
        }

        setSelectedCards([...selectedCards, cardId]);
      } else {
        let newSelectedCards = [...selectedCards];
        newSelectedCards.splice(newSelectedCards.indexOf(cardId), 1);
        setSelectedCards(newSelectedCards);
      }
    },
    [selectedCards]
  );

  const playSelectedCards = useCallback(() => {
    if (game.status === "DEALT" && selectedCards.length === 3) {
      socket.emit("PLACE_CARDS", { gameId: id, cardIds: selectedCards });
    } else {
      socket.emit("PLAY_CARD", { gameId: id, cardIds: selectedCards });
    }
    setSelectedCards([]);
  }, [selectedCards]);

  const renderCards = useCallback(
    (cards = []) => {
      return cards
        .filter(card => !!card)
        .map(card => (
          <div
            className={`hand__card ${selectedCards.indexOf(card.id) > -1 ? "hand__card--selected" : ""
              }`}
            onClick={() => toggleCardInSelectedCards(card.id)}
          >
            <Card card={card} />
          </div>
        ));
    },
    [selectedCards]
  );

  let message = "";

  if (game.playerPosition) {
    message = `You're out! #${game.playerPosition}`;
  } else if (game.status === "DEALT") {
    if (game.playerStatus === "READY") {
      message = "Waiting for other players...";
    } else {
      message = "Select 3 cards to go on the table";
    }
  } else if (game.status === "ACTIVE") {
    if (game.playerId === game.activePlayer) {
      message = "You are playing...";
    } else if (game.activePlayer) {
      message = `${game.players[game.activePlayer].name} is playing...`;
    }
  }

  return (
    <div className="hand">
      <div class="hand__status">
        <div class="hand__message">{message}</div>
        <div class="hand__id">{game.gameId}</div>
      </div>
      <div
        className={`hand__cards ${game.status === "ACTIVE" && game.playerId !== game.activePlayer
          ? "hand__cards--inactive"
          : ""
          }`}
      >
        <div className="hand__cards-inner">
          {!game.playerPosition ? (
            <>
              <div className="hand__cards-pile">{renderCards(game.cards)}</div>
              {game.onTable.length > 0 ? (
                <div className="hand__cards-pile hand__cards-pile--table">
                  {renderCards(game.onTable)}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
      <Button
        disabled={
          selectedCards.length === 0 ||
          (game.status === "ACTIVE" && game.playerId !== game.activePlayer)
        }
        onClick={playSelectedCards}
      >
        Play
      </Button>
      <div className="hand__messages">
        {game.messages.map((message, i) => (
          <div key={`message_${i}`} className="hand__message">
            {message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hand;
