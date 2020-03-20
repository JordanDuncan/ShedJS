// const ShedGame = require("./models/ShedGame");
// const StringUtils = require("./lib/StringUtils");

// const GAMES = {};

// function createNewGame(players) {
//   const gameCode = StringUtils.generateGameCode(Object.keys(GAMES));

//   GAMES[gameCode] = new ShedGame(players);
// }

// createNewGame(["jordan", "big jordo", "amy", "ben"]);
// createNewGame(["sdf", "big jordo", "amy", "ccbxbccbxxc"]);
// createNewGame(["jordan", "bafgffhsdo", "egseggege", "fdghfh"]);
// createNewGame(["aaaaaaa", "befjrtyyytdo", "tuiytity", "ben"]);

// console.log(GAMES);

// // check game
// game.printGameState();

// // play a shot
// for (let i = 0; i < 20; i++) {
//   const top = game.topVisible;

//   const activeHand = game.activePlayer.hand;

//   // find a card they can play
//   let cardToPlay = null;
//   activeHand.cards.forEach(card => {
//     if (!top || card.canPlayOn(top)) {
//       cardToPlay = card;
//     }
//   });

//   if (!cardToPlay) {
//     // user has no choice, pick up the deck
//     game.pickUpPlayPile(game.activePlayer, true);
//   } else {
//     game.playerPlayCards(game.activePlayer, [cardToPlay]);
//   }

//   game.printGameState();
// }

const http = require("http");
const express = require("express");
const app = express();

const server = http.createServer(app);
const io = require("socket.io").listen(server);

const cors = require("cors");
const port = 3000;

const singletons = require("./lib/singletons");
const GameUtils = require("./lib/GameUtils");
const logger = require("./lib/Logger");

app.use(cors());

app.use("/api", require("./api"));

app.use(express.static("dist"));

io.on("connection", socket => {
  let REGISTERED_GAME = null;

  logger.info(`New Connection: ${socket.id}`);

  socket.on("SUBSCRIBE_TO_GAME", data => {
    // add to game subscribers
    if (singletons.GAMES[data.gameId]) {
      singletons.GAMES[data.gameId].addSubscriber(socket);
    }

    // send the current game state
    socket.emit("GAME_STATE", GameUtils.getPublicGameState(data.gameId));
  });

  socket.on("disconnect", data => {
    logger.info(`End Connection: ${socket.id}`);

    // if has registered game, remove it
    // TODO
  });
});

server.listen(port, () =>
  console.log(`ShedJS Server listening on port ${port}!`)
);

let counter = 0;

// setInterval(() => {
//   const game = singletons.GAMES.ABCD;
//   const top = game.topVisible;

//   const activeHand = game.activePlayer.hand;

//   // find a card they can play
//   let cardToPlay = null;
//   activeHand.cards.forEach(card => {
//     if (!top || card.canPlayOn(top)) {
//       cardToPlay = card;
//     }
//   });

//   if (!cardToPlay) {
//     // user has no choice, pick up the deck
//     game.pickUpPlayPile(game.activePlayer, true);
//   } else {
//     game.playerPlayCards(game.activePlayer, [cardToPlay]);
//   }

//   //   game.printGameState();
// }, 2000);
