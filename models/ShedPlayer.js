const Hand = require("./Hand");
const Card = require("./Card");
const Stack = require("./Stack");

class ShedPlayer {
  constructor() {
    this.hand = new Hand();
    this.bottomCards = [[], [], []];
  }
}

module.exports = ShedPlayer;
