const DeckFactory = require("../factories/DeckFactory");
const Stack = require("../models/Stack");
const ShedPlayer = require("../models/ShedPlayer");
const Card = require("../models/Card");
const { CARD_VALUES, SUIT_VALUES, MOVE_VALUES } = require("../lib/consts");

class ShedGame {
  /**
   * Create a new Shed game
   * @param {Array<string>} players Array of player names
   */
  constructor(players) {
    this.deck = DeckFactory.constructNewDeck();
    this.inPlay = new Stack();
    this.burn = new Stack();

    /** @type {Object.<string, ShedPlayer>} */
    this.players = {};
    this.playerList = players;

    players.forEach(player => {
      this.players[player] = new ShedPlayer();
    });

    this.cardsInHand = 3;

    /** @type {string?} */
    this.activePlayer = null;

    this._deal();
  }

  _deal() {
    // choose how many cards per player
    // 6 for bottom layer, 3 for 5 players, 4 for 4 players, 5 for 3 or less players
    let numberOfPlayers = this.playerList.length;

    if (numberOfPlayers === 4) {
      this.cardsInHand = 4;
    } else if (numberOfPlayers <= 3) {
      this.cardsInHand = 5;
    }

    let cardsPerPlayer = 6 + this.cardsInHand;

    // keep track of lowest card so we know who gets to play first
    let lowestCardPlayer = {
      card: new Card("D", "A"),
      player: this.playerList[0]
    };

    for (let i = 0; i < cardsPerPlayer; i++) {
      this.playerList.forEach(playerName => {
        const player = this.players[playerName];
        const card = this.deck.takeTop();

        if (i < this.playerList.length * 2) {
          // if first 6 cards, put onto bottom layer
          player.bottomCards[i % this.playerList.length].push(card);
        } else {
          // if this card is lower, make this player the new starter
          if (lowestCardPlayer.card.compareTo(card) < 0) {
            lowestCardPlayer = {
              card,
              player: playerName
            };
          }

          // TODO: GET RID
          if (i === this.playerList.length * 2) {
            player.hand.addCards([
              new Card(SUIT_VALUES["CLUB"], CARD_VALUES["10"])
            ]);
          } else {
            player.hand.addCards([card]);
          }
        }
      });
    }

    // set starter player
    this.activePlayer = lowestCardPlayer.player;

    return this;
  }

  _checkInPlayState() {
    console.log(this.inPlay.top);
    if (
      this.inPlay.top.value === "10" ||
      (this.inPlay.depth >= 4 &&
        this.inPlay.cards[0].value === this.inPlay.cards[1].value &&
        this.inPlay.cards[1].value === this.inPlay.cards[2].value &&
        this.inPlay.cards[2].value === this.inPlay.cards[3].value)
    ) {
      // burn
      this.burn.addCards(this.inPlay.cards);
      this.inPlay = new Stack();
      return MOVE_VALUES.BURN;
    }

    return null;
  }

  playCards(cards) {
    this.inPlay.addCards(cards);
    const moveType = this._checkInPlayState();

    if (moveType !== MOVE_VALUES.BURN) {
      this._nextPlayer();
    }
  }

  takeCardFromDeck(player) {
    if (this.deck.top) {
      const card = this.deck.takeTop();

      players[player].addCards([card]);
    }
  }

  pickUpPlayPile(player) {
    this.hands[player].addCards(this.inPlay.cards);
    this.inPlay = new Stack();
  }

  burnPlayPile() {
    this.burn.combine(this.inPlay);
    this.inPlay = new Stack();
  }

  _nextPlayer() {
    const playerIndex = this.playerList.indexOf(this.activePlayer);

    if (playerIndex === this.playerList.length - 1) {
      this.activePlayer = this.playerList[0];
    } else {
      this.activePlayer = this.playerList[playerIndex + 1];
    }
  }

  printGameState() {
    console.log("- Game State --------");
    console.log(`🔥 Burn Pile (${this.burn.depth} cards)`);
    console.log(`🃏 Deck (${this.deck.depth} cards)`);
    console.log(`🎯 In Play (${this.inPlay.depth} cards)`);

    if (this.inPlay.depth > 0) {
      console.log(`    Top Card: ${this.inPlay.top.toString()}`);
    }

    console.log("");

    this.playerList.forEach(playerName => {
      const player = this.players[playerName];

      console.log(
        `👨‍🚀 Player ${playerName} ${
          playerName === this.activePlayer ? "✅ Active" : ""
        }`
      );
      console.log(
        `Hand: ${player.hand.cards.map(card => card.toString()).join(" ")}`
      );
      console.log(`Bottom Cards`);
      console.log(
        `${player.bottomCards[0][0]
          .toString()
          .padStart(4, " ")}${player.bottomCards[1][0]
          .toString()
          .padStart(4, " ")}${player.bottomCards[2][0]
          .toString()
          .padStart(4, " ")}`
      );
      console.log(
        `${player.bottomCards[0][1]
          .toString()
          .padStart(4, " ")}${player.bottomCards[1][1]
          .toString()
          .padStart(4, " ")}${player.bottomCards[2][1]
          .toString()
          .padStart(4, " ")}`
      );
      console.log("");
    });
  }
}

module.exports = ShedGame;
