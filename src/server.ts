import dotenv from 'dotenv';
import { join } from 'path';
import express from 'express';
import { Request, Response } from 'express';
import { json, urlencoded } from 'body-parser';
import { enableAll, info, error } from 'loglevel';
import { Datastore } from '@google-cloud/datastore';
import { GOOGLE_KIND_KEY, ERROR_RESPONSES } from './constants'
import { ILogEntry, IWeightDTO, IKeywordDTO, ITextDTO, ILogEntryDTO, BooleanMetric, ILogEntryData, isTypeILogEntryData } from './interfaces';
import { RunQueryResponse } from '@google-cloud/datastore/build/src/query';

dotenv.config();
const app = express();
const port = 4000;
enableAll();

app.use(json()); // for parsing application/json
app.use(urlencoded({ extended: true }));
app.listen(port, () => {
  info(`Third Eye listening on port ${port}!`)
  info(`Be sure to run 'ngrok http ${port}'`);
});

const datastore = new Datastore({
  projectId: process.env.APP_ID
});

app.get('/', (req: Request, res: Response) => {
  res.sendFile(join(__dirname,'/web-page/public/','index.html'));
})

app.post('/', (req: Request, res: Response) => {
  const body = req.body;
  const data: ILogEntryDTO = formatData(body);
  saveIfDoesNotExist(data, res);
})

app.get('/entries', async (err: Error, req: Request, res: Response) => {
  const firstQuery = datastore.createQuery(GOOGLE_KIND_KEY)
                         .order('date')
                         .limit(1);

  const lastQuery = datastore.createQuery(GOOGLE_KIND_KEY)
                        .order('date', {descending: true})
                        .limit(1);  

  const first: RunQueryResponse = await firstQuery.run();
  const last: RunQueryResponse = await lastQuery.run();

  if (!isTypeILogEntryData(first) || !isTypeILogEntryData(last)) {
    console.error('Retrieved data did not fit type ILogData', err.stack);
    res.status(500).send(ERROR_RESPONSES.STORE_DATA_DOES_NOT_MATCH_TYPES);
  }

  const firstAndLastEntries = {
    first: first[0][0].date,
    last: last[0][0].date
  };

  console.log('Found first and last entries', firstAndLastEntries);
  res.send(firstAndLastEntries);
})

app.get('/weight', async (req: Request, res: Response) => {
  const query = datastore.createQuery(GOOGLE_KIND_KEY)
                         .filter('weight', ">", "0");

  const entries = await query.run();
  const result: IWeightDTO[] = entries.map((entry: any) => {
      return {
        date: entry.date, 
        weight: entry.weight
      }
    });

  res.send(result);
});

app.get('/keywords', (req: Request, res: Response) => {
  const query = datastore.createQuery(GOOGLE_KIND_KEY);
  let result: IKeywordDTO[] = [];
  query.run((err, entities: any) => {
    console.log("There were %s entities retrieved", entities.length);
    for (var i = 0; i < entities.length; i++) {
      result.push({
        date: entities[i].date, 
        keywords: entities[i].keywords
      });
    }
    res.send(result);
  });
});

app.get('/text', (req: Request, res: Response) => {
  const query = datastore.createQuery(GOOGLE_KIND_KEY);
  let result: ITextDTO[] = [];
  query.run((err, entities: any) => {
    console.log("There were %s entities retrieved", entities.length);

    for (var i = 0; i < entities.length; i++) {
      result.push({"date": entities[i].date, "text": entities[i].text})
    }
    res.send(result);
  });
});

let saveIfDoesNotExist = (data: ILogEntryDTO, res: Response) => {
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

const metricsToList = (jsonState: Partial<Record<BooleanMetric, boolean>>) => {
  var list = [];
  for (var key in jsonState) {
    if (jsonState[key as BooleanMetric]) {
      list.push(key.toLowerCase());
    }
  }

  return list;
}

const reverseDate = (date: string) => {
  let parts = date.split("-");
  return parts[2] + "-" + parts[1] + "-" + parts[0];
}

const formatData = (state: ILogEntry): ILogEntryDTO => {
  const data: ILogEntryDTO = {
    key: datastore.key([GOOGLE_KIND_KEY, reverseDate(state.dateState.date)]),
    data: {
      date: reverseDate(state.dateState.date),
      weight: state.entryMetricState?.weight,
      keywords: state.keywordsState.keywords.map(k => k.toLowerCase()).concat(metricsToList(state.booleanMetricState)),
      text: state.textState.data,
    }
  }

  return data;
}

const saveToCloud = (data: ILogEntryDTO, res: Response) => {
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
