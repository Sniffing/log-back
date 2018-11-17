const express = require('express')
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
const app = express()
const port = 3000

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('hello world')
})

app.post('/', upload.array(), function (req, res, next) {
  var body = req.body;

  console.log("Received state: ", body);
  res.send(true);
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
