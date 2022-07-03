const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

// user:tronix
// pass:JBEWCPcjTsUJuzkf

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hc4xz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const BlogCollections = client.db("tronix").collection("blogs");
    const ProductCollections = client.db("tronix").collection("products");
    const UsersCollections = client.db("tronix").collection("users");

    // get all user
    app.get("/user", async (req, res) => {
      const users = await UsersCollections.find().toArray();
      res.send(users);
    });

    //update a user just one user specific by email..
    // save registered user in db
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const user = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await UsersCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      // giving every user a token..
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ result, accessToken: token });
    });

    // load all blogs
    app.get("/blogs", async (req, res) => {
      // console.log(req.body);
      const query = {};
      const cursor = BlogCollections.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // load single blog by _id
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await BlogCollections.findOne(query);
      res.send(result);
    });

    // load all products
    app.get("/products", async (req, res) => {
      // console.log(req.body);
      const query = {};
      const cursor = ProductCollections.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// port
app.listen(port, () => {
  console.log("Server is running on ${port}");
});
