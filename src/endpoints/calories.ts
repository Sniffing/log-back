import {
  ICalorieEntry,
  isTypeICalorieEntry,
} from '../services/calorie-entry/interfaces';
import { Request, Response } from 'express';

import { ERROR_RESPONSES } from '../constants';
import { UploadedFile } from 'express-fileupload';
import express from 'express';
import { services } from '../server';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await services.calorieEntryService.fetchCalories();
    console.log(`Returning ${events.length} calorie entries`);
    res.status(200).send(events);
  } catch (error) {
    console.error(ERROR_RESPONSES.COULD_NOT_FETCH_DATA, error);
    res.status(500).send(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
  }
});

router.post('/', async (req: Request, res: Response) => {
  const body = req.body;

  if (!isTypeICalorieEntry(body)) {
    res.status(406).send(ERROR_RESPONSES.INVALID_DATA);
    return;
  }

  const data: ICalorieEntry = body as ICalorieEntry;
  try {
    await services.calorieEntryService.saveCalories(data);
    console.log('Saved calorie entry ', data);
    res.status(200).send(data);
  } catch (error) {
    console.error('Error saving data to db', error, data);
    res.status(500).send(error);
  }
});

router.post('/upload', async (req: Request, res: Response) => {
  if (!req.files || Object.keys(req.files).length !== 1) {
    res.status(500).send('No file sent');
  }
  console.log(req.files.file);
  const csv = req.files.file as UploadedFile;
  const uploadPath = __dirname + '/files/' + csv.name;

  csv.mv(uploadPath, (err) => {
    if (err) {
      console.log('err', err);
      // res.status(500).send(err);
    }
  });

  try {
    await services.calorieEntryService.uploadCaloriesFromCSV(uploadPath);
  } catch (error) {
    console.log(error);
  }

  res.status(200).send('oop');
});

export { router as CalorieEntriesApi };
