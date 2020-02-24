const Card = require("./Card");

class Hand {
  /**
   * Create a hand
   * @param {Array<Card>} cards
   */
  constructor(cards) {
    this.cards = cards || [];
  }

  /**
   * Add cards to the hand
   * @param {Array<Card>} cards array of cards to add
   */
  addCards(cards) {
    this.cards = [...this.cards, ...cards];
  }

  /**
   * Remove a card from the hand
   * @param {Card} card card to remove
   */
  removeCard(card) {
    let index = -1;

    for (var i = 0, l = this.cards.length; i < l; i++) {
      if (card === this.cards[i]) {
        index = i;
        break;
      }
    }

    if (index === -1) {
      return null;
    } else {
      return this.cards.splice(index, 1)[0];
    }
  }
}

module.exports = Hand;
