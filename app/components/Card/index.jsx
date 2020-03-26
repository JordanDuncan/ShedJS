import React from "react";

import Heart from "../Icon/Heart";
import Diamond from "../Icon/Diamond";
import Club from "../Icon/Club";
import Spade from "../Icon/Spade";

import { SUIT_VALUES } from "../../lib/consts";

import "./Card.scss";

const ICON_WIDTH = 30;

/**
 *
 * @param {Object} props
 * @param {Card} props.card
 */
const Card = ({ card }) => {
  const isVisible = card && card.faceUp;

  return (
    <div
      className={`card ${!isVisible ? "card--facedown" : ""} ${
        isVisible &&
        [SUIT_VALUES.DIAMOND, SUIT_VALUES.HEART].indexOf(card.suit) > -1
          ? "card--red"
          : "card--black"
      }`}
    >
      {isVisible && (
        <>
          <div className="card__value">{card.value}</div>
          <div className="card__icon">
            {card.suit === SUIT_VALUES.HEART && <Heart width={ICON_WIDTH} />}
            {card.suit === SUIT_VALUES.DIAMOND && (
              <Diamond width={ICON_WIDTH} />
            )}
            {card.suit === SUIT_VALUES.CLUB && <Club width={ICON_WIDTH} />}
            {card.suit === SUIT_VALUES.SPADE && <Spade width={ICON_WIDTH} />}
          </div>
        </>
      )}
    </div>
  );
};

export default Card;
