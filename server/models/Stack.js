const {
  CARD_VALUES,
  SUIT_VALUES,
  CARD_PROPERTY_VALUES
} = require("../lib/consts");

const Card = require("./Card");

class Stack {
  /**
   * Construct stack with cards
   * @param {Array<Card>} cards
   */
  constructor(cards) {
    /** @type {Array<Card>} */
    this.cards = cards || [];
  }

  /**
   * Add cards to stack
   * @param {Array<Card>} cards cards to add
   */
  addCards(cards) {
    this.cards = [...this.cards, ...cards];
  }

  get depth() {
    return this.cards.length;
  }

  /**
   * @return {Card}
   */
  get top() {
    return this.cards.length ? this.cards[this.cards.length - 1] : null;
  }

  /**
   * Get top card discarding any invisible cards
   * @return {Card}
   */
  get topVisible() {
    if (this.cards.length > 0) {
      for (let i = this.cards.length - 1; i >= 0; i--) {
        if (
          [CARD_PROPERTY_VALUES.SKIP, CARD_PROPERTY_VALUES.REVERSE].indexOf(
            this.cards[i].property
          ) === -1
        ) {
          return this.cards[i];
        }
      }
    }

    return null;
  }

  takeTop() {
    return this.cards.pop();
  }

  /**
   * combine two stacks into one
   * @param {Stack} stack stack to combine with current stack
   */
  combine(stack) {
    this.addCards(stack.cards);
    return this;
  }

  clear() {
    this.cards = [];
  }
}

module.exports = Stack;
