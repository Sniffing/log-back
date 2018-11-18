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
  projectId: 'third-eye-184620'
});

// The kind for the new entity
const kind = 'Log';
// The Cloud Datastore key for the new entity
const logKey = datastore.key(kind);

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('hello world')
})

app.post('/', upload.array(), function (req, res, next) {
  var body = req.body;

  var test = formatData(body);
  saveToCloud(test);
  res.send(true);
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

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
    key: logKey,
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
    console.log(`Saved ${data.key}: ${data.data}`);
  })
  .catch((err) => {
    console.log("Error while saving to google cloud:", err)
  })
}
