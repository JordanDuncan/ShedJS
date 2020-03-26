const Chance = require("chance");

const Hand = require("./Hand");
const Card = require("./Card");
const Stack = require("./Stack");

/**
 *
 */
class ShedPlayer {
  /**
   * Represents a player in a game
   * @param {string} id id of player
   * @param {string} name name of player
   * @param {SocketIO.Socket} socket socket that player is connected on
   */
  constructor(id, name, socket) {
    this.id = id || Chance().guid();
    this.token = Chance().hash();
    this.name = name || Chance().name();
    this.socket = socket;
    this.status = "PENDING"; // PENDING, READY

    this.hand = new Hand();
    this.bottomCards = [[], [], []];
  }

  /**
   * Determine if a player is still in the game
   * player is in play if they have any cards in hand or on table
   */
  get inPlay() {
    let isInPlay = false;

    this.bottomCards.forEach(cardStack => {
      if (!isInPlay && cardStack.length > 0) {
        isInPlay = true;
      }
    });

    isInPlay = isInPlay || this.hand.cards.length > 0;

    return isInPlay;
  }

  /**
   * @typedef {Object} CanPlay
   * @property inHand {Array<Card>}
   * @property onTable {Array<Card>}
   */

  /**
   * Returns cards that the user can play at the current point
   * @returns {CanPlay}
   */
  get cardsCanPlay() {
    const canPlay = {
      inHand: this.hand.cards.map(card => {
        card.visible = true;
        return card;
      }), // in hand
      onTable: []
    };

    const validCardsOnTable = this.bottomCards.map(pile => {
      if (pile.length > 0) {
        return pile[0];
      } else {
        return 0;
      }
    });

    // TODO: REMOVE IF NOT DEBUG
    // canPlay.onTable = validCardsOnTable;

    if (canPlay.inHand.length > 0) {
      // if cards are in hand and theyre all the same, check if the same card exists on the bottom
      if (
        canPlay.inHand.length ===
        canPlay.inHand.filter(card => card.value === canPlay.inHand[0].value)
          .length
      ) {
        canPlay.onTable = validCardsOnTable.filter(
          card => card.value === canPlay.inHand[0].value
        );
      }
    } else {
      // if no cards in hand, add valid cards on table
      canPlay.onTable = validCardsOnTable;
    }

    return canPlay;
  }

  get validCards() {
    const canPlay = this.cardsCanPlay;

    return [...canPlay.inHand, ...canPlay.onTable].filter(card => !!card);
  }

  /**
   * remove a card from a player if its a valid card
   * @param {Card} card card to remove
   */
  removeCard(card) {
    const allCards = this.cardsCanPlay;

    // try getting card from hand
    let cardRemoved = this.hand.removeCard(card);

    if (cardRemoved) {
      return cardRemoved;
    }

    // it may be on the bottom cards
    allCards.onTable.forEach((cardOnTable, i) => {
      if (cardOnTable && card.id === cardOnTable.id) {
        cardRemoved = this.bottomCards[i].shift();
      }
    });

    return cardRemoved;
  }

  /**
   * checks if player can play on card
   * @param {Card} card top card
   * @returns {Boolean}
   */
  canPlayOn(card) {
    let canPlay = false;

    if (!card) {
      return false;
    }

    this.validCards.forEach(testCard => {
      if ((testCard && testCard.canPlayOn(card)) || !testCard.faceUp) {
        canPlay = true;
      }
    });

    return canPlay;
  }
}

module.exports = ShedPlayer;
