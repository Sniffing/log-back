import { observable, runInAction } from "mobx";
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
    public weightData: WeightEntry[] = [];

    @observable
    public keywordsData: KeywordEntry[] = [];

    @observable
    public memories: Memory[] = [];

    public async fetchWeightData() {
        try {
            const response = await get('/weight');
            runInAction(() => {
                this.weightData = response.data;
            });
        } catch (err) {
            throw new Error(err);
        }
    }

    public async fetchKeywords() {
        try {
            const response = await get('/keywords');
            runInAction(() => {
                this.keywordsData = response.data;
            })
        } catch (err) {
            throw new Error(err);
        }
    }

    public async fetchMemory() {
        try {
            const response = await get('/text');
            runInAction(() => {
                this.memories = response.data
            })
        } catch (err) {
            throw new Error(err);
        }
    }

}

const rootStore = new RootStore();
export default rootStore;