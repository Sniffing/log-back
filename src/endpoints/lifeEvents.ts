import {
  ILifeEvent,
  isTypeILifeEvent,
} from '../services/event-entry/interfaces';
import { Request, Response } from 'express';

import { ERROR_RESPONSES } from '../constants';
import express from 'express';
import { services } from '../server';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await services.eventEntryService.fetchEvents();
    console.log(`Returning ${events.length} text entries`);
    res.status(200).send(events);
  } catch (error) {
    console.error(ERROR_RESPONSES.COULD_NOT_FETCH_DATA, error);
    res.status(500).send(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
  }
});

router.post('/', async (req: Request, res: Response) => {
  const body = req.body;

  if (!isTypeILifeEvent(body)) {
    res.status(406).send(ERROR_RESPONSES.INVALID_DATA);
    return;
  }

  const data: ILifeEvent = body as ILifeEvent;
  try {
    await services.eventEntryService.saveEvent(data);
    console.log('Saved event ', data);
    res.status(200).send(data);
  } catch (error) {
    console.error('Error saving data to db', error, data);
    res.status(500).send(error);
  }
});

export { router as LifeEventsApi };
