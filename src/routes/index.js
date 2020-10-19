const router = require("express").Router();

//Sub-routes
const userRouter = require("./auth/user");
router.use("/users", userRouter);
const googleRouter = require("./auth/google");
router.use("/google", googleRouter);

//CRUD route
const crudRouter = require("./crudExemple");
router.use("/crud", crudRouter);

module.exports = router;