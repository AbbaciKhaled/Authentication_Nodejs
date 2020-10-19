require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

//DB Connection
require("./src/database/connection");

//Routes
const routes = require("./src/routes/index");
app.use("/", routes);

// Run the server
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log("server up and running on PORT :", port);
});