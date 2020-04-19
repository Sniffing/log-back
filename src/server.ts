import dotenv from 'dotenv';
import { join } from 'path';
import express from 'express';
import { Request, Response } from 'express';
import { json, urlencoded } from 'body-parser';
import { Datastore } from '@google-cloud/datastore';
import { GOOGLE_KIND_KEY, ERROR_RESPONSES, logEntryDataToKeywordDTO, logEntryDataToWeightDTO, logEntryDataToTextDTO, typeCheckEntriesAndFilterInvalid, reverseDate, mergeWordMetrics } from './constants'
import { ILogEntry, IWeightDTO, IKeywordDTO, ITextDTO, ILogEntryDTO, ILogEntryData, isTypeILogEntryData } from './interfaces';
import { RunQueryResponse } from '@google-cloud/datastore/build/src/query';

dotenv.config();
const app = express();
const port = 4000;

app.use(json()); // for parsing application/json
app.use(urlencoded({ extended: true }));
app.listen(port, () => {
  console.info(`Third Eye listening on port ${port}!`)
  console.info(`Be sure to run 'ngrok http ${port}'`);
});

const datastore = new Datastore({
  projectId: process.env.APP_ID
});

app.get('/', (req: Request, res: Response) => {
  res.sendFile(join(__dirname,'/web-page/public/','index.html'));
});

app.post('/', (req: Request, res: Response) => {
  const body = req.body;
  const data: ILogEntryDTO = formatData(body);

  try {
    saveIfDoesNotExist(data);
    console.log("Saved data with key: ", data.key);
    res.status(200).send(data);
  } catch (error) {
    console.error('Error saving data to db', error, data);
    res.status(500).send(error);
  }
});

app.get('/entries', async (req: Request, res: Response) => {
  const firstQuery = datastore.createQuery(GOOGLE_KIND_KEY)
                         .order('date')
                         .limit(1);

  const lastQuery = datastore.createQuery(GOOGLE_KIND_KEY)
                        .order('date', {descending: true})
                        .limit(1);  

  try {
    const first: RunQueryResponse = await firstQuery.run();
    const last: RunQueryResponse = await lastQuery.run();

    const firstAndLastEntries = {
      first: first[0][0].date,
      last: last[0][0].date
    };

    console.log('Found first and last entries', firstAndLastEntries);
    res.send(firstAndLastEntries);
  } catch (error) {
    console.error('Could not fetch date entries', error);
    res.status(500).send(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
  }  
});

app.get('/weight', async (req: Request, res: Response) => {
  const query = datastore.createQuery(GOOGLE_KIND_KEY)
                         .filter('weight', ">", "0");

  try {
    const entries: RunQueryResponse = await query.run();
  
    const result: IWeightDTO[] = typeCheckEntriesAndFilterInvalid(entries[0])
      .map(logEntryDataToWeightDTO);

    console.log(`Returning ${result.length} out of ${entries[0].length} weight entries`);
    res.send(result);
  } catch (error) {
    console.error('Could not fetch weight entries', error);
    res.status(500).send(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
  }  
});

app.get('/keywords', async (req: Request, res: Response) => {
  const query = datastore.createQuery(GOOGLE_KIND_KEY);

  try {
    const entries: RunQueryResponse = await query.run()
    let result: IKeywordDTO[] = typeCheckEntriesAndFilterInvalid(entries[0])
      .map(logEntryDataToKeywordDTO);

    console.log(`Returning ${result.length} out of ${entries[0].length} keyword entries`)
    res.send(result);
  } catch (error) {
    console.error('Could not fetch keywords', error);
    res.status(500).send(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
  }
});

app.get('/text', async (req: Request, res: Response) => {
  const query = datastore.createQuery(GOOGLE_KIND_KEY);

  try {
    const entries: RunQueryResponse = await query.run();
    const result: ITextDTO[] = typeCheckEntriesAndFilterInvalid(entries[0])
      .map(logEntryDataToTextDTO);

    console.log(`Returning ${result.length} out of ${entries[0].length} text entries`)
    res.send(result);
  } catch (error) {
    console.error(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
    res.status(500).send(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
  }
});

const saveIfDoesNotExist = async (data: ILogEntryDTO) => {
  let entry;
  try {
    entry = await datastore.get(data.key);
  } catch (error) {
    throw new Error(ERROR_RESPONSES.UNEXPECTED_ERROR_SEARCHING_KEY);
  }

  if (entry.length < 1 || (entry.length === 1 && entry[0] == undefined)) {
    try {
      saveToCloud(data);
    } catch (error) {
      throw error;
    }
  } else {
    console.error("Entry already exists for date:", data.key.name);
    throw new Error(ERROR_RESPONSES.KEY_ALREADY_EXISTS);
  }
}

const formatData = (state: ILogEntry): ILogEntryDTO => {
  const date = reverseDate(state.dateState.date);

  return {
    key: datastore.key([GOOGLE_KIND_KEY, date]),
    data: {
      date,
      weight: state.entryMetricState?.weight || '',
      keywords: mergeWordMetrics(state.keywordsState, state.booleanMetricState),
      text: state.textState.data,
    }
  }
}

const saveToCloud = async (data: ILogEntryDTO) => {
  try {
    await datastore.save(data);
  } catch (error) {
    throw new Error(ERROR_RESPONSES.COULD_NOT_SAVE_DATA);
  }
}
