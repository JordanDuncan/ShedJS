const GameUtils = require("../../../lib/GameUtils");

module.exports = (req, res) => {
  const gameState = GameUtils.getPublicGameState(req.params.id);

  if (gameState) {
    return res.json({
      success: true,
      state: gameState
    });
  } else {
    return res.status(404).json({ success: false });
  }
};
