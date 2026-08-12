const express = require("express");

const router = express.Router();

const {
  createPurchase,
  getMyPurchases,
} = require("../controllers/purchaseController");

const protect = require("../middleware/authMiddleware");


// Purchase course
router.post(
  "/:courseId",
  protect,
  createPurchase
);


// Student purchase history
router.get(
  "/my-purchases",
  protect,
  getMyPurchases
);


module.exports = router;