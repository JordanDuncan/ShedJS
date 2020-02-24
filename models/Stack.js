const Card = require("./Card");

class Stack {
  /**
   * Construct stack with cards
   * @param {Array<Card>} cards
   */
  constructor(cards) {
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
    return this.cards.length ? this.cards[0] : null;
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
}

module.exports = Stack;
