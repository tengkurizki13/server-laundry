const express = require("express");
const TrackController = require("../controllers/TrackController");
const router = express.Router();

router.get("/api/tracks/:id", TrackController.getTracks);
module.exports = router;
