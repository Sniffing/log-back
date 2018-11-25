require('dotenv').config()

const express = require('express')
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
const app = express()
const port = 3000
var log = require('loglevel');
log.enableAll()

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore({
  projectId: process.env.APP_ID
});

// The kind for the new entity
const kind = 'Log3';

app.get('/', function (req, res) {
  res.send('Third eye')
})

app.post('/', upload.array(), function (req, res, next) {
  var body = req.body;
  var data = formatData(body);
  saveIfDoesNotExist(data, res);
})

app.listen(port, () => {
  log.info(`Third Eye listening on port ${port}!`)
  log.info(`Be sure to run 'ngrok http ${port}'`);
})

let saveIfDoesNotExist = (data, res) => {
  datastore.get(data.key)
  .then((entity) => {
    if (entity.length < 1 || (entity.length === 1 && entity[0] == undefined)) {
      saveToCloud(data, res);
    } else {
      log.info("Entry already exists for date:", data.key.name);
      res.send(false);
    }
  })
  .catch((err) => {
    log.error("Error searching for key", data.key);
    res.send(false);
  });
}

let metricsToList = (jsonState) => {
  var list = [];
  for (var key in jsonState) {
    if (jsonState[key]) {
      list.push(key.toLowerCase());
    }
  }

  return list;
}

let reverseDate = (date) => {
  let parts = date.split("-");
  return parts[2] + "-" + parts[1] + "-" + parts[0];
}

let formatData = (state) => {
  const data = {
    key: datastore.key([kind, reverseDate(state.dateState.date)]),
    data: {
      date: reverseDate(state.dateState.date),
      weight: state.entryMetricState.weight,
      keywords: state.keywordsState.keywords.concat(metricsToList(state.booleanMetricState)),
      text: state.textState.data,
    }
  }

  return data;
}

let saveToCloud = (data, res) => {
  datastore.save(data)
  .then(() => {
    log.info("Saved data with key: ", data.key);
    res.send(true);
  })
  .catch((err) => {
    log.error("Error while saving to google cloud:", err);
    res.send(false);
  })
}
