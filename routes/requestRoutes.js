const express = require("express");
const RequestController = require("../controllers/RequestController");
const router = express.Router();

router.get("/api/requests", RequestController.requests);
router.get("/api/requests/:id", RequestController.requestById);
router.post("/api/requests", RequestController.requestAdd);
router.delete("/api/requests/:id", RequestController.requestDelete);
router.put("/api/requests-status/:id", RequestController.requestStatusUpdate);
router.put("/api/requests/:id", RequestController.requestUpdate);

module.exports = router;
