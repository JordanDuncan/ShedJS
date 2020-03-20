const ShedGame = require("../models/ShedGame");

/**
 * @type {Object.<String, ShedGame>}
 */
const GAMES = {
  ABCD: new ShedGame("ABCD", ["jordan", "amyu", "jordan2"])
};

module.exports = {
  GAMES
};
