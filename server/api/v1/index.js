const express = require("express");
const router = express.Router();

router.get("/gamestate/:id", require("./gamestate"));

module.exports = router;
