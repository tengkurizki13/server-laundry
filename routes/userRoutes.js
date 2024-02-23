const express = require("express");
const UserController = require("../controllers/UserController");
const router = express.Router();

router.get("/api/users", UserController.users);
router.get("/api/users/:id", UserController.userById);
router.post("/api/users", UserController.userAdd);
router.delete("/api/users/:id", UserController.userDelete);
router.put("/api/users/:id", UserController.userUpdate);
module.exports = router;
