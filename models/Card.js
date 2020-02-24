const { CARD_VALUES, SUIT_VALUES } = require("../lib/consts");

class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }

  /**
   * Compare the value of two cards.  a positive value shows that the input card is greater than the source card.
   * @param {Card} card card to compare
   * @return {number} different between two cards.
   */
  compareTo(card) {
    return (
      Object.keys(CARD_VALUES).indexOf(card.value) -
      Object.keys(CARD_VALUES).indexOf(this.value)
    );
  }

  toString() {
    return `${this.value}${this.suit}`;
  }
}

module.exports = Card;
