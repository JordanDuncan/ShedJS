class GamesManager {
  constructor() {
    // const ShedGame = require("../models/ShedGame");
    // const WaitingGame = require("../models/WaitingGame");
    this.GAMES = {
      //   ABCD: new ShedGame("ABCD", ["jordan", "amyu", "jordan2"])
    };
    this.WAITING_GAMES = {
      //   WXYZ: new WaitingGame("WXYZ")
    };
  }
}

module.exports = new GamesManager();
