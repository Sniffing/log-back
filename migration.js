require('dotenv').config();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var Datastore = require('@google-cloud/datastore');
var datastore = Datastore({
    projectId: process.env.APP_ID
});
var GoogleCloudData = /** @class */ (function () {
    function GoogleCloudData(key, data) {
        this.key = key;
        this.data = data;
    }
    return GoogleCloudData;
}());
var EntryData = /** @class */ (function () {
    function EntryData(date, weight, keywords, text) {
        this.date = date;
        this.weight = weight;
        this.keywords = keywords;
        this.text = text;
    }
    return EntryData;
}());
var query = datastore.createQuery('Log');
function migrateTo(newKindName) {
    datastore.runQuery(query, function (err, entities) {
        entities.forEach(function (entity) {
            var newKey = entity[datastore.KEY];
            newKey.kind = newKindName;
            entity[datastore.KEY] = newKey;
            saveIfDoesNotExist(prepare(entity));
        });
    });
}
function saveIfDoesNotExist(data) {
    datastore.get(data.key)
        .then(function (entity) {
        if (entity.length < 1 || (entity.length === 1 && entity[0] == undefined)) {
            saveToCloud(data);
        }
        else {
            console.log("Entry already exists for date:", data.key.name);
        }
    })["catch"](function (err) {
        console.log("Error searching for key", data.key);
    });
}
function saveToCloud(data) {
    datastore.save(data)
        .then(function () {
        console.log("Saved data with key: ", data.key);
    })["catch"](function (err) {
        console.log("Error while saving to google cloud:", err);
    });
}
function prepare(entity) {
    var key = datastore.key([entity[datastore.KEY].kind, entity.date]);
    var data = new EntryData(entity.date, entity.weight, entity.keywords, entity.text);
    var googleCloudData = new GoogleCloudData(key, data);
    return googleCloudData;
}
migrateTo('Log3');
//   // entities = An array of records.
//
//   // Access the Key object for an entity.
//   const firstEntityKey = entities[0][datastore.KEY];
// });
