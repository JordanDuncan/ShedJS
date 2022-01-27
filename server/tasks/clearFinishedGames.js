const GamesManager = require("../lib/GamesManager");

const clearFinishedGames = () => {
  Object.keys(GamesManager.GAMES).forEach(gameId => {
    const game = GamesManager.GAMES[gameId];

    if (game.status === "COMPLETE" || (game.lastMoveTime + 3000000) < Date.now()) {
      delete GamesManager.GAMES[gameId];
    }
  });
};

module.exports = clearFinishedGames;
