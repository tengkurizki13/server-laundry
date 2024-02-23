const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");
const ownerRoutes = require("./ownerRoutes");
const authRoutes = require("./authRoutes");
const requestRoutes = require("./requestRoutes");
const trackRoutes = require("./trackRoutes");
const authentication = require("../middleware/authentication");

router.get("/", (req, res) => {
  res.send("ok");
});



router.use(authRoutes);
// router.use(authentication);
router.use(userRoutes);
router.use(requestRoutes);
router.use(ownerRoutes);
router.use(trackRoutes);


const errorHandler = (error, req, res, next) => {
  let status = 500;
  let message = "Internal Server Error";
  switch (error.name) {
    case "SequelizeValidationError":
    case "SequelizeUniqueConstraintError":
      status = 400;
      message = error.errors[0].message
      break;
    case "ValidationErrorName":
      status = 400;
      message = error.errors[0].message
      break;
    case "Bad Request":
      status = 400;
      message = "username / password kosong";
      break;
    case "authentication":
      status = 401;
      message = "kamu belum authentikasi";
      break;
    case "notListed":
      status = 500;
      message = "Nomer WhatsApp tidak terdaftar.";
      break;
    case "notSended":
      status = 500;
      message = "Pesan Tidak terkirim";
      break;
    case "notConnected":
      status = 500;
      message = "WhatsApp belum terhubung.";
      break;
    case "authorized":
      status = 401;
      message = "kamu tidak punya akses";
      break;
    case "forbidden":
      status = 403;
      message = "dilarang";
      break;
    case "notFound":
      status = 404;
      message = "data tidak ditemukan";
      break;
    default:
      status = 500;
      message = "Internal Server Error";
      break;
  }
  res.status(status).json({ message });
};
router.use(errorHandler);

module.exports = router;
