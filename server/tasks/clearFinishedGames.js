const GamesManager = require("../lib/GamesManager");

const clearFinishedGames = () => {
  Object.keys(GamesManager.GAMES).forEach(gameId => {
    const game = GamesManager.GAMES[gameId];

    if (game.status === "COMPLETE") {
      delete GamesManager.GAMES[gameId];
    }
  });
};

module.exports = clearFinishedGames;
