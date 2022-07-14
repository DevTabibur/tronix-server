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

// verifyJWT .. here we are trying to read authHeader, for verification
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  // console.log("auth header", authHeader);
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorization Access" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const BlogCollections = client.db("tronix").collection("blogs");
    const ProductCollections = client.db("tronix").collection("products");
    const UsersCollections = client.db("tronix").collection("users");
    const StyleCollections = client.db("tronix").collection("style");

    // get load all styles
    app.get("/styles", async(req, res)=>{
      const styles = await StyleCollections.find().toArray();
      res.send(styles)
    })
    // get all user
    app.get("/user", verifyJWT, async (req, res) => {
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
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.send({ result, accessToken: token });
    });


    // check ADMIN
    app.get('/admin/:email', async(req, res) =>{
      const email = req.params.email;
      const user = await UsersCollections.findOne({email: email});
      const isAdmin = user.role === 'admin';
      res.send({admin: isAdmin})
    })

    // make a user an Admin with the same(ABOVE) user field by filtering role = 'admin'.it'll giving power to make any of user an admin..
    app.put("/user/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      // console.log(email, requester)
      const requesterAccount = await UsersCollections.findOne({
        email: requester,
      });
      // console.log(requesterAccount, 'account')
      if (requesterAccount.role == "admin") {
        const filter = { email: email };
        const updateDoc = {
          $set: { role: "admin" },
        };
        const result = await UsersCollections.updateOne(filter, updateDoc);
        res.send(result);
      }
      else{
        res.status(403).send({message: 'forbidden'});
      }
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
      const products = await cursor.toArray();
      res.send(products);
    });
    // load just one products by name
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await ProductCollections.findOne(query);
      res.send(result);
    });

    // for count of pagination...total product counting process
    app.get('/productCount', async (req, res)=>{
      const query={};
      const cursor = ProductCollections.find(query);
      const count = await cursor.count();
      res.send({count});
    })


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
