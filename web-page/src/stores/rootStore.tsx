import { observable, runInAction, action } from "mobx";
import get from "axios";
import { ILogEntry } from "../entry";
import { Constants } from "../App.constants";

export interface WeightEntry {
  date: string;
  weight: string;
}

export interface KeywordEntry {
  date: string;
  keywords: string[];
}

export interface Memory {
  date: string;
  text: string;
}

export interface ILastDates {
  first: string;
  last: string;
}

export class RootStore {
  @observable
  public isFetchingData: boolean = false;

  @observable
  public isSavingData: boolean = false;

  @observable
  public isFetchingDates: boolean = false;

  @observable
  public weightData: WeightEntry[] = [];

  @observable
  public keywordsData: KeywordEntry[] = [];

  @observable
  public memories: Memory[] = [];

  @action
  public async fetchWeightData() {
    this.isFetchingData = true;
    try {
      const response = await get("/weight");
      runInAction(() => {
        this.weightData = response.data;
      });
    } catch (err) {
      throw new Error(err);
    } finally {
      this.isFetchingData = false;
    }
  }

  @action
  public async fetchKeywords() {
    this.isFetchingData = true;
    try {
      const response = await get("/keywords");
      runInAction(() => {
        this.keywordsData = response.data;
      });
    } catch (err) {
      throw new Error(err);
    } finally {
      this.isFetchingData = false;
    }
  }

  @action
  public async fetchMemory() {
    this.isFetchingData = true;
    try {
      const response = await get("/text");
      runInAction(() => {
        this.memories = response.data;
      });
    } catch (err) {
      throw new Error(err);
    } finally {
      this.isFetchingData = false;
    }
  }

  @action
  public async fetchLastDates() {
    this.setFetchingDates(true);
    try {
      const result: Response = await fetch(
        Constants.DATABASE_URL + "/entries",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        }
      );

      return (await result.json()) as ILastDates;
      // return Promise.resolve({ first: "2018-07-15", last: "2019-11-02" });
    } catch (error) {
      throw new Error(error);
    } finally {
      this.setFetchingDates(false);
    }
  }

  @action.bound
  private setFetchingDates(value: boolean) {
    this.isFetchingDates = value;
  }

  @action.bound
  private setSavingData(value: boolean) {
    this.isSavingData = value;
  }

  public saveEntry = async (data: ILogEntry) => {
    // this.setSavingData(true);
    // try {
    //   await fetch(Constants.DATABASE_URL, {
    //     method: "POST",
    //     headers: {
    //       Accept: "application/json",
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify(data)
    //   });
    // } catch (error) {
    //   throw new Error(error);
    // } finally {
    //   this.setSavingData(false);
    // }
    console.log(data);
  };
}

const rootStore = new RootStore();
export default rootStore;
