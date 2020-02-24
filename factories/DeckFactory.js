const Card = require("../models/Card");
const Stack = require("../models/Stack");

const { shuffle } = require("../lib/ArrayUtils");
const { CARD_VALUES, SUIT_VALUES } = require("../lib/consts");

class DeckFactory {
  constructor() {}

  /**
   * Construct a new Stack of 52 cards
   * @returns {Stack}
   */
  constructNewDeck() {
    const deck = [];

    CARD_VALUES.forEach(card => {
      SUIT_VALUES.forEach(suit => {
        deck.push(new Card(suit, card));
      });
    });

    shuffle(deck);

    return new Stack(deck);
  }
}

module.exports = new DeckFactory();