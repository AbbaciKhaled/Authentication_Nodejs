const router = require("express").Router();
const { checkToken, checkActivationToken, checkResetPassToken } = require("../../middlewares/token_validation");
const {
    createUser,
    login,
    getUserByUserId,
    getUsers,
    updateUsers,
    deleteUser,
    activateAccount,
    sendVerificationEmail,
    sendResetPasswordEmail,
    resetPassword
} = require("../../controllers/auth/user");

router.get("/", getUsers);
router.get("/:id", checkToken, getUserByUserId);
router.post("/", createUser);
router.post("/login", login);
router.patch("/:id", updateUsers);
router.delete("/:id", deleteUser);

//Account activation
router.post("/activate-account", checkActivationToken, activateAccount);
router.post("/verification-email/:id", sendVerificationEmail);

//Reset password
router.post("/reset-password-email/:id", sendResetPasswordEmail);
router.post("/reset-password", checkResetPassToken, resetPassword);

module.exports = router;