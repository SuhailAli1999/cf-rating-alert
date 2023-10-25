const express = require("express");
const variablesMiddleware = require('../middleware/variables');

const router = express.Router();
const userController = require('../controllers/user.js');

router.post("/subscribe", userController.postSubscribe);
router.post("/verify/subscribe", userController.postSubscribeVerify);

router.post("/unsubscribe", userController.postUnsubscribe);
router.post("/verify/unsubscribe",  userController.postUnsubscribeVerify);


module.exports = router;
