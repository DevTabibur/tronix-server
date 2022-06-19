const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// user:tronix
// pass:JBEWCPcjTsUJuzkf


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hc4xz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
  try{
    await client.connect();
    const BlogCollections = client.db("tronix").collection("blogs");
    const ProductCollections = client.db("tronix").collection("products");


    // load all blogs
    app.get('/blogs', async (req, res)=>{
      // console.log(req.body);
      const query={};
      const cursor = BlogCollections.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

    // load all products
    app.get('/products', async (req, res)=>{
      // console.log(req.body);
      const query={};
      const cursor = ProductCollections.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

  }
  finally {
    //   await client.close();
  }
}
run().catch(console.dir)

app.get('/', (req, res)=>{
  res.send("Hello World!")
});

// port
app.listen(port, ()=>{
console.log("Server is running on ${port}");
})