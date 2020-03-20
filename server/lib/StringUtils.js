const chance = require("chance");

/**
 *  Generate a 4-char random game code, taking into account pre-existing codes
 * @param {Array<String>} exceptions
 */
function generateGameCode(exceptions) {
  let foundGameCode = null;

  while (!foundGameCode) {
    const gameCode = chance().string({
      length: 4,
      casing: "upper",
      alpha: true,
      numeric: true
    });

    // make sure its not in the exception list
    if (!exceptions || exceptions.indexOf(gameCode) === -1) {
      foundGameCode = gameCode;
    }
  }

  return foundGameCode;
}

module.exports = {
  generateGameCode
};
