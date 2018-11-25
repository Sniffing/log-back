require('dotenv').config()

var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore({
  projectId: process.env.APP_ID
});

const query = datastore.createQuery('Log');

let migrateTo = (newKindName) => {
  datastore.runQuery(query, (err, entities) => {
    entities.forEach(entity => {
      let newKey = entity[datastore.KEY];
      newKey.kind = newKindName;
      entity[datastore.KEY] = newKey;
      saveIfDoesNotExist(prepare(entity));
    });
  });
}

let saveIfDoesNotExist = (data) => {
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

let saveToCloud = (data) => {
  datastore.save(data)
  .then(() => {
    console.log("Saved data with key: ", data.key);
  })
  .catch((err) => {
    console.log("Error while saving to google cloud:", err);
  })
}

let prepare = (entity) => {
  const data = {
    key: datastore.key([entity[datastore.KEY].kind, entity.date]),
    data: {
      date: entity.date,
      weight: entity.weight,
      keywords: entity.keywords,
      text: entity.text,
    }
  }
  return data;
}

migrateTo('Log3')
//   // entities = An array of records.
//
//   // Access the Key object for an entity.
//   const firstEntityKey = entities[0][datastore.KEY];
// });
