const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

function JWTverify(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .send({ message: "Unauthorized access (returned from jetverify)" });
  }
  next();
}

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
    const sellerCollection = client.db("groceries").collection("sellers");

    //Auth
    app.post("/login", (req, res) => {
      const email = req.body;
      const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

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
    app.get("/itemsByEmail", JWTverify, async (req, res) => {
      const email = req.query.email;
      const cursor = itemsCollection.find({ userEmail: email });
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

    //get all sellers
    app.get("/sellers", async (req, res) => {
      const cursor = sellerCollection.find({});
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
