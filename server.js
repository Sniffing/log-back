require('dotenv').config()
const path = require('path');
const express = require('express')
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
const app = express()
const port = 4000
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

app.get('/', function(req,res) {
  res.sendFile(path.join(__dirname,'/web-page/public/','index.html'));
})

app.post('/', upload.array(), function (req, res, next) {
  var body = req.body;
  var data = formatData(body);
  saveIfDoesNotExist(data, res);
})

app.get('/entries', function(req, res) {
  const query = datastore.createQuery(kind)
                         .order('date');

  query.run((err, entities) => {
    const first = entities[0];
    const last = entities[entities.length - 1];

    res.send({
      first: first.date,
      last: last.date
    });
  });
})

app.listen(port, () => {
  log.info(`Third Eye listening on port ${port}!`)
  log.info(`Be sure to run 'ngrok http ${port}'`);
})

app.get('/weight', function(req,res) {
  let result = [];
  const query = datastore.createQuery(kind)
                         .filter('weight', ">", "0");
  query.run((err, entities) => {
    for (var i = 0; i < entities.length; i++) {
      result.push({date: entities[i].date, weight: entities[i].weight});
    }
    res.send(result);
  });
});

app.get('/keywords', function(req,res) {
  const query = datastore.createQuery(kind);
  let result = [];
  query.run((err, entities) => {
    console.log("There were %s entities retrieved", entities.length);

    for (var i = 0; i < entities.length; i++) {
      result.push({"date": entities[i].date, "keywords": entities[i].keywords})
    }
    res.send(result);
  });
});

app.get('/text', function(req,res) {
  const query = datastore.createQuery(kind);
  let result = [];
  query.run((err, entities) => {
    console.log("There were %s entities retrieved", entities.length);

    for (var i = 0; i < entities.length; i++) {
      result.push({"date": entities[i].date, "text": entities[i].text})
    }
    res.send(result);
  });
});

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
