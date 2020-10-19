const router = require("express").Router();

const {
    readAll,
    readOne,
    create,
    update,
    remove
} = require("../controllers/crud");

//Replace this with your Model
const model = require("../models/User");

router.get("/", readAll(model));
router.get("/:id", readOne(model));
router.post("/", create(model));
router.patch("/:id", update(model));
router.delete("/:id", remove(model));

module.exports = router;