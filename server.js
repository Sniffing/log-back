require('dotenv').config()

const express = require('express')
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
const app = express()
const port = 3000

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore({
  projectId: process.env.APP_ID
});

// The kind for the new entity
const kind = 'Log';

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('hello world')
})

app.post('/', upload.array(), function (req, res, next) {
  var body = req.body;
  var data = formatData(body);
  saveIfDoesNotExist(data, res);
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

let saveIfDoesNotExist = (data, res) => {
  datastore.get(data.key)
  .then((entity) => {
    if (entity.length < 1 || (entity.length === 1 && entity[0] == undefined)) {
      saveToCloud(data);
      res.send(true);
    } else {
      console.log("entity already exists for date:", data.key.name);
      res.send(false);
    }
  })
  .catch((err) => {
    console.log("Error searching for key", data.key);
    res.send(false);
  });
}

let metricsToList = (jsonState) => {
  var list = [];
  for (var key in jsonState) {
    if (jsonState[key]) {
      list.push(key);
    }
  }

  return list;
}

let formatData = (state) => {
  const data = {
    key: datastore.key([kind, state.dateState.date]),
    data: {
      date: state.dateState.date,
      weight: state.entryMetricState.weight,
      keywords: state.keywordsState.keywords.concat(metricsToList(state.booleanMetricState)),
      text: state.textState.data,
    }
  }

  return data;
}

let saveToCloud = (data) => {
  datastore.save(data)
  .then(() => {
    console.log("Saved data with key: ", data.key);
    return true;
  })
  .catch((err) => {
    console.log("Error while saving to google cloud:", err);
    return false;
  })
}
