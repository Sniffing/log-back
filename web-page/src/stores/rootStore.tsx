import { observable, runInAction, action } from "mobx";
import get from 'axios';

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

export class RootStore {
    @observable
    public isFetchingData: boolean = false;

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
            const response = await get('/weight');
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
            const response = await get('/keywords');
            runInAction(() => {
                this.keywordsData = response.data;
            })
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
            const response = await get('/text');
            runInAction(() => {
                this.memories = response.data
            })
        } catch (err) {
            throw new Error(err);
        } finally {
            this.isFetchingData = false;
        }
    }

}

const rootStore = new RootStore();
export default rootStore;