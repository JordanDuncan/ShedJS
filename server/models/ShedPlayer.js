const Chance = require("chance");

const Hand = require("./Hand");
const Card = require("./Card");
const Stack = require("./Stack");

class ShedPlayer {
  constructor(name) {
    this.id = Chance().guid();
    this.name = name || Chance().name();
    this.hand = new Hand();
    this.bottomCards = [[], [], []];
  }
}

module.exports = ShedPlayer;
