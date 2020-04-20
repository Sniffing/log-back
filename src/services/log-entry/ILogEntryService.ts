import { IKeywordDTO, ITextDTO, IWeightDTO, ILogEntryDTO } from "../../interfaces";

export interface ILogEntryService {
  getWeight: () => Promise<IWeightDTO[]>;
  getKeywords: () => Promise<IKeywordDTO[]>;
  getText: () => Promise<ITextDTO[]>;

  saveEntry: (data: ILogEntryDTO) => void;
}