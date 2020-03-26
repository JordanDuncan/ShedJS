const ShedGame = require("../models/ShedGame");
const WaitingGame = require("../models/WaitingGame");

/**
 * @type {Object.<String, ShedGame>}
 */
let GAMES = {
  ABCD: new ShedGame("ABCD", ["jordan", "amyu", "jordan2"])
};

/**
 * @type {Object.<String, ShedGame>}
 */
let WAITING_GAMES = {
  WXYZ: new WaitingGame("WXYZ")
};

module.exports = {
  GAMES,
  WAITING_GAMES
};
