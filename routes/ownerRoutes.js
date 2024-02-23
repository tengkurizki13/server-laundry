const express = require("express");
const OwnerController = require("../controllers/OwnerController");
const router = express.Router();

router.get("/api/requests-owner", OwnerController.requests);
module.exports = router;
