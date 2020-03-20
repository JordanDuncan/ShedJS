// const singletons = require("./singletons");

/** @typedef {Object} Card
 * @property {Null} property
 * @property {String} suit
 * @property {String} value
 */

/** @typedef {Object} PlayerState
 * @property {Array<Card>} bottomCards
 * @property {String} id
 * @property {String} name
 */

/** @typedef {Object} PublicGameState
 * @property {Array<Card>} burn
 * @property {Array<Card>} inPlay
 * @property {Boolean} deck
 * @property {Object.<String, PlayerState>} players
 */

function getPublicGameStateFromGame(game) {
  console.log(game.deck);
  const returnState = {
    inPlay: game.inPlay.cards,
    burn: game.burn.cards,
    deck: game.deck.cards.length > 0,
    players: {}
  };

  Object.keys(game.players).forEach(playerId => {
    const player = game.players[playerId];

    returnState.players[playerId] = {
      id: player.id,
      name: player.name,
      bottomCards: player.bottomCards
        .map(cardPile => {
          if (!cardPile || cardPile.length === 0) {
            return null;
          } else {
            return cardPile[0];
          }
        })
        .filter(card => card !== null)
    };
  });

  return returnState;
}

/**
 * Get public state of current game
 * @param {string} gameId ID of game to get
 * @returns {PublicGameState}
 */
function getPublicGameState(gameId) {
  const singletons = require("./singletons");

  if (gameId && singletons.GAMES[gameId]) {
    // get state
    const gameState = singletons.GAMES[gameId];

    return getPublicGameStateFromGame(gameState);
  } else {
    return null;
  }
}

module.exports = {
  getPublicGameState,
  getPublicGameStateFromGame
};
