import React from "react";
import { message } from 'antd';
import { RootStore } from '../stores/rootStore';
import { inject, observer } from 'mobx-react';
import { observable, runInAction, action } from 'mobx';
import NumericInput from '../custom-components/numericInput';
import { pull } from 'lodash';
import { IGenericObject } from '../App.constants';
import { dummyData, WordCount, KeywordDays, KeywordList, KeywordTreemap, KeywordMonths } from './';


interface IProps {
  rootStore?: RootStore;
}

@inject("rootStore")
@observer
export class KeywordPage extends React.Component<IProps> {
  @observable
  private bannedList: string[] = [];

  @observable
  private activeList: string[] = [];

  @observable
  private fullList: string[] = [];

  @observable
  private data: any[] = [];

  @observable
  private cutoff: number = 5;

  @observable
  private dictionary: IGenericObject<number> = {};

  @observable
  private displayTerms: WordCount[] = [];

  public async componentDidMount() {
    if (!this.props.rootStore) {
      return;
    }

    try {
      // await this.props.rootStore.fetchKeywords();
      // this.data = this.props.rootStore.keywordsData; 
      this.data = dummyData;
    
      runInAction(() => {
        this.dictionary = this.countWords();
        this.sortAndFilterKeywords([]);
        this.fullList = Object.keys(this.dictionary);
        this.activeList = Object.keys(this.dictionary);
      });
    } catch (err) {
      message.error("Could not fetch keywords");
      console.log(err);
    }
  }

  private countWords = () => {
    const localDictionary: IGenericObject<number> = {};

    this.data.forEach((datum: any) => {
      datum.keywords.forEach((word: string) => {
        if (!localDictionary.hasOwnProperty(word)) {
          localDictionary[word] = 1;
        } else {
          localDictionary[word] += 1;
        }
      });
    });

    return localDictionary;
  }

  @action
  private toggleInBlackList = (word: string) => {
    if(this.bannedList.includes(word)) {
      pull(this.bannedList, word);
    } else {
      this.bannedList.push(word);
    }
    this.activeList = this.fullList.filter(x => this.bannedList.includes(x));
    this.sortAndFilterKeywords(this.bannedList);
  }
  
  private filterAmount = (value: any) => { 
    this.cutoff = value || 0;
    this.sortAndFilterKeywords(this.bannedList, value);
  };

  private sortAndFilterKeywords = (blacklist: any, value = 0): WordCount[] => {
    const displayTerms: WordCount[] = Object.entries(this.dictionary)
      .filter(entry => !blacklist.includes(entry[0]))
      .filter((entry: any[]) => (value > 0 ? entry[1] > value : true))
      .map(entry => ({ key: entry[0], value: entry[1] }));

    displayTerms.sort((a, b) => {
      return -(a.value - b.value);
    });

    this.displayTerms = displayTerms;
    return displayTerms;
  };

  public render() {
    return (
      <div className="keyword-page">
        <h2>Number of days recorded: {this.data.length || " loading ..."} </h2>
        {/* <KeywordDays data={this.data} dictionary={this.displayTerms}/> */}
        <KeywordMonths data={this.data}/>
        <KeywordTreemap data={this.displayTerms} minCount={this.cutoff}/>
        <NumericInput value={this.cutoff} onChange={this.filterAmount}/>
        <KeywordList 
          list={this.displayTerms} 
          updateList={this.toggleInBlackList}
          minCount={this.cutoff}
          />
      </div>
    );
  }
}
