const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());

//basic server api
app.get("/", (req, res) => {
  res.send("Groceries Server is running well.");
});
app.listen(port, () => {
  console.log("groceries server running from ", port);
});
