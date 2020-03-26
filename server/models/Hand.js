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
    this._sort();
  }

  /**
   * Remove a card from the hand
   * @param {Card} card card to remove
   */
  removeCard(card) {
    let index = -1;

    for (var i = 0, l = this.cards.length; i < l; i++) {
      if (card.id === this.cards[i].id) {
        index = i;
        break;
      }
    }

    if (index === -1) {
      return null;
    } else {
      this.cards.splice(index, 1);
      this._sort();
      return card;
    }
  }

  _sort() {
    this.cards = this.cards.sort((a, b) => b.compareTo(a));
  }
}

module.exports = Hand;
