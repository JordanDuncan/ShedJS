const ShedGame = require("./models/ShedGame");

const game = new ShedGame(["jordan", "big jordo", "amy"]);

// check game
game.printGameState();

// play a shot
const activeHand = game.players[game.activePlayer].hand;
const cardToPlay = activeHand.removeCard(activeHand.cards[0]);

if (game.deck.depth > 0) {
  activeHand.addCards([game.deck.takeTop()]);
}

game.playCards([cardToPlay]);
game.nextPlayer();

game.printGameState();
