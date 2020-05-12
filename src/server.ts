import dotenv from 'dotenv';
import { join } from 'path';
import express from 'express';
import { Request, Response } from 'express';
import { json, urlencoded } from 'body-parser';
import { Services } from './services/services';
import { LifeEventsApi, LogEntriesApi } from './endpoints';

dotenv.config();
const app = express();
const port = 4000;
const router = express.Router();

export const services = new Services(process.env.APP_ID);

app.use(json()); // for parsing application/json
app.use(urlencoded({ extended: true }));

router.get('/', (req: Request, res: Response) => {
  res.sendFile(join(__dirname,'/web-page/public/','index.html'));
});

app.use('/logEntries', LogEntriesApi);
app.use('/lifeEvents', LifeEventsApi);

app.get('/flushCache', (req: Request, res: Response) => {
  services.resetCache();
  console.log("Cache flushed")
  res.status(200).send("Flushed");
})


app.listen(port, () => {
  console.info(`Third Eye listening on port ${port}!`)
  console.info(`Be sure to run 'ngrok http ${port}'`);
});
