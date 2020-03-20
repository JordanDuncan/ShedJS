const {
  CARD_VALUES,
  SUIT_VALUES,
  CARD_PROPERTY_VALUES
} = require("../lib/consts");

const uuid = require("uuid/v4");

class Card {
  constructor(suit, value, id) {
    this.suit = suit;
    this.value = value;

    this.id = id || uuid();

    this.property = null;

    switch (value) {
      case CARD_VALUES["2"]:
        this.property = CARD_PROPERTY_VALUES.RESET;
        break;
      case CARD_VALUES["7"]:
        this.property = CARD_PROPERTY_VALUES.SKIP;
        break;
      case CARD_VALUES["10"]:
        this.property = CARD_PROPERTY_VALUES.BURN;
        break;
      case CARD_VALUES["JOKER"]:
        this.property = CARD_PROPERTY_VALUES.REVERSE;
        break;
    }
  }

  /**
   * Compare the value of two cards.  a positive value shows that the input card is greater than the source card.
   * @param {Card} card card to compare
   * @return {number} different between two cards.
   */
  compareTo(card) {
    return (
      Object.values(CARD_VALUES).indexOf(card.value) -
      Object.values(CARD_VALUES).indexOf(this.value)
    );
  }

  /**
   * Check if this card can be played on another one
   * @param {Card} card card to check if this can play
   * @returns {boolean}
   */
  canPlayOn(card) {
    if (this.property !== null) {
      return true;
    }

    return this.compareTo(card) <= 0;
  }

  toString() {
    return this.value !== CARD_VALUES["JOKER"]
      ? `${this.value}${this.suit}`
      : `JKR`;
  }
}

module.exports = Card;
