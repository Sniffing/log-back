import express from 'express';
import { Request, Response } from 'express';
import { 
	ERROR_RESPONSES, 
	GOOGLE_LOG_ENTRY_KEY, 
	reverseDate, 
	mergeWordMetrics 
} from '../constants';
import { services } from '../server';
import { ILogEntryDTO, ILogEntry } from '../interfaces';
import { RunQueryResponse } from '@google-cloud/datastore/build/src/query';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
	const firstQuery = services.query(GOOGLE_LOG_ENTRY_KEY)
		.order('date')
		.limit(1);

	const lastQuery = services.query(GOOGLE_LOG_ENTRY_KEY)
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

router.post('/', async (req: Request, res: Response) => {
	const body = req.body;
	const data: ILogEntryDTO = formatData(body);

	try {
		await services.logEntryService.saveEntry(data);
		console.log('Saved data with key: ', data.key);
		res.status(200).send(data);
	} catch (error) {
		console.error('Error saving data to db', error, data);
		res.status(500).send(error);
	}
});

router.get('/weights', async (req: Request, res: Response) => {
	try {
		const weights = await services.logEntryService.getWeight();
		console.log(`Returning ${weights.length} weight entries`);
		res.status(200).send(weights);
	} catch (error) {
		console.error('Could not fetch weight entries', error);
		res.status(500).send(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
	}  
});

router.get('/keywords', async (req: Request, res: Response) => {
	try {
		const keywords = await services.logEntryService.getKeywords();
		console.log(`Returning ${keywords.length} entries`);
		res.status(200).send(keywords);
	} catch (error) {
		console.error('Could not fetch keywords', error);
		res.status(500).send(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
	}
});

router.get('/texts', async (req: Request, res: Response) => {
	try {
		const text = await services.logEntryService.getText();
		console.log(`Returning ${text.length} text entries`);
		res.status(200).send(text);
	} catch (error) {
		console.error(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
		res.status(500).send(ERROR_RESPONSES.COULD_NOT_FETCH_DATA);
	}
});

const formatData = (state: ILogEntry): ILogEntryDTO => {
	const date = reverseDate(state.dateState.date);
	const keywords = mergeWordMetrics(state.keywordsState, 
		state.booleanMetricState);

	return {
		key: services.createKeyFromArray([GOOGLE_LOG_ENTRY_KEY, date]),
		data: {
			date,
			weight: state.entryMetricState?.weight || '',
			keywords,
			text: state.textState.data,
		}
	};
};

export { router as LogEntriesApi };