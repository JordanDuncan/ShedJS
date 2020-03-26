const GamesManager = require("./GamesManager");

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

/**
 *
 * @param {ShedGame} game game
 */
function getPublicGameStateFromGame(game) {
  const returnState = {
    status: game.status || "ACTIVE",
    inPlay: game.inPlay.cards,
    burn: game.burn.cards,
    deck: game.deck.cards.length,
    activePlayer: game.activePlayerId,
    playersOut: game.playersOut,
    players: {}
  };

  Object.keys(game.players).forEach(playerId => {
    const player = game.players[playerId];

    returnState.players[playerId] = {
      id: player.id,
      status: player.status,
      name: player.name,
      inPlay: player.inPlay,
      cards: player.hand.cards.length,
      bottomCards: player.bottomCards
        .map(cardPile => {
          let cardToReturn = null;

          if (cardPile && cardPile.length > 0) {
            cardToReturn = { ...cardPile[0] };
          }

          // if face down, remove suit and value
          if (cardToReturn && !cardToReturn.faceUp) {
            cardToReturn.suit = null;
            cardToReturn.value = null;
            cardToReturn.property = null;
          }

          return cardToReturn;
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
  if (gameId && GamesManager.GAMES[gameId]) {
    // get state
    const gameState = GamesManager.GAMES[gameId];

    return getPublicGameStateFromGame(gameState);
  } else {
    return null;
  }
}

module.exports = {
  getPublicGameState,
  getPublicGameStateFromGame
};
