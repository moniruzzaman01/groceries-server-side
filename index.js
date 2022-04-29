const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());

//mongodb connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6fhmb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const itemsCollection = client.db("groceries").collection("inventoryItems");

    //get all data
    app.get("/inventory-items", async (req, res) => {
      const cursor = itemsCollection.find({});
      const items = await cursor.toArray();
      res.send(items);
    });

    //   ---------------------
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

//basic server api
app.get("/", (req, res) => {
  res.send("Groceries Server is running well.");
});
app.listen(port, () => {
  console.log("groceries server running from ", port);
});
