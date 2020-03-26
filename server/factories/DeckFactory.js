const Card = require("../models/Card");
const Stack = require("../models/Stack");

const { shuffle } = require("../lib/ArrayUtils");
const { CARD_VALUES, SUIT_VALUES } = require("../lib/consts");

class DeckFactory {
  constructor() {}

  /**
   * Construct a new Stack of 52 cards
   * @param {boolean} includeJokers should include 2 jokers in the deck
   * @returns {Stack}
   */
  constructNewDeck(includeJokers = false) {
    const deck = [];

    Object.values(CARD_VALUES).forEach(card => {
      // dont add jokers in this look, add later if desired
      if (card === CARD_VALUES.JOKER) {
        return;
      }

      Object.values(SUIT_VALUES).forEach(suit => {
        deck.push(new Card(suit, card, null, false));
      });
    });

    if (includeJokers) {
      deck.push(new Card(null, CARD_VALUES.JOKER, null, false));
      deck.push(new Card(null, CARD_VALUES.JOKER, null, false));
    }

    shuffle(deck);

    return new Stack(deck);
  }
}

module.exports = new DeckFactory();
