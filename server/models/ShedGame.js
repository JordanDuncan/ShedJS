const DeckFactory = require("../factories/DeckFactory");
const Stack = require("../models/Stack");
const ShedPlayer = require("../models/ShedPlayer");
const Card = require("../models/Card");

const GameUtils = require("../lib/GameUtils");

const {
  CARD_VALUES,
  SUIT_VALUES,
  MOVE_VALUES,
  CARD_PROPERTY_VALUES
} = require("../lib/consts");

class ShedGame {
  /**
   * Create a new Shed game
   * @param {Array<string>} players Array of player names
   */
  constructor(id, players) {
    this.id = id;
    this.deck = DeckFactory.constructNewDeck(true);
    this.inPlay = new Stack();
    this.burn = new Stack();

    /** @type {Object.<string, ShedPlayer>} */
    this.players = {};
    this.playerList = [];

    players.forEach(playerName => {
      const player = new ShedPlayer(playerName);
      this.players[player.id] = player;
      this.playerList.push(player.id);
    });

    this.subscribers = [];

    this.cardsInHand = 3;

    /** @type {string?} */
    this.activePlayerId = null;

    this.playReversed = false;

    this._deal();
  }

  get activePlayer() {
    return this.players[this.activePlayerId];
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

        if (i < 6) {
          // if first 6 cards, put onto bottom layer
          player.bottomCards[i % 3].push(card);
        } else {
          // if this card is lower, make this player the new starter
          if (lowestCardPlayer.card.compareTo(card) < 0) {
            lowestCardPlayer = {
              card,
              player: playerName
            };
          }

          player.hand.addCards([card]);
        }
      });
    }

    // set starter player
    this.activePlayerId = lowestCardPlayer.player;

    this.sendGameStateToSubscribers();

    return this;
  }

  /**
   * After playing cards, check what should happen (burn, reverse, etc)
   * @param {Stack} inPlayStack stack representing in play pile
   * @param {Stack?} burnStack optional stack to burn cards to
   */
  checkInPlayState(inPlayStack, burnStack) {
    let moveValue = null;

    if (
      inPlayStack.top.value === "10" ||
      (inPlayStack.depth >= 4 &&
        inPlayStack.cards[0].value === inPlayStack.cards[1].value &&
        inPlayStack.cards[1].value === inPlayStack.cards[2].value &&
        inPlayStack.cards[2].value === inPlayStack.cards[3].value)
    ) {
      moveValue = MOVE_VALUES.BURN;
    }

    if (inPlayStack.top.property === CARD_PROPERTY_VALUES.REVERSE) {
      moveValue = MOVE_VALUES.REVERSE;
    }

    if (moveValue === MOVE_VALUES.REVERSE) {
      // reverse play order
      this.playReversed = true;
    }

    if (moveValue === MOVE_VALUES.BURN) {
      // burn
      if (burnStack) {
        burnStack.addCards(inPlayStack.cards);
      }

      inPlayStack.clear();

      // remove any reverse rule if burning deck
      this.playReversed = false;
    }

    return moveValue;
  }

  /**
   * Play cards onto the inPlay pile
   * @param {Array<Card>} cards cards to play in order
   * @returns {boolean}
   */
  playCards(cards) {
    // validate moves
    let fakeInPlay = new Stack().combine(this.inPlay);
    let validMove = true;

    // validate one by one with a fake "top" card
    // this will ensure all cards played in order are a legal move before
    // commiting it to the inplay pile
    cards.forEach(card => {
      if (!validMove) {
        return false;
      }

      const top = fakeInPlay.topVisible;

      if (top && card.property === null && top.compareTo(card) < 0) {
        validMove = false;
      } else {
        // commit card to the fake inplay pile
        fakeInPlay.addCards([card]);

        // run any post play behaviours (burn, flip)
        this.checkInPlayState(fakeInPlay);
      }
    });

    if (!validMove) {
      return false;
    }

    // add cards one by one
    let moveValue = null;
    cards.forEach(card => {
      this.inPlay.addCards([card]);
      this.checkInPlayState(this.inPlay, this.burn);
    });

    if (moveValue !== MOVE_VALUES.BURN) {
      this._nextPlayer();
    }

    this.sendGameStateToSubscribers();

    return true;
  }

  takeCardFromDeck(player) {
    if (this.deck.top) {
      const card = this.deck.takeTop();

      players[player].addCards([card]);
    }

    this.sendGameStateToSubscribers();
  }

  /**
   *
   * @param {ShedPlayer} player player to pick up in play pile
   */
  pickUpPlayPile(player, movePlayer) {
    player.hand.addCards(this.inPlay.cards);
    this.inPlay.clear();

    if (movePlayer) {
      this._previousPlayer();
    }

    this.sendGameStateToSubscribers();
  }

  burnPlayPile() {
    this.burn.combine(this.inPlay);
    this.inPlay.clear();

    this.sendGameStateToSubscribers();
  }

  _nextPlayer() {
    if (this.playReversed) {
      this._movePlayerBackward();
    } else {
      this._movePlayerForward();
    }

    this.sendGameStateToSubscribers();
  }

  _previousPlayer() {
    if (this.playReversed) {
      this._movePlayerForward();
    } else {
      this._movePlayerBackward();
    }

    this.sendGameStateToSubscribers();
  }

  _movePlayerForward() {
    const playerIndex = this.playerList.indexOf(this.activePlayerId);

    if (playerIndex === this.playerList.length - 1) {
      this.activePlayerId = this.playerList[0];
    } else {
      this.activePlayerId = this.playerList[playerIndex + 1];
    }

    this.sendGameStateToSubscribers();
  }

  _movePlayerBackward() {
    const playerIndex = this.playerList.indexOf(this.activePlayerId);

    if (playerIndex === 0) {
      this.activePlayerId = this.playerList[this.playerList.length - 1];
    } else {
      this.activePlayerId = this.playerList[playerIndex - 1];
    }

    this.sendGameStateToSubscribers();
  }

  get topVisible() {
    return this.inPlay.topVisible;
  }

  playerPlayCards(player, cards) {
    const cardsPlaying = cards.map(card => {
      return player.hand.removeCard(card);
    });

    const didPlay = this.playCards(cardsPlaying);

    // if play failed, return card to player
    if (didPlay) {
      if (this.deck.depth > 0) {
        player.hand.addCards([this.deck.takeTop()]);
      }
    } else {
      player.hand.addCards(cardsPlaying);
    }

    this.sendGameStateToSubscribers();
  }

  printGameState() {
    console.log("- Game State --------");
    console.log(`🔥 Burn Pile (${this.burn.depth} cards)`);
    console.log(`🃏 Deck (${this.deck.depth} cards)`);
    console.log(`🎯 In Play (${this.inPlay.depth} cards)`);

    if (this.inPlay.depth > 0) {
      console.log(`    Top Card: ${this.inPlay.top.toString()}`);
      console.log("");
    }

    console.log("");

    this.playerList.forEach(playerId => {
      const player = this.players[playerId];

      console.log(
        `${playerId === this.activePlayerId ? "✅" : "👨‍"} Player ${
          player.name
        } (${player.id})`
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

  /**
   * SOCKET CONNECTION METHODS
   */
  addSubscriber(socket) {
    this.subscribers.push(socket);
  }

  sendGameStateToSubscribers() {
    this.subscribers.forEach(subscriber => {
      subscriber.emit("GAME_STATE", GameUtils.getPublicGameStateFromGame(this));
    });
  }
}

module.exports = ShedGame;
