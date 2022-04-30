const express = require("express");
const cors = require("cors");
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  ConnectionPoolClosedEvent,
} = require("mongodb");
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

    //add data to database
    app.post("/inventory-items", async (req, res) => {
      const product = req.body;
      const result = await itemsCollection.insertOne(product);
      // console.log(product);
      res.send(result);
    });

    //get data filtered by email
    app.post("/itemsByEmail", async (req, res) => {
      const email = req.body;
      console.log(email);
      const cursor = itemsCollection.find(email);
      const items = await cursor.toArray();
      res.send(items);
    });

    //get single data filtered by ID
    app.get("/itemsById/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      // console.log(query);
      const result = await itemsCollection.findOne(query);
      // console.log("id", id);
      res.send(result);

      //Update Data
      app.put("/update", async (req, res) => {
        const item = req.body;
        const id = req.body._id;
        const query = { _id: ObjectId(id) };
        const updatedDoc = {
          $set: {
            quantity: item.quantity,
          },
        };
        const options = { upsert: true };
        const result = await itemsCollection.updateOne(
          query,
          updatedDoc,
          options
        );
        // console.log("it's called");
        res.send(result);
      });

      //Delete data
      app.delete("/deleteById/:id", async (req, res) => {
        const id = req.params.id;
        // console.log(id);
        const query = { _id: ObjectId(id) };
        const result = await itemsCollection.deleteOne(query);
        res.send(result);
      });
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
