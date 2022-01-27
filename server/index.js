const http = require("http");
const express = require("express");
const app = express();

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {  
  cors: {
    origin: ["https://shed.dncn.dev", "http://localhost:1234"],
  }
});

const cors = require("cors");
const port = 3000;

const chance = require("chance");
const path = require("path");

const GamesManager = require("./lib/GamesManager");
const ShedGame = require("./models/ShedGame");
const WaitingGame = require("./models/WaitingGame");

const cron = require("node-cron");

const logger = require("./lib/Logger");

app.use(cors());

app.use("/api", require("./api"));

app.use(express.static("dist"));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

io.on("connection", socket => {
  let REGISTERED_GAME = null;

  logger.info(`New Connection: ${socket.id}`);

  socket.on("SUBSCRIBE_TO_GAME", data => {
    // add to game subscribers
    const game =
      GamesManager.GAMES[data.gameId] ||
      GamesManager.WAITING_GAMES[data.gameId];

    if (game) {
      game.addSubscriber(socket);
    } else {
      socket.emit("REDIRECT", { path: "/" });
    }
  });

  socket.on("CREATE_GAME", data => {
    logger.info(`${data.name} is creating a new game...`);
    // create new waiting game
    const game = new WaitingGame();

    GamesManager.WAITING_GAMES[game.id] = game;

    socket.emit("CREATED_GAME", { id: game.id });
  });

  socket.on("JOIN_GAME", data => {
    logger.info(`${data.name} is joining game ${data.gameId}...`);
    if (data.gameId && GamesManager.WAITING_GAMES[data.gameId]) {
      GamesManager.WAITING_GAMES[data.gameId].addPlayer(
        data.name || chance().name(),
        socket
      );
    } else {
      socket.emit("REDIRECT", { path: "/" });
    }
  });

  socket.on("REJOIN_GAME", data => {
    // if user disconnected, they can pass a token here to prove identity
    if (data.token && data.gameId && GamesManager.GAMES[data.gameId]) {
      GamesManager.GAMES[data.gameId].rejoinPlayer(data.token, socket);
    } else {
      socket.emit("REDIRECT", { path: "/" });
    }
  });

  socket.on("REFRESH_HAND_STATE", data => {
    if (data.gameId && GamesManager.GAMES[data.gameId]) {
      GamesManager.GAMES[data.gameId].sendGameStateToPlayers();
    }
  });

  socket.on("START_GAME", data => {
    if (
      data.gameId &&
      GamesManager.WAITING_GAMES[data.gameId] &&
      Object.values(GamesManager.WAITING_GAMES[data.gameId].players).length > 0
    ) {
      logger.info(`Game ${data.gameId} is starting...`);
      // make sure the player that sent it is the lead player
      const waitingGame = GamesManager.WAITING_GAMES[data.gameId];
      const leadPlayerSocketId =
        waitingGame.players[waitingGame.leadPlayer].socket.id;

      if (leadPlayerSocketId !== socket.id) {
        return false;
      }

      // create new game
      const game = new ShedGame(data.gameId);

      Object.values(waitingGame.players).forEach(player => {
        game.addPlayer(player.id, player.name, player.socket);
      });

      waitingGame.subscribers.forEach(sub => {
        game.addSubscriber(sub);
      });

      GamesManager.GAMES[game.id] = game;

      delete GamesManager.WAITING_GAMES[data.gameId];

      game.deal();
    }
  });

  socket.on("PLACE_CARDS", data => {
    if (
      data.gameId &&
      data.cardIds &&
      GamesManager.GAMES[data.gameId] &&
      GamesManager.GAMES[data.gameId].status === "DEALT"
    ) {
      // validate player
      const game = GamesManager.GAMES[data.gameId];
      const player = game.getPlayerFromSocketId(socket.id);

      if (!player) {
        return false;
      }

      // get card objects
      const cards = [];

      player.hand.cards.forEach(card => {
        if (data.cardIds.indexOf(card.id) > -1) {
          cards.push(card);
        }
      });

      player.bottomCards.forEach(cardPile => {
        if (data.cardIds.indexOf(cardPile[0].id) > -1) {
          cards.push(cardPile[0]);
        }
      });

      if (cards.length === 3) {
        game.placeBottomCardsForPlayer(player, cards);
      }
    }
  });

  socket.on("PLAY_CARD", data => {
    if (data.gameId && data.cardIds && GamesManager.GAMES[data.gameId]) {
      // validate player
      const game = GamesManager.GAMES[data.gameId];
      /** @type {ShedPlayer} */
      const player = game.getPlayerFromSocketId(socket.id);

      if (!player) {
        return false;
      }

      // get card objects
      const cards = [];

      player.validCards.forEach(card => {
        if (data.cardIds.indexOf(card.id) > -1) {
          cards.push(card);
        }
      });

      game.playerPlayCards(player, cards);
    }
  });

  socket.on("disconnect", data => {
    logger.info(`End Connection: ${socket.id}`);

    // if has registered game, remove it
    // TODO make this complete/actually work
    Object.values(GamesManager.WAITING_GAMES).forEach(game => {
      Object.values(game.players).forEach(player => {
        if (player.socket && player.socket.id === socket.id) {
          // this player has just disconnected, remove them
          game.removePlayer(player.id);
        }
      });

      game.subscribers.forEach(sub => {
        if (sub.id === socket.id) {
          game.removeSubscriber(socket.id);
        }
      });
    });
  });
});

/**
 * Set up tasks
 */

cron.schedule("0 * * * *", require("./tasks/clearFinishedGames"));

server.listen(port, () =>
  console.log(`ShedJS Server listening on port ${port}!`)
);
