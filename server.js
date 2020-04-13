import * as dotenv from 'dotenv';
import { join } from 'path';
import express from 'express';
import { json, urlencoded } from 'body-parser';
import multer from 'multer';
import { enableAll, info, error } from 'loglevel';
import { Datastore } from '@google-cloud/datastore';

dotenv.config();
const upload = multer();
const app = express();
const port = 4000;
enableAll();

app.use(json()); // for parsing application/json
app.use(urlencoded({ extended: true }));

const datastore = new Datastore({
  projectId: process.env.APP_ID
});

// The kind for the new entity
const kind = 'Log3';

app.get('/', function(req,res) {
  res.sendFile(join(__dirname,'/web-page/public/','index.html'));
})

app.post('/', upload.array(), function (req, res, next) {
  const body = req.body;
  const data = formatData(body);
  saveIfDoesNotExist(data, res);
})

app.get('/entries', async function(req, res) {
  const firstQuery = datastore.createQuery(kind)
                         .order('date')
                         .limit(1);

  const lastQuery = datastore.createQuery(kind)
                        .order('date', {descending: true})
                        .limit(1);  

  const first = await firstQuery.run();
  const last = await lastQuery.run();
  
  res.send({
    first: first[0][0].date,
    last: last[0][0].date
  });
})

app.listen(port, () => {
  info(`Third Eye listening on port ${port}!`)
  info(`Be sure to run 'ngrok http ${port}'`);
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
      info("Entry already exists for date:", data.key.name);
      res.send(false);
    }
  })
  .catch((err) => {
    error("Error searching for key", data.key);
    res.send(false);
  });
}

const metricsToList = (jsonState) => {
  var list = [];
  for (var key in jsonState) {
    if (jsonState[key]) {
      list.push(key.toLowerCase());
    }
  }

  return list;
}

const reverseDate = (date) => {
  let parts = date.split("-");
  return parts[2] + "-" + parts[1] + "-" + parts[0];
}

const formatData = (state) => {
  const data = {
    key: datastore.key([kind, reverseDate(state.dateState.date)]),
    data: {
      date: reverseDate(state.dateState.date),
      weight: state.entryMetricState.weight,
      keywords: state.keywordsState.keywords.map(k => k.toLowerCase()).concat(metricsToList(state.booleanMetricState)),
      text: state.textState.data,
    }
  }

  return data;
}

const saveToCloud = (data, res) => {
  datastore.save(data)
  .then(() => {
    info("Saved data with key: ", data.key);
    res.send(true);
  })
  .catch((err) => {
    error("Error while saving to google cloud:", err);
    res.send(false);
  })
}
