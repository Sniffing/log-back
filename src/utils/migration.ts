import { ILogEntryDTO } from '../interfaces';

const Datastore = require('@google-cloud/datastore');
const datastore = Datastore({
  projectId: process.env.APP_ID,
});

class GoogleCloudData {
  key: any;
  data: EntryData;

  constructor(key: any, data: EntryData) {
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

function migrateTo(newKindName: string) {
  datastore.runQuery(query, (_: any, entities: any[]) => {
    entities.forEach((entity: any) => {
      let newKey = entity[datastore.KEY];
      newKey.kind = newKindName;
      entity[datastore.KEY] = newKey;
      saveIfDoesNotExist(prepare(entity));
    });
  });
}

function emptyEntity(entity: ILogEntryDTO[]): boolean {
  return entity.length < 1 || (entity.length === 1 && entity[0] === undefined);
}

function saveIfDoesNotExist(data: GoogleCloudData) {
  datastore
    .get(data.key)
    .then((entity: ILogEntryDTO[]) => {
      if (emptyEntity(entity)) {
        saveToCloud(data);
      } else {
        console.log('Entry already exists for date:', data.key.name);
      }
    })
    .catch(() => {
      console.log('Error searching for key', data.key);
    });
}

function saveToCloud(data: GoogleCloudData) {
  datastore
    .save(data)
    .then(() => {
      console.log('Saved data with key: ', data.key);
    })
    .catch((err: any) => {
      console.log('Error while saving to google cloud:', err);
    });
}

function prepare(entity: any) {
  let key = datastore.key([entity[datastore.KEY].kind, entity.date]);
  let data = new EntryData(
    entity.date,
    entity.weight,
    entity.keywords,
    entity.text,
  );

  const googleCloudData = new GoogleCloudData(key, data);
  return googleCloudData;
}

migrateTo('Log3');
//   // entities = An array of records.
//
//   // Access the Key object for an entity.
//   const firstEntityKey = entities[0][datastore.KEY];
// });
