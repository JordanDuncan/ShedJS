class Player {
  /**
   * class to represent a player in the game
   * @param {string} id id of player
   * @param {string} name name of player
   * @param {Array<Card>} bottomCards array of bottom cards
   */
  constructor(id, name, bottomCards) {
    this.id = id;
    this.name = name;
    this.bottomCards = bottomCards;
  }
}

export default Player;
