const DeckFactory = require("../factories/DeckFactory");
const Stack = require("../models/Stack");
const ShedPlayer = require("../models/ShedPlayer");
const Card = require("../models/Card");

const GameUtils = require("../lib/GameUtils");
const logger = require("../lib/Logger");

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
    this.internalStatus = "WAITING"; // WAITING, DEALT, ACTIVE, COMPLETE

    this.deck = DeckFactory.constructNewDeck(true);
    this.inPlay = new Stack();
    this.burn = new Stack();

    /** @type {Object.<string, ShedPlayer>} */
    this.players = {};
    this.playerList = [];

    this.messages = [];

    this.subscribers = [];

    this.cardsInHand = 3;

    this.playersOut = {};

    /** @type {string?} */
    this.activePlayerId = null;

    this.playReversed = false;

    this.lastMoveTime = Date.now();

    if (players) {
      players.forEach(playerName => {
        this.addPlayer(null, playerName);
      });

      this.deal();
    }
  }

  set status(status) {
    logger.info(`Setting game ${this.id} status to ${status}`);
    this.internalStatus = status;
  }

  get status() {
    return this.internalStatus;
  }

  addPlayer(id, name, socket) {
    const matchingSockets = Object.values(this.players).filter(
      player => player.socket.id === socket.id
    );

    if (matchingSockets.length === 0) {
      const player = new ShedPlayer(id, name, socket);
      this.players[player.id] = player;
      this.playerList.push(player.id);
    }
  }

  /**
   * Deal to start the game
   * Call once all players are in
   */
  deal() {
    logger.info(`Trying to deal game ${this.id}`);
    console.log(this.status);
    if (this.status === "WAITING") {
      logger.info(`Dealing game ${this.id}`);
      this._deal();
      this.status = "DEALT";
    }
  }

  /**
   * setup bottom cards for player, assume cards are already valid
   * @param {ShedPlayer} player player to setup
   * @param {Array<Card>} cards
   */
  placeBottomCardsForPlayer(player, cards) {
    if (this.status === "DEALT") {
      // do the do
      /** @type {Array<Card>} */
      const allPlayersCards = [...player.hand.cards];

      const newBottomCards = [];

      player.bottomCards.forEach(cardPile => {
        allPlayersCards.push(cardPile[0]);
      });

      cards.forEach((card, cardIndex) => {
        // blank out bottom cards from all cards array
        for (let i = 0, l = allPlayersCards.length; i < l; i++) {
          if (allPlayersCards[i] && card.id === allPlayersCards[i].id) {
            allPlayersCards[i] = null;
          }
        }

        player.bottomCards[cardIndex][0] = card;
      });

      player.hand.cards = allPlayersCards.filter(card => !!card);

      player.status = "READY";

      // if this is the last player to get ready, set game active
      let allPlayersReady = true;

      Object.values(this.players).forEach(player => {
        if (player.status === "PENDING") {
          allPlayersReady = false;
        }
      });

      if (allPlayersReady) {
        this.status = "ACTIVE";
      }

      this.sendGameStateToPlayers();
      this.sendGameStateToSubscribers();
    }
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

        card.visible = true;

        if (i < 6) {
          // if first 3 cards, mark as face down
          if (i >= 3) {
            card.visible = false;
          }

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
    this.sendGameStateToPlayers();

    return this;
  }

  /**
   * After playing cards, check what should happen (burn, reverse, etc)
   * @param {Stack} inPlayStack stack representing in play pile
   * @param {Stack?} burnStack optional stack to burn cards to
   */
  checkInPlayState(inPlayStack, burnStack) {
    let moveValue = null;
    let inPlayTop = inPlayStack.cards.length - 1;

    if (
      inPlayStack.top.value === "10" ||
      (inPlayStack.cards.length >= 4 &&
        inPlayStack.cards[inPlayTop].value ===
          inPlayStack.cards[inPlayTop - 1].value &&
        inPlayStack.cards[inPlayTop - 1].value ===
          inPlayStack.cards[inPlayTop - 2].value &&
        inPlayStack.cards[inPlayTop - 2].value ===
          inPlayStack.cards[inPlayTop - 3].value)
    ) {
      moveValue = MOVE_VALUES.BURN;
    } else if (inPlayStack.top.property === CARD_PROPERTY_VALUES.REVERSE) {
      moveValue = MOVE_VALUES.REVERSE;
    }

    if (moveValue === MOVE_VALUES.REVERSE && burnStack) {
      // reverse play order
      this.playReversed = !this.playReversed;
      this.postMessage("Joker played, play direction reversed!");
    }

    if (moveValue === MOVE_VALUES.BURN) {
      // burn

      if (burnStack) {
        this.postMessage(
          `${this.activePlayer.name} burned ${this.inPlay.cards.length} card${
            this.inPlay.cards.length > 1 ? "s" : ""
          }`
        );
        burnStack.addCards(inPlayStack.cards);

        // remove any reverse rule if burning deck
        this.playReversed = false;
      }

      inPlayStack.clear();
    }

    return moveValue;
  }

  /**
   * Play cards onto the inPlay pile
   * @param {Array<Card>} cards cards to play in order
   * @returns {boolean}
   */
  playCards(cards) {
    this.lastMoveTime = Date.now();

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
      card.visible = true;
      this.inPlay.addCards([card]);
      moveValue = this.checkInPlayState(this.inPlay, this.burn);
    });

    if (moveValue !== MOVE_VALUES.BURN) {
      this._nextPlayer();
    } else {
      this.playReversed = false;
    }

    this.sendGameStateToSubscribers();
    this.sendGameStateToPlayers();

    return true;
  }

  takeCardFromDeck(player) {
    if (this.deck.top) {
      const card = this.deck.takeTop();

      card.visible = true;

      players[player].addCards([card]);
    }

    this.sendGameStateToSubscribers();
    this.sendGameStateToPlayers();
  }

  /**
   *
   * @param {ShedPlayer} player player to pick up in play pile
   */
  pickUpPlayPile(player, movePlayer) {
    player.hand.addCards(this.inPlay.cards);

    this.postMessage(
      `${player.name} picked up ${this.inPlay.cards.length} card${
        this.inPlay.cards.length > 1 ? "s" : ""
      }`
    );

    this.inPlay.clear();

    if (movePlayer) {
      this._previousPlayer();
    }

    this.sendGameStateToSubscribers();
    this.sendGameStateToPlayers();
  }

  burnPlayPile() {
    this.burn.combine(this.inPlay);
    this.burn.cards.forEach(card => {
      card.visible = false;
    });

    this.inPlay.clear();

    this.playReversed = false;

    this.sendGameStateToSubscribers();
    this.sendGameStateToPlayers();
  }

  get canCurrentPlayerPlay() {
    if (this.inPlay.topVisible) {
      return this.activePlayer.canPlayOn(this.inPlay.topVisible);
    } else {
      return true;
    }
  }

  _nextPlayer() {
    if (this.playReversed) {
      this._movePlayerBackward();
    } else {
      this._movePlayerForward();
    }

    if (!this.canCurrentPlayerPlay) {
      this.pickUpPlayPile(this.activePlayer, true);
    }

    this.sendGameStateToSubscribers();
    this.sendGameStateToPlayers();
  }

  _previousPlayer() {
    if (this.playReversed) {
      this._movePlayerForward();
    } else {
      this._movePlayerBackward();
    }

    this.sendGameStateToSubscribers();
    this.sendGameStateToPlayers();
  }

  _movePlayerForward() {
    const currentPlayer = this.activePlayerId;
    let movingToPlayer = this.activePlayerId;

    let hasStartedSearch = false;

    while (!hasStartedSearch || currentPlayer !== movingToPlayer) {
      hasStartedSearch = true;

      const playerIndex = this.playerList.indexOf(movingToPlayer);

      if (playerIndex === this.playerList.length - 1) {
        movingToPlayer = this.playerList[0];
      } else {
        movingToPlayer = this.playerList[playerIndex + 1];
      }

      if (this.players[movingToPlayer].inPlay) {
        this.activePlayerId = movingToPlayer;
        this.sendGameStateToSubscribers();
        this.sendGameStateToPlayers();
        return true;
      }
    }

    // if we've broken out the while loop, no players are left, end the game
    this.endGame();
  }

  _movePlayerBackward() {
    const currentPlayer = this.activePlayerId;
    let movingToPlayer = this.activePlayerId;

    let hasStartedSearch = false;

    while (!hasStartedSearch || currentPlayer !== movingToPlayer) {
      hasStartedSearch = true;

      const playerIndex = this.playerList.indexOf(movingToPlayer);

      if (playerIndex === 0) {
        movingToPlayer = this.playerList[this.playerList.length - 1];
      } else {
        movingToPlayer = this.playerList[playerIndex - 1];
      }

      if (this.players[movingToPlayer].inPlay) {
        this.activePlayerId = movingToPlayer;
        this.sendGameStateToPlayers();
        this.sendGameStateToSubscribers();
        return true;
      }
    }

    // if we've broken out the while loop, no players are left, end the game
    this.endGame();
  }

  get topVisible() {
    return this.inPlay.topVisible;
  }

  /**
   * play cards on behalf of player
   * @param {ShedPlayer} player
   * @param {Array<Card>} cards cards to play
   */
  playerPlayCards(player, cards) {
    if (player.id !== this.activePlayerId) {
      return false;
    }

    const cardsPlaying = cards.map(card => {
      return player.removeCard(card);
    });

    const didPlay = this.playCards(cardsPlaying);

    if (didPlay) {
      if (player.hand.cards.length < this.cardsInHand) {
        const cardsToTake = [];

        for (let i = 0, l = cardsPlaying.length; i < l; i++) {
          if (this.deck.depth > 0) {
            cardsToTake.push(this.deck.takeTop());
          }
        }

        player.hand.addCards(cardsToTake);
      }

      // if the player is no longer in play, add them to the playersOut array
      if (!player.inPlay && !this.playersOut[player.id]) {
        this.playersOut[player.id] = Object.keys(this.playersOut).length + 1;

        // if theres only one player left, they're now out too, game is over
        const playersIn = Object.values(this.players).filter(
          playerToTest => playerToTest.inPlay
        );

        if (playersIn.length === 1) {
          const loser = playersIn[0];
          this.playersOut[playersIn[0].id] =
            Object.keys(this.playersOut).length + 1;
          this.status = "COMPLETE";
        } else if (!this.activePlayer.inPlay) {
          this._previousPlayer();
        }
      }
    } else {
      // if play failed, return card to player
      player.hand.addCards(cardsPlaying);

      // if was a face down card, player has to pick up the pile
      if (cardsPlaying.length === 1 && !cardsPlaying[0].faceUp) {
        this.pickUpPlayPile(player, true);
      }
    }

    this.sendGameStateToPlayers();
    this.sendGameStateToSubscribers();
  }

  getPlayerFromSocketId(socketId) {
    for (let i = 0, l = this.playerList.length; i < l; i++) {
      if (this.players[this.playerList[i]].socket.id === socketId) {
        return this.players[this.playerList[i]];
      }
    }

    return null;
  }

  endGame() {
    // do end game operations
    this.status = "COMPLETE";
    this.sendGameStateToPlayers();
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

    // send the current game state
    socket.emit("GAME_STATE", GameUtils.getPublicGameStateFromGame(this));
  }

  sendGameStateToSubscribers() {
    this.subscribers.forEach(subscriber => {
      subscriber.emit("GAME_STATE", GameUtils.getPublicGameStateFromGame(this));
    });
  }

  sendGameStateToPlayers() {
    const messagesToSend = this.messages;

    Object.values(this.players).forEach(player => {
      if (player.socket) {
        let cards = player.cardsCanPlay;

        if (this.status === "DEALT" && player.status !== "READY") {
          // also add 3 bottom cards to allow player to pick
          player.bottomCards.forEach(cardPile => {
            cards.onTable.push(cardPile[0]);
          });
        }

        player.socket.emit("HAND_STATE", {
          gameId: this.id,
          status: this.status,
          playerId: player.id,
          playerStatus: player.status,
          token: player.token,
          players: this.publicPlayers,
          activePlayer: this.activePlayerId,
          cards: cards.inHand,
          onTable: cards.onTable,
          playerPosition: this.playersOut[player.id] || null,
          messages: messagesToSend
        });
      }
    });
  }

  rejoinPlayer(token, socket) {
    Object.values(this.players).forEach(player => {
      console.log(token, player.token);
      if (player.token === token) {
        player.socket = socket;

        this.sendGameStateToPlayers();
        this.sendGameStateToSubscribers();
      }
    });
  }

  get publicPlayers() {
    const pubPlayers = {};

    this.playerList.forEach(playerId => {
      pubPlayers[playerId] = {
        id: playerId,
        name: this.players[playerId].name,
        inPlay: this.players[playerId].inPlay
      };
    });

    return pubPlayers;
  }

  postMessage(message) {
    this.messages.unshift(message);

    if (this.messages.length > 10) {
      this.messages.shift();
    }
  }
}

module.exports = ShedGame;
