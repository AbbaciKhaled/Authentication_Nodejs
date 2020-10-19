const router = require("express").Router();

const {
    googleLogin,
    googleSignUp,
    googleCallBack
} = require("../../controllers/auth/google");

router.get("/login", googleLogin);
router.get("/signup", googleSignUp);
router.get('/callback', googleCallBack);

module.exports = router;