require('dotenv').config()

var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore({
  projectId: process.env.APP_ID
});

class GoogleCloudData {
  key;
  data: EntryData;

  constructor (key, data: EntryData) {
    this.key = key;
    this.data = data;
  }
}

class EntryData {
  date: Date;
  weight: number;
  keywords: string[];
  text: string;

  constructor(date: Date, weight: number, keywords: string[], text: string) {
    this.date = date;
    this.weight = weight;
    this.keywords = keywords;
    this.text = text;
  }
}

const query = datastore.createQuery('Log');

function migrateTo(newKindName: string){
  datastore.runQuery(query, (err, entities) => {
    entities.forEach(entity => {
      let newKey = entity[datastore.KEY];
      newKey.kind = newKindName;
      entity[datastore.KEY] = newKey;
      saveIfDoesNotExist(prepare(entity));
    });
  });
}

function saveIfDoesNotExist(data: GoogleCloudData){
  datastore.get(data.key)
  .then((entity) => {
    if (entity.length < 1 || (entity.length === 1 && entity[0] == undefined)) {
      saveToCloud(data);
    } else {
      console.log("Entry already exists for date:", data.key.name);
    }
  })
  .catch((err) => {
    console.log("Error searching for key", data.key);
  });
}

function saveToCloud(data: GoogleCloudData) {
  datastore.save(data)
  .then(() => {
    console.log("Saved data with key: ", data.key);
  })
  .catch((err) => {
    console.log("Error while saving to google cloud:", err);
  })
}

function prepare(entity) {
  let key = datastore.key([entity[datastore.KEY].kind, entity.date]);
  let data = new EntryData(entity.date, entity.weight, entity.keywords, entity.text);

  const googleCloudData = new GoogleCloudData (key, data);
  return googleCloudData;
}

migrateTo('Log3')
//   // entities = An array of records.
//
//   // Access the Key object for an entity.
//   const firstEntityKey = entities[0][datastore.KEY];
// });
