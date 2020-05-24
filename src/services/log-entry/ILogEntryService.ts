import { IKeywordDTO, ILogEntry, ITextDTO, IWeightDTO } from '../../interfaces';

export interface ILogEntryService {
  getWeight: () => Promise<IWeightDTO[]>;
  getKeywords: () => Promise<IKeywordDTO[]>;
  getText: () => Promise<ITextDTO[]>;
  saveEntry: (data: ILogEntry) => void;
}
