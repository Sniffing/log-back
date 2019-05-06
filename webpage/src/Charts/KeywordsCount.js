import React, { Component } from 'react';
import { Select } from 'antd';
import NumericInput from '../CustomComponents/NumericInput'

const { Option } = Select;

class KeywordsCount extends Component {
  state = {
    bannedList:[],
    activeList: [],
    fullList:[],
    data:[],
    dictionary: {},
    displayTerms: {},
    cutoff: 0,
  };

  async componentDidMount() {
    this.callApi()
      .then(res => {
        this.setState({data:res});
        const localDictionary = {};
        for (var i = 0; i < this.state.data.length; i++) {
          let obj = this.state.data[i];

          for (var j = 0; j < obj.keywords.length; j++) {
            if (!localDictionary.hasOwnProperty(obj.keywords[j])){
              localDictionary[obj.keywords[j]] = 1;
            } else {
              localDictionary[obj.keywords[j]] += 1;
            }
          }
        }

        this.setState({dictionary: localDictionary});
        this.sortAndFilterKeywords([]);

        this.setState({fullList: Object.keys(this.state.dictionary)});
        this.setState({activeList: Object.keys(this.state.dictionary)});
      })
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('http://localhost:3000/keywords');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  updateBlackList = (blacklist) => {
    this.setState({
      bannedList: blacklist,
      activeList: this.state.fullList.filter(x => blacklist.includes(x)),
    });
    this.sortAndFilterKeywords(blacklist);
  }

  sortAndFilterKeywords = (blacklist, value = 0) => {
    const displayTerms = Object.entries(this.state.dictionary)
    .filter(entry => !blacklist.includes(entry[0]))
    .filter(entry => value > 0 ? entry[1] > value : true)
    .map(entry =>
      ({ "key": entry[0], "value": entry[1]})
    );

    displayTerms.sort((a,b) => {
      return -(a.value - b.value);
    });

    this.setState({displayTerms: displayTerms});
    return displayTerms;
  }

  filterAmount = (value) => {
    // const cutoff = value || 0;
    this.setState({cutoff: value});
    this.sortAndFilterKeywords(this.state.bannedList, value);
  }

  render() {
    const keywords = Array.isArray(this.state.displayTerms) ? this.state.displayTerms.map(({key, value}) =>
      <li key={key}> {`${key}: ${value}`} </li>
    ) : [] ;

    const dropdownContent = this.state.fullList.sort()
                              .map(key => <Option key={key}>{key}</Option>);

    return (
        <div>
          <h2>Number of days recorded: {this.state.data.length || ' loading ...'} </h2>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Words to omit"
            onChange={this.updateBlackList}
          >
            { dropdownContent }
          </Select>
          <NumericInput value={this.state.cutoff} onChange={this.filterAmount} />
          <ul>
            {keywords}
          </ul>
        </div>
    );
  }
}

export default KeywordsCount;
