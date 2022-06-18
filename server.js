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
const uri = "mongodb+srv://<username>:<password>@cluster0.hc4xz.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  console.log("MOngo Connected");
  // perform actions on the collection object
  client.close();
});



app.get('/', (req, res)=>{
    res.send("Hello World!")
});


// port
app.listen(port, ()=>{
console.log("Server is running on ${port}");
})