const ShedGame = require("./models/ShedGame");

const game = new ShedGame(["jordan", "big jordo", "amy"]);

// check game
game.printGameState();

// play a shot
for (let i = 0; i < 5; i++) {
  const activeHand = game.players[game.activePlayer].hand;
  const cardToPlay = activeHand.removeCard(activeHand.cards[0]);

  if (game.deck.depth > 0) {
    activeHand.addCards([game.deck.takeTop()]);
  }

  game.playCards([cardToPlay]);

  game.printGameState();
}
