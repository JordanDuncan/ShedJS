const ShedGame = require("./models/ShedGame");

const game = new ShedGame(["jordan", "big jordo", "amy", "ben"]);

// check game
game.printGameState();

// play a shot
for (let i = 0; i < 20; i++) {
  const top = game.topVisible;

  const activeHand = game.activePlayer.hand;

  // find a card they can play
  let cardToPlay = null;
  activeHand.cards.forEach(card => {
    if (!top || card.canPlayOn(top)) {
      cardToPlay = card;
    }
  });

  if (!cardToPlay) {
    // user has no choice, pick up the deck
    game.pickUpPlayPile(game.activePlayer, true);
  } else {
    game.playerPlayCards(game.activePlayer, [cardToPlay]);
  }

  game.printGameState();
}
