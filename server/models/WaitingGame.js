const uuid = require("uuid/v4");

const logger = require("../lib/Logger");
const StringUtils = require("../lib/StringUtils");
const GamesManager = require("../lib/GamesManager");

class WaitingGame {
  constructor(id) {
    const existingIds = [
      ...Object.keys(GamesManager.GAMES),
      ...Object.keys(GamesManager.WAITING_GAMES)
    ];

    this.id = id || StringUtils.generateGameCode(existingIds);

    this.players = {};
    this.subscribers = [];

    this.leadPlayer = null;

    logger.info(`Created new WaitingGame with ID ${this.id}`);
  }

  addPlayer(name, socket) {
    logger.info(`Adding player ${name} to WaitingGame with ID ${this.id}`);

    const player = {
      id: uuid(),
      name,
      socket
    };

    // TODO: RENAME PLAYER IF ALREADY A PLAYER WITH SAME NAME

    const matchingSockets = Object.values(this.players).filter(
      player => player.socket.id === socket.id
    );

    if (matchingSockets.length === 0) {
      this.players[player.id] = player;

      if (!this.leadPlayer) {
        logger.info(
          `Player ${name} is lead player of WaitingGame with ID ${this.id}`
        );
        this.leadPlayer = player.id;
      }

      logger.info(`Added player ${name} to WaitingGame with ID ${this.id}`);
    } else {
      this.sendGameStateToPlayers();
      return matchingSockets[0].id;
    }

    this.sendGameStateToPlayers();

    return player.id;
  }

  removePlayer(id) {
    if (this.players[id]) {
      delete this.players[id];

      // if they were lead, assign a new lead player
      if (id === this.leadPlayer) {
        if (Object.keys(this.players).length > 0) {
          this.leadPlayer = Object.keys(this.players)[0];
        } else {
          this.leadPlayer = null;
        }
      }
    }

    this.sendGameStateToPlayers();
  }

  addSubscriber(socket) {
    this.subscribers.push(socket);

    // send the current game state
    socket.emit("GAME_STATE", {
      id: this.id,
      status: "WAITING"
    });

    return true;
  }

  removeSubscriber(socketId) {
    this.subscribers = this.subscribers.filter(sub => sub.id !== socketId);
    return true;
  }

  sendGameStateToPlayers() {
    // construct array of player details
    const players = Object.values(this.players).map(player => ({
      id: player.id,
      name: player.name
    }));

    Object.values(this.players).forEach(player => {
      if (player.socket) {
        player.socket.emit("LOBBY_STATE", {
          me: player.id,
          id: this.id,
          players: players,
          activePlayer: this.leadPlayer,
          subscribers: this.subscribers.length
        });
      }
    });
  }
}

module.exports = WaitingGame;
