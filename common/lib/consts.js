const CARD_VALUES = {
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  JACK: "J",
  QUEEN: "Q",
  KING: "K",
  ACE: "A",
  JOKER: "!"
};

const SUIT_VALUES = { HEART: "H", DIAMOND: "D", CLUB: "C", SPADE: "S" };

const MOVE_VALUES = {
  BURN: "BURN",
  REVERSE: "REVERSE"
};

const CARD_PROPERTY_VALUES = {
  BURN: "BURN",
  SKIP: "SKIP",
  RESET: "RESET",
  REVERSE: "REVERSE"
};

module.exports = {
  CARD_VALUES,
  SUIT_VALUES,
  MOVE_VALUES,
  CARD_PROPERTY_VALUES
};
