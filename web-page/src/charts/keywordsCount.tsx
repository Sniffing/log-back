import React, { Component } from "react";
import { Select, message } from "antd";
import NumericInput from "../custom-components/numericInput";
import { observer, inject } from "mobx-react";
import { observable, runInAction, action } from "mobx";
import { RootStore } from "../stores/rootStore";

const { Option } = Select;

interface IProps {
  rootStore?: RootStore;
}

interface IGenericObject<T> {
  [key: string]: T;
}

@inject("rootStore")
@observer
class KeywordsCount extends Component<IProps> {
  @observable
  private bannedList: string[] = [];

  @observable
  private activeList: string[] = [];

  @observable
  private fullList: string[] = [];

  @observable
  private data: any[] = [];

  @observable
  private dictionary: IGenericObject<number> = {};

  @observable
  private displayTerms: any;

  @observable
  private cutoff: number = 0;

  public async componentDidMount() {
    if (!this.props.rootStore) {
      return;
    }

    try {
      await this.props.rootStore.fetchKeywords();
      this.data = this.props.rootStore.keywordsData;

      let localDictionary: IGenericObject<number> = {};
      for (var i = 0; i < this.data.length; i++) {
        const obj: any = this.data[i];

        for (var j = 0; j < obj.keywords.length; j++) {
          const word: string = obj.keywords[j];
          if (!localDictionary.hasOwnProperty(word)) {
            localDictionary[word] = 1;
          } else {
            localDictionary[word] += 1;
          }
        }
      }

      runInAction(() => {
        this.dictionary = localDictionary;
        this.sortAndFilterKeywords([]);
        this.fullList = Object.keys(this.dictionary);
        this.activeList = Object.keys(this.dictionary);
      });
    } catch (err) {
      message.error("Could not fetch keywords");
    }
  }

  @action
  private updateBlackList = (blacklist: any) => {
    this.bannedList = blacklist;
    this.activeList = this.fullList.filter(x => blacklist.includes(x));
    this.sortAndFilterKeywords(blacklist);
  };

  private sortAndFilterKeywords = (blacklist: any, value = 0) => {
    const displayTerms = Object.entries(this.dictionary)
      .filter(entry => !blacklist.includes(entry[0]))
      .filter((entry: any[]) => (value > 0 ? entry[1] > value : true))
      .map(entry => ({ key: entry[0], value: entry[1] }));

    displayTerms.sort((a, b) => {
      return -(a.value - b.value);
    });

    this.displayTerms = displayTerms;
    return displayTerms;
  };

  private filterAmount = (value: any) => {
    // const cutoff = value || 0;
    this.cutoff = value;
    this.sortAndFilterKeywords(this.bannedList, value);
  };

  public render() {
    const keywords = Array.isArray(this.displayTerms)
      ? this.displayTerms.map(({ key, value }) => (
          <li key={key}> {`${key}: ${value}`} </li>
        ))
      : [];

    const dropdownContent = this.fullList
      .sort()
      .map(key => <Option key={key}>{key}</Option>);

    return (
      <div>
        <h2>Number of days recorded: {this.data.length || " loading ..."} </h2>
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="Words to omit"
          onChange={this.updateBlackList}
        >
          {dropdownContent}
        </Select>
        <NumericInput value={this.cutoff} onChange={this.filterAmount} />
        <ul>{keywords}</ul>
      </div>
    );
  }
}

export default KeywordsCount;
