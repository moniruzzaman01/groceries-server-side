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
      .send({ message: "Unauthorized access (returned from jwtverify)" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      console.log("sala error paisi");
      return res.status(401).send("Unauthorized access");
    }
    req.decoded = decoded;
    next();
  });
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
      res.send(result);
    });

    //get data filtered by email
    app.get("/itemsByEmail", JWTverify, async (req, res) => {
      const tokenEmail = req.decoded.email;
      const email = req.query.email;
      if (tokenEmail === email) {
        console.log("email matched");
        const cursor = itemsCollection.find({ userEmail: email });
        const items = await cursor.toArray();
        res.send(items);
      } else {
        console.log("not matched");
      }
    });

    //get single data filtered by ID
    app.get("/itemsById/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemsCollection.findOne(query);
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
        res.send(result);
      });

      //Delete data
      app.delete("/deleteById/:id", async (req, res) => {
        const id = req.params.id;
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
