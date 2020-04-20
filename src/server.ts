import dotenv from 'dotenv';
import { join } from 'path';
import express from 'express';
import { Request, Response } from 'express';
import { json, urlencoded } from 'body-parser';
import { Datastore } from '@google-cloud/datastore';
import { GOOGLE_KIND_KEY, ERROR_RESPONSES, logEntryDataToKeywordDTO, logEntryDataToWeightDTO, logEntryDataToTextDTO, typeCheckEntriesAndFilterInvalid, reverseDate, mergeWordMetrics } from './constants'
import { ILogEntry, IWeightDTO, IKeywordDTO, ITextDTO, ILogEntryDTO, ILogEntryData, isTypeILogEntryData, ILifeEvent } from './interfaces';
import { RunQueryResponse } from '@google-cloud/datastore/build/src/query';
import { LogEntryService } from './services/log-entry/LogEntryService';
import { CachingService } from './services/caching/CachingService';

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

const cache = new CachingService();
const logEntryService = new LogEntryService(cache, datastore);

app.get('/', (req: Request, res: Response) => {
  res.sendFile(join(__dirname,'/web-page/public/','index.html'));
});

app.post('/', async (req: Request, res: Response) => {
  const body = req.body;
  const data: ILogEntryDTO = formatData(body);

  try {
    await logEntryService.saveEntry(data);
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
  try {
    const weights = await logEntryService.getWeight();
    console.log(`Returning ${weights.length} weight entries`);
    res.status(200).send(weights);
  } catch (error) {
    console.error('Could not fetch weight entries', error);
    res.status(500).send(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
  }  
});

app.get('/keywords', async (req: Request, res: Response) => {
  try {
    const keywords = await logEntryService.getKeywords();
    console.log(`Returning ${keywords.length} entries`)
    res.status(200).send(keywords);
  } catch (error) {
    console.error('Could not fetch keywords', error);
    res.status(500).send(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
  }
});

app.get('/text', async (req: Request, res: Response) => {
  try {
    const text = await logEntryService.getText();
    console.log(`Returning ${text.length} text entries`)
    res.status(200).send(text);
  } catch (error) {
    console.error(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
    res.status(500).send(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
  }
});

app.post('/lifeEvent', (req: Request, res: Response) => {
  const body = req.body;

  const data: ILifeEvent = body as ILifeEvent;

  try {
    //TODO: Log life event
    // console.log("Saved data with key: ", data.key);
    // res.status(200).send(data);
  } catch (error) {
    // console.error('Error saving data to db', error, data);
    // res.status(500).send(error);
  }
});

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